/**
 * Assistant configuration.
 *
 * Read through functions rather than module constants so a missing key is a
 * clear error at the moment of use, not a crash at import time that takes the
 * whole site's build down with it. The bot is an addition to this app, and it
 * must never be able to stop the marketing pages rendering.
 */

export function geminiApiKey() {
  return (process.env.GEMINI_API_KEY || "").trim();
}

/**
 * The Purch bot pins gemini-2.5-flash, which Google has since closed to new
 * API keys — it answers 404 with a pointer at the current flash model. Copying
 * that pin across would have looked like a broken integration.
 */
export function geminiModel() {
  return (process.env.GEMINI_MODEL || "gemini-3.6-flash").trim();
}

/** Whether the assistant is configured well enough to answer at all. */
export function botIsConfigured() {
  return geminiApiKey().length > 0;
}

/**
 * How long a handed-off conversation waits for a person before the bot picks
 * it back up.
 *
 * Silence is the worst outcome: somebody asked for a human, nobody was at the
 * desk, and the conversation simply died. Resuming is better than that.
 */
export function handoffTimeoutMinutes() {
  const raw = Number(process.env.BOT_HANDOFF_TIMEOUT_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : 15;
}

/** Cap on model calls per conversation per hour, to bound cost and abuse. */
export function hourlyMessageLimit() {
  const raw = Number(process.env.BOT_HOURLY_MESSAGE_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? raw : 40;
}

/* ── Meta channels (WhatsApp, Messenger, Instagram) ─────────────────────── */

/**
 * The Graph API version every outbound call is pinned to.
 *
 * Pinned rather than left to Meta's default because an unpinned call silently
 * moves to whatever is current, and a response shape changing under a live
 * webhook is the kind of breakage nobody attributes to Meta. Bumping it is a
 * config change, not a deploy.
 */
export function graphApiVersion() {
  return (process.env.META_GRAPH_VERSION || "v23.0").trim();
}

/**
 * The app secret, used to prove a webhook delivery actually came from Meta.
 *
 * Unlike the reference implementation this has no "skip when unset" escape
 * hatch. That endpoint is a public URL that writes to Firestore and spends
 * money on model calls; an unsigned request reaching the agent is not a
 * development convenience, it is an open door. No secret means no webhook.
 */
export function metaAppSecret() {
  return (process.env.META_APP_SECRET || "").trim();
}

/** The string echoed back to Meta during the webhook handshake. */
export function metaVerifyToken() {
  return (process.env.META_VERIFY_TOKEN || "").trim();
}

/** System-user token with the WhatsApp scopes. Sends on WhatsApp. */
export function whatsappToken() {
  return (process.env.WHATSAPP_TOKEN || "").trim();
}

/** The business number replies go out from when a conversation predates ours. */
export function whatsappPhoneNumberId() {
  return (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
}

/**
 * Token used to resolve Page tokens for Messenger and Instagram.
 *
 * Falls back to `WHATSAPP_TOKEN` so one all-scope system-user token in a single
 * secret can power all three channels — which is how a small team will
 * actually run this.
 */
export function metaPageToken() {
  return (process.env.META_PAGE_TOKEN || "").trim() || whatsappToken();
}

/**
 * Whether the Meta webhook should accept anything at all.
 *
 * Both halves matter: the verify token is what lets Meta complete the
 * handshake, and the app secret is what makes every delivery after it
 * trustworthy. With either missing the endpoint refuses rather than pretends.
 */
export function metaIsConfigured() {
  return metaVerifyToken().length > 0 && metaAppSecret().length > 0;
}
