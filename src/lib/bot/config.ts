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

export function geminiModel() {
  return (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
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
