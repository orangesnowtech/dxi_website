"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BOT_CHANNEL_LABELS, type BotConversation, type BotMessage } from "@/lib/bot/types";
import styles from "../../admin.module.css";

/** Refresh cadence. Fast enough to hold a conversation, cheap enough to leave open. */
const POLL_MS = 6000;

function when(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lagos",
      });
}

export default function Chats({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<BotConversation[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [selected, setSelected] = useState<BotConversation | null>(null);
  const [draft, setDraft] = useState("");
  /** Whether the composer sends to the customer or steers the bot. */
  const [kind, setKind] = useState<"reply" | "whisper">("reply");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const fetchList = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/chats?filter=${filter}`);

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load conversations");

      setConversations(data.conversations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  const fetchThread = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/chats/${encodeURIComponent(id)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load that conversation");

      setMessages(data.messages);
      setSelected(data.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Both panes refresh on a timer: a customer replying while an agent reads
  // should appear without anyone reaching for a reload.
  useEffect(() => {
    const timer = setInterval(() => {
      fetchList();
      if (selectedId) fetchThread(selectedId);
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [fetchList, fetchThread, selectedId]);

  useEffect(() => {
    if (selectedId) fetchThread(selectedId);
  }, [selectedId, fetchThread]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const sendReply = async () => {
    const text = draft.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/chats/${encodeURIComponent(selectedId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, kind }),
      });

      const data = await response.json();

      // A rejected delivery on a Meta channel still stored the message, and
      // the thread is the honest place to see that: the reply is there,
      // written by you, and the banner says it did not arrive. Clearing the
      // draft would invite typing it again and sending it twice.
      if (!response.ok) {
        if (data.message) await fetchThread(selectedId);
        throw new Error(data.error || "Could not send that");
      }

      setDraft("");
      await fetchThread(selectedId);
      await fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSending(false);
    }
  };

  const setMode = async (mode: "bot" | "human") => {
    if (!selectedId) return;

    await fetch(`/api/admin/chats/${encodeURIComponent(selectedId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });

    await fetchThread(selectedId);
    await fetchList();
  };

  const waiting = conversations.filter((c) => c.awaitingAgent).length;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Conversations</h1>
          <p className={styles.subtitle}>
            {configured
              ? "Everything the assistant is handling. Replying takes a conversation off the bot."
              : "The assistant is not configured — set GEMINI_API_KEY to switch it on."}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label htmlFor="filter">Show</label>
            <select
              id="filter"
              className={styles.select}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Everything</option>
              <option value="waiting">Waiting for a person</option>
              <option value="leads">Leads</option>
            </select>
          </div>

          <div className={styles.stats}>
            <span>
              Waiting: <strong>{waiting}</strong>
            </span>
            <span>
              Shown: <strong>{conversations.length}</strong>
            </span>
          </div>
        </div>

        <div className={styles.chatLayout}>
          <div className={styles.chatList}>
            {loading ? (
              <div className={styles.loading}>Loading…</div>
            ) : conversations.length === 0 ? (
              <div className={styles.empty}>Nothing here yet.</div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={`${styles.chatListItem} ${
                    selectedId === conversation.id ? styles.chatListItemActive : ""
                  }`}
                >
                  <div className={styles.chatListTop}>
                    <strong>{conversation.contactName || "Unknown visitor"}</strong>
                    {conversation.awaitingAgent && (
                      <span className={styles.waitingPill}>Waiting</span>
                    )}
                  </div>
                  <span className={styles.referralNote}>
                    {BOT_CHANNEL_LABELS[conversation.channel]} · {when(conversation.lastMessageAt)}
                    {conversation.isLead ? " · Lead" : ""}
                  </span>
                  <span className={styles.chatPreview}>{conversation.lastMessagePreview}</span>
                </button>
              ))
            )}
          </div>

          <div className={styles.chatThread}>
            {!selected ? (
              <div className={styles.empty}>Pick a conversation.</div>
            ) : (
              <>
                <div className={styles.chatThreadHead}>
                  <div>
                    <strong>{selected.contactName || "Unknown visitor"}</strong>
                    <span className={styles.referralNote}>
                      {BOT_CHANNEL_LABELS[selected.channel]}
                      {selected.contactEmail ? ` · ${selected.contactEmail}` : ""}
                      {selected.contactPhone ? ` · ${selected.contactPhone}` : ""}
                    </span>
                    {selected.leadSummary && (
                      <span className={styles.referralNote}>{selected.leadSummary}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={selected.mode === "human" ? styles.deleteBtn : styles.revokeBtn}
                    onClick={() => setMode(selected.mode === "human" ? "bot" : "human")}
                  >
                    {selected.mode === "human" ? "Give back to the bot" : "Take over"}
                  </button>
                </div>

                <div ref={threadRef} className={styles.chatMessages}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.chatBubble} ${
                        message.role === "user"
                          ? styles.chatBubbleUser
                          : message.role === "whisper"
                            ? styles.chatBubbleWhisper
                            : message.role === "agent"
                              ? styles.chatBubbleAgent
                              : styles.chatBubbleBot
                      }`}
                    >
                      <span className={styles.chatBubbleMeta}>
                        {message.role === "user"
                          ? "Them"
                          : message.role === "whisper"
                            ? `Whisper · ${message.sentBy || "team"} · only the bot sees this`
                            : message.role === "agent"
                              ? message.sentBy || "Agent"
                              : "Assistant"}{" "}
                        · {when(message.at)}
                      </span>
                      {message.text}
                    </div>
                  ))}
                </div>

                <div className={styles.composerWrap}>
                  <div className={styles.composerModes}>
                    <button
                      type="button"
                      className={`${styles.composerMode} ${kind === "reply" ? styles.composerModeOn : ""}`}
                      onClick={() => setKind("reply")}
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      className={`${styles.composerMode} ${kind === "whisper" ? styles.composerModeWhisperOn : ""}`}
                      onClick={() => setKind("whisper")}
                    >
                      Whisper to bot
                    </button>
                    <span className={styles.composerHint}>
                      {kind === "whisper"
                        ? "Steers the bot from its next reply. The customer never sees it, and the bot keeps answering."
                        : selected.mode === "human"
                          ? "Goes straight to the customer."
                          : "Goes to the customer, and takes this conversation off the bot."}
                    </span>
                  </div>

                  <div className={styles.chatComposer}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      placeholder={
                        kind === "whisper"
                          ? "e.g. Do not quote below ₦400k. Push the Academy, not the Sales Engine."
                          : "Type your reply…"
                      }
                      className={`${styles.chatInput} ${kind === "whisper" ? styles.chatInputWhisper : ""}`}
                    />
                    <button
                      type="button"
                      className={styles.loginBtn}
                      style={{ width: "auto" }}
                      disabled={sending || !draft.trim()}
                      onClick={sendReply}
                    >
                      {sending ? "Sending…" : kind === "whisper" ? "Whisper" : "Send"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
