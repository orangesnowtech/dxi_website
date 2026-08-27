"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { analyticsPossible, isMeasurablePath } from "@/lib/analytics";
import { onConsentChange, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

/**
 * The cookie choice.
 *
 * Shown only where analytics would actually run — so never on localhost, never
 * on the preview backend, and never on /admin. Asking somebody to accept
 * cookies on a host that was never going to set any is theatre.
 *
 * Accept and Decline are given the same visual weight on purpose. A greyed-out
 * "Decline" beside a bright "Accept" is the pattern regulators single out, and
 * it makes the resulting consent worth less than no banner at all.
 */
export default function ConsentBanner() {
  const pathname = usePathname();

  /** `undefined` until read on the client — nothing renders during SSR. */
  const [choice, setChoice] = useState<ConsentChoice | null | undefined>(undefined);
  const [possible, setPossible] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPossible(analyticsPossible());
    setChoice(readConsent());

    // The footer's "Cookie choices" link clears the answer; this is how the
    // banner comes back without a reload.
    return onConsentChange((next) => setChoice(next));
  }, []);

  const showing = possible && choice === null && isMeasurablePath(pathname);

  // Moving focus is what makes this reachable by keyboard and announced by a
  // screen reader. Without it the banner is a decision some visitors are shown
  // and cannot take.
  useEffect(() => {
    if (showing) {
      acceptRef.current?.focus();
    }
  }, [showing]);

  if (!showing) {
    return null;
  }

  const decide = (next: ConsentChoice) => () => writeConsent(next);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      // Above the page but below the chat window, so it never traps the widget.
      className="fixed inset-x-0 bottom-0 z-190 border-t-2 border-ink bg-paper"
    >
      <div className="mx-auto flex w-full max-w-wrap flex-col gap-4 px-6 py-5 wide:flex-row wide:items-center wide:justify-between">
        <div className="min-w-0">
          <h2
            id="consent-heading"
            className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-signal"
          >
            Cookies
          </h2>
          <p className="max-w-[70ch] text-[14.5px] leading-relaxed text-smoke">
            We use Google Analytics to see which pages bring people in. It sets a cookie and
            records roughly where you are. Decline and we set nothing — the site works exactly
            the same either way.
          </p>
        </div>

        {/* pr-20 on the narrow layout keeps the buttons clear of the chat bubble. */}
        <div className="flex shrink-0 gap-3 pr-20 wide:pr-0">
          <button
            ref={acceptRef}
            type="button"
            onClick={decide("granted")}
            className="border-2 border-ink bg-ink px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-signal hover:bg-signal"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={decide("denied")}
            className="border-2 border-ink bg-paper px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:border-signal hover:text-signal"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
