/**
 * Short links.
 *
 * An event lives at `/events/lagos-growth-summit-2025`, which is fine on a web
 * page and hopeless everywhere the link actually travels — a WhatsApp reply, a
 * flyer, a voice note read out loud. A short link is a code the team owns and
 * can retarget, so the thing already printed on a poster keeps working after
 * the event moves.
 *
 * Deliberately free of imports, like `events.ts` and `referral.ts`, so the
 * admin dashboard, the route handlers and the assistant all decide what a
 * valid code and a valid target are the same way.
 */

export type ShortLink = {
  /** Normalised, lowercase. Doubles as the Firestore document id. */
  code: string;
  /** Where it sends people. A site path starting `/`, or an https URL. */
  target: string;
  /** What it is for, in the dashboard. Never shown to the public. */
  label: string;
  /**
   * Set when the link belongs to an event, so the event page and the assistant
   * can find the link for a slug without one being stored on the event itself.
   * `null` on a link somebody made by hand.
   */
  eventSlug: string | null;
  /** A paused link stops redirecting but keeps its counts. */
  active: boolean;
  clickCount: number;
  /** ISO, or null while nobody has followed it. */
  lastClickedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
};

/** The path every short link is served from. */
export const SHORT_LINK_PREFIX = "/r";

export const SHORT_LINK_MIN_LENGTH = 2;
export const SHORT_LINK_MAX_LENGTH = 32;

/**
 * Lowercase letters, digits and dashes.
 *
 * Lowercase because these get typed into phone keyboards from a printed page,
 * where a capital is one more thing to get wrong. Resolution normalises too,
 * so someone who types LAGOS25 still arrives.
 */
export const SHORT_LINK_PATTERN = /^[a-z0-9][a-z0-9-]{1,31}$/;

/**
 * Lowercases, turns whitespace and underscores into single dashes, and drops
 * everything else. Applied on both sides, so `/r/Lagos 25` typed by hand finds
 * the `lagos-25` the dashboard created.
 */
export function normalizeShortCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SHORT_LINK_MAX_LENGTH);
}

export function isValidShortCodeFormat(value: string) {
  return SHORT_LINK_PATTERN.test(value);
}

/** Where a code lives on this site. */
export function shortLinkPath(code: string) {
  return `${SHORT_LINK_PREFIX}/${code}`;
}

/**
 * The site's own address, for the places that have no request to read it from
 * — the assistant composing a reply for WhatsApp, or an email being built.
 *
 * Pages that *do* have a browser should keep reading `window.location.origin`
 * instead, the way `ShareLink` does: that stays right on the preview backend
 * and on localhost without this having to be configured per environment.
 */
export function siteOrigin() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  return configured || "https://dximarketing.com";
}

/** The full thing you would paste into a message. */
export function shortLinkUrl(code: string, origin: string = siteOrigin()) {
  return `${origin.replace(/\/+$/, "")}${shortLinkPath(code)}`;
}

/**
 * How a target is displayed once saved — a site path is shown against the
 * site's own address so it reads like the link it will become.
 */
export function describeLinkTarget(target: string, origin: string = siteOrigin()) {
  return target.startsWith("/") ? `${origin.replace(/\/+$/, "")}${target}` : target;
}

type TargetResult = { error: string; value: null } | { error: null; value: string };

/**
 * Cleans a target and says what is wrong with it if anything is.
 *
 * Two shapes are allowed and nothing else. A path starting `/` stays relative,
 * so a link made on the preview backend still works on the live domain. An
 * absolute address must be http(s): a `javascript:` or `data:` target would
 * turn a link the team hands out into a way to run code in a customer's
 * browser, and that is the one thing a redirect must never do.
 */
export function normalizeLinkTarget(value: string): TargetResult {
  const trimmed = (value || "").trim();

  if (!trimmed) {
    return { error: "Say where the link should send people.", value: null };
  }

  if (trimmed.length > 2000) {
    return { error: "That address is too long.", value: null };
  }

  // `//evil.com` is a protocol-relative URL, not a site path, and reads as one
  // at a glance. Refused rather than silently rewritten.
  if (trimmed.startsWith("//")) {
    return {
      error: "A link on this site must start with a single / — for example /events/my-event.",
      value: null,
    };
  }

  if (trimmed.startsWith("/")) {
    return { error: null, value: trimmed };
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;

  try {
    parsed = new URL(withProtocol);
  } catch {
    return {
      error: "That is not a web address. Use https://example.com/page, or /a-path on this site.",
      value: null,
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Only http and https addresses can be used as a target.", value: null };
  }

  return { error: null, value: parsed.toString() };
}

/**
 * Whether a target points back at the short link system, which is how a
 * redirect loop gets made by accident.
 */
export function targetLoopsBackTo(target: string, code: string) {
  const path = target.startsWith("/") ? target : safePathOf(target);
  return normalizeShortCode(path.replace(/^\/r\//, "")) === code && path.startsWith("/r/");
}

function safePathOf(target: string) {
  try {
    return new URL(target).pathname;
  } catch {
    return "";
  }
}

/**
 * A first guess at a code, from an event's title or slug.
 *
 * Kept to whole words so the result is still readable — "lagos-growth" rather
 * than "lagosgrow" — because a code nobody can say out loud is a code that
 * gets mistyped.
 */
export function suggestShortCode(seed: string) {
  const words = normalizeShortCode(seed).split("-").filter(Boolean);
  const picked: string[] = [];

  for (const word of words) {
    const length = picked.length === 0 ? word.length : picked.join("-").length + 1 + word.length;

    if (length > 16 && picked.length > 0) {
      break;
    }

    picked.push(word);

    if (picked.join("-").length >= 12) {
      break;
    }
  }

  // Trimmed hard at the end as well as by word: one very long word never hits
  // the boundary check above, and "antidisestablishmentarianism" is not a
  // short link by any reading.
  return picked.join("-").slice(0, 16).replace(/-+$/, "") || "link";
}

/** Four characters to break a tie when a suggested code is already taken. */
export function randomShortSuffix() {
  // No l, 1, o or 0: these are read off a screen and typed into a phone.
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let suffix = "";

  for (let index = 0; index < 4; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return suffix;
}
