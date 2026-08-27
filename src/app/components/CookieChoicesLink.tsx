"use client";

import { useEffect, useState } from "react";
import { analyticsPossible } from "@/lib/analytics";
import { clearConsent, onConsentChange, readConsent } from "@/lib/consent";

/**
 * The way back.
 *
 * Withdrawing consent has to be as easy as giving it, so once somebody has
 * answered, the footer carries a link that forgets the answer and brings the
 * banner back. Hidden while the banner is still up — there is nothing to
 * change yet — and hidden entirely where analytics never runs.
 */
export default function CookieChoicesLink() {
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const sync = () => setAnswered(analyticsPossible() && readConsent() !== null);

    sync();
    return onConsentChange(sync);
  }, []);

  if (!answered) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={clearConsent}
      className="underline underline-offset-4 transition-colors hover:text-white"
    >
      Cookie choices
    </button>
  );
}
