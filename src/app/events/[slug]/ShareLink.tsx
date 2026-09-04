"use client";

import { useEffect, useState } from "react";
import { shareOrigin } from "@/lib/links";

/**
 * Copy-the-link control for an event.
 *
 * The origin comes from `shareOrigin`, not from the browser. This address is
 * about to be sent to somebody: a link copied off the preview backend would
 * name the preview backend in a message that outlives it.
 *
 * `shortPath` is the event's short link when it has one. What gets shared is
 * what travels, and this address is going into a WhatsApp message far more
 * often than a browser bar.
 *
 * Falls back to a selectable input where the clipboard API is unavailable,
 * which is any page not served over https and, historically, iOS. Silently
 * doing nothing on a tapped "Copy" button is worse than showing the text.
 */
export default function ShareLink({
  title,
  shortPath,
}: {
  title: string;
  shortPath?: string | null;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUrl(shareOrigin(window.location.origin) + (shortPath || window.location.pathname));
  }, [shortPath]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      // The native share sheet is the better answer on a phone, where "copy a
      // link" usually means "send this to someone".
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (error) {
      // A cancelled share sheet throws AbortError and is not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFailed(true);
    }
  };

  if (!url) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-smoke">
        Share this event
      </div>

      {failed ? (
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full max-w-[520px] border-2 border-line bg-paper px-3.5 py-3 font-mono text-[13px] text-ink focus:border-signal focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex max-w-full items-center gap-3 border-2 border-line bg-paper px-4 py-3 text-left transition-colors hover:border-signal"
        >
          <span className="truncate font-mono text-[13px] text-smoke">{url}</span>
          <span className="shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-signal">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      )}
    </div>
  );
}
