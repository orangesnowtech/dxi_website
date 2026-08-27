"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackChatOpened } from "@/lib/analytics";

type Bubble = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "dxi_chat_session";

const OPENER =
  "Hi — I'm DXI's assistant. Ask me about what we do, our events, or the Academy. What are you working on?";

/**
 * Creates or recovers the session id that keys this browser's conversation.
 *
 * Only an identifier: it buys continuity in the widget and nothing else, since
 * reading a thread back requires an admin session. Wrapped because storage
 * throws outright in some privacy modes rather than returning null.
 */
function getSessionId(): string {
  const fresh = () =>
    `web${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const created = fresh();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    // Private window with storage blocked — the conversation simply will not
    // survive a reload, which is better than the widget refusing to open.
    return fresh();
  }
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([{ role: "assistant", text: OPENER }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [handedOff, setHandedOff] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  /** Newest message already on screen, so a poll only fetches what is new. */
  const lastSeenRef = useRef<string>(new Date().toISOString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Pin to the newest message as the thread grows.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, busy]);

  /**
   * Watches for anything a person types on the other side.
   *
   * Only runs once a conversation has been handed off, and only while the
   * window is open — polling every open widget on the site would be a request
   * per visitor per few seconds for messages that, in the bot's own
   * conversations, never arrive.
   */
  useEffect(() => {
    if (!open || !handedOff || !sessionId) return;

    let stopped = false;

    const tick = async () => {
      try {
        const response = await fetch(
          `/api/bot/chat?sessionId=${encodeURIComponent(sessionId)}&after=${encodeURIComponent(lastSeenRef.current)}`
        );
        if (!response.ok) return;

        const data = await response.json();

        for (const message of data.messages ?? []) {
          if (message.at > lastSeenRef.current) lastSeenRef.current = message.at;
          if (stopped) return;
          setBubbles((prev) => [...prev, { role: "assistant", text: message.text }]);
        }

        if (data.mode === "bot") setHandedOff(false);
      } catch {
        // A dropped poll is not worth telling anyone about; the next one runs
        // in a few seconds.
      }
    };

    const timer = setInterval(tick, 5000);
    tick();

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [open, handedOff, sessionId]);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy || !sessionId) return;

    setBubbles((prev) => [...prev, { role: "user", text }]);
    setDraft("");
    setBusy(true);

    try {
      const response = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (data.mode === "human") setHandedOff(true);

      // Advance past the reply we are about to render, or the first poll after
      // a handoff would hand it straight back and duplicate the bubble.
      if (data.replyAt) lastSeenRef.current = data.replyAt;

      // A null reply means a person owns the thread and the bot is staying
      // quiet on purpose — say so rather than leaving a dead window.
      setBubbles((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ??
            "Someone from the team is picking this up — they'll reply here shortly.",
        },
      ]);
    } catch (error) {
      setBubbles((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Sorry — that didn't go through. Try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  // The dashboard is staff answering these conversations; a customer-facing
  // chat bubble floating over it would be a way to talk to yourself.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          // Only the opening half. A close is not interest, and counting both
          // would make one curious visitor look like two.
          if (!open) trackChatOpened();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Chat with DXI"}
        className="fixed right-5 bottom-5 z-200 flex h-14 w-14 items-center justify-center bg-signal text-[22px] leading-none text-white shadow-[0_6px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span aria-hidden>{open ? "×" : "💬"}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat with DXI"
          className="fixed right-5 bottom-24 z-200 flex h-[min(560px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col border-2 border-ink bg-paper shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
        >
          <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-3">
            <div>
              <div className="font-disp text-[15px] uppercase leading-none text-white">
                DXI Assistant
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                {handedOff ? "A person is joining" : "Usually replies instantly"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="cursor-pointer border-none bg-transparent text-[22px] leading-none text-white"
            >
              ×
            </button>
          </div>

          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {bubbles.map((bubble, index) => (
              <div
                key={index}
                className={`max-w-[85%] px-3.5 py-2.5 text-[14.5px] leading-normal whitespace-pre-wrap ${
                  bubble.role === "user"
                    ? "ml-auto bg-ink text-white"
                    : "mr-auto border border-line bg-ash text-ink"
                }`}
              >
                {bubble.text}
              </div>
            ))}

            {busy && (
              <div className="mr-auto border border-line bg-ash px-3.5 py-2.5 font-mono text-[12px] text-smoke">
                typing…
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-line p-3">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about DXI…"
              maxLength={2000}
              className="min-w-0 flex-1 border-2 border-line bg-paper px-3 py-2.5 font-body text-[14.5px] text-ink transition-colors focus:border-signal focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={busy || !draft.trim()}
              className="shrink-0 bg-signal px-4 py-2.5 font-mono text-[13px] tracking-[0.04em] text-white transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:bg-smoke"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
