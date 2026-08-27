/**
 * Analytics consent.
 *
 * Opt-in, not opt-out: nothing is measured and no analytics cookie is set
 * until somebody says yes. That is what the GDPR asks for and what the NDPR is
 * read to ask for, and it is the only version that is honest — a banner
 * announcing tracking that has already started is a notice, not a choice.
 *
 * Implemented by simply not starting the SDK rather than by starting it in a
 * denied mode. Consent Mode would leave gtag loaded and pinging with signals
 * stripped; this way a visitor who declines has nothing running at all.
 *
 * Browser-only, and every path fails soft. A browser with no localStorage —
 * private mode, storage disabled, an embedded webview — must still render the
 * site, and does: it simply never records the answer, so the banner asks again
 * next time. Asking twice is a far better failure than measuring someone who
 * said no.
 */

export type ConsentChoice = "granted" | "denied";

/**
 * Versioned, so a later change to what is collected can ask again rather than
 * inheriting a yes given for something narrower.
 */
const STORAGE_KEY = "dxi.analytics-consent.v1";

/** Notified when the answer changes, so the tag can start the moment it does. */
type Listener = (choice: ConsentChoice | null) => void;

const listeners = new Set<Listener>();

/** `null` means nobody has been asked yet, or the answer could not be read. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    // Storage can throw outright, not just return null — Safari in private
    // mode historically did. Treated as "not asked".
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // The choice still applies for this page view via the listeners below;
      // it just will not survive a reload.
    }
  }

  for (const listener of listeners) {
    listener(choice);
  }
}

/**
 * Forgets the answer so the banner asks again.
 *
 * This is what the footer's "Cookie choices" link calls. Withdrawing consent
 * has to be as easy as giving it, and a decision with no way back is not one.
 */
export function clearConsent() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to undo.
    }
  }

  for (const listener of listeners) {
    listener(null);
  }
}

/** Returns the unsubscribe, shaped so it can be returned straight from an effect. */
export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);

  return () => {
    // Braced deliberately: `Set.delete` returns a boolean, and React rejects a
    // cleanup function that returns anything at all.
    listeners.delete(listener);
  };
}
