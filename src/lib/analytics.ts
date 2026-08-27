/**
 * Google Analytics, through the Firebase SDK.
 *
 * Everything here is browser-only and every path fails soft. Analytics is
 * measurement, not function: a blocked script, an ad blocker, a region where
 * IndexedDB is unavailable, or a missing measurement id must all end in the
 * site working exactly as before and nothing being recorded. Nothing in this
 * file may ever throw into a render.
 */

import type { Analytics } from "firebase/analytics";
import { readConsent } from "@/lib/consent";

/** The GA4 property, handed to us in the Firebase web app config. */
export const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "";

/**
 * The host whose traffic is real.
 *
 * Preview and production share one Firebase project, and therefore one GA4
 * property. Without this gate every click the team makes while testing on the
 * preview backend lands in the same reports as customer traffic, and the
 * numbers quietly stop meaning anything. Read from the browser rather than
 * configured per backend, the same reasoning as `ShareLink`.
 */
const PRODUCTION_HOST = "dximarketing.com";

/** Admin pages are internal. Measuring our own dashboard use is noise. */
export function isMeasurablePath(pathname: string) {
  return !pathname.startsWith("/admin");
}

/**
 * Whether this host would ever measure anything, consent aside.
 *
 * Separate from `analyticsEnabled` because the banner needs it: there is no
 * honest way to ask somebody to accept cookies on a host that was never going
 * to set any. On localhost and on preview, no banner and no tag.
 */
export function analyticsPossible() {
  if (typeof window === "undefined" || !measurementId) {
    return false;
  }

  // The escape hatch, for confirming the tag and the banner behave on preview
  // before either is trusted on the live site. Off unless deliberately set.
  if (process.env.NEXT_PUBLIC_ANALYTICS_FORCE === "1") {
    return true;
  }

  const host = window.location.hostname;

  return host === PRODUCTION_HOST || host.endsWith(`.${PRODUCTION_HOST}`);
}

/**
 * Whether to measure right now: a host that counts, and a visitor who agreed.
 *
 * Consent is re-read on every call rather than captured once, so a decision
 * made in the banner takes effect on the very next event without anything
 * having to be re-mounted.
 */
export function analyticsEnabled() {
  return analyticsPossible() && readConsent() === "granted";
}

/**
 * Resolved once and reused. `null` means the SDK was asked for and could not
 * run here — distinct from `undefined`, which means it has not been tried — so
 * a browser that cannot support analytics is not re-checked on every event.
 */
let instance: Analytics | null | undefined;
let pending: Promise<Analytics | null> | null = null;

/**
 * Loads the SDK and starts a session.
 *
 * Imported dynamically so `firebase/analytics` lands in its own chunk, fetched
 * after the page is interactive rather than sitting in the bundle every
 * visitor waits for. A marketing site's first paint is worth more than the
 * milliseconds this costs later.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (instance !== undefined) {
    return instance;
  }

  if (pending) {
    return pending;
  }

  // Checked before the memo is written, not inside it. Caching the `null` from
  // a visitor who simply had not answered yet would mean analytics never
  // started when they later said yes.
  if (!analyticsEnabled()) {
    return null;
  }

  pending = (async () => {
    try {
      const [{ getAnalytics, isSupported }, { getFirebaseClientApp }] = await Promise.all([
        import("firebase/analytics"),
        import("@/lib/firebase/client"),
      ]);

      // False on browsers without the storage the SDK needs, and in private
      // modes that withhold it. Not an error — just nothing to do.
      if (!(await isSupported())) {
        return null;
      }

      return getAnalytics(getFirebaseClientApp());
    } catch (error) {
      console.warn("Analytics did not start:", error);
      return null;
    }
  })();

  instance = await pending;
  pending = null;

  return instance;
}

/**
 * Records one event. Safe to call from anywhere, including before init.
 *
 * Deliberately fire-and-forget: no caller should ever await a measurement, and
 * a rejected promise here must not surface as an unhandled rejection in a
 * customer's console.
 */
export function track(name: string, params: Record<string, unknown> = {}) {
  void (async () => {
    try {
      const analytics = await initAnalytics();

      if (!analytics) {
        return;
      }

      const { logEvent } = await import("firebase/analytics");
      logEvent(analytics, name, params);
    } catch (error) {
      console.warn(`Analytics event "${name}" was not recorded:`, error);
    }
  })();
}

/* ── The events worth naming ────────────────────────────────────────────────
 *
 * Kept as functions rather than bare `track` calls at the call sites, so the
 * event names and their parameters are defined in one place. A typo'd event
 * name does not error anywhere — it silently becomes a second, near-identical
 * row in GA4 that nobody notices for a month.
 */

export function trackPageView(pagePath: string) {
  track("page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEventRegistration(details: {
  eventSlug: string;
  typeKey: string;
  status: string;
  feeNaira: number;
}) {
  track("event_registration", {
    event_slug: details.eventSlug,
    registration_type: details.typeKey,
    registration_status: details.status,
    // GA4 reads `value` and `currency` as revenue, which is what makes a paid
    // place show up as worth something rather than as one more click.
    value: details.feeNaira,
    currency: "NGN",
  });
}

export function trackApplicationSubmitted() {
  track("application_submitted", { form: "business_profile" });
}

export function trackChatOpened() {
  track("chat_opened", {});
}

export function trackWhatsAppClick(href: string) {
  track("whatsapp_click", { link_url: href, page_path: window.location.pathname });
}
