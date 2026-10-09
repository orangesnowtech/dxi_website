import { recordEmail } from "./firebase/email-log";

export type ZeptoConfig = {
  token: string;
  bounceAddress: string;
  fromAddress: string;
};

export function getZeptoConfig(): ZeptoConfig {
  const bounceAddress = (
    process.env.ZEPTOMAIL_BOUNCE_ADDRESS ||
    process.env.ZEPTOMAIL_SENDER_ADDRESS ||
    "info@dximarketing.com"
  ).trim();

  const fromAddress = (
    process.env.ZEPTOMAIL_SENDER_ADDRESS ||
    bounceAddress ||
    "info@dximarketing.com"
  ).trim();

  return {
    token: (process.env.ZEPTOMAIL_TOKEN || process.env.NEXT_PUBLIC_ZEPTOMAIL_TOKEN || "").trim(),
    bounceAddress,
    fromAddress,
  };
}

export function getBusinessProfileRecipient() {
  return (
    process.env.BUSINESS_PROFILE_RECIPIENT_EMAIL ||
    process.env.CONTACT_FORM_RECIPIENT_EMAIL ||
    "info@dximarketing.com"
  ).trim();
}

/** Where event registration alerts land. Falls back to the general inbox. */
export function getEventsRecipient() {
  return (
    process.env.EVENTS_RECIPIENT_EMAIL ||
    process.env.CONTACT_FORM_RECIPIENT_EMAIL ||
    "info@dximarketing.com"
  ).trim();
}

// Single implementation, kept next to the templates that need it most.
export { escapeHtml } from "./emails/academy";

/**
 * Sends one email, and writes it to the admin email log either way.
 *
 * The log is written here rather than by each caller so that it cannot be
 * forgotten: whatever sends, is logged. A failure is logged and then thrown as
 * before, so callers that swallow the error still leave a trace of it.
 */
export async function sendZeptoEmail(
  payload: Record<string, unknown>,
  token: string,
  /** Set by the dashboard's Resend, so the log shows what was a repeat. */
  resend?: { of: string; by: string }
) {
  try {
    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ZeptoMail error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    await recordEmail(
      payload,
      { status: "failed", error: error instanceof Error ? error.message : String(error) },
      resend
    );
    throw error;
  }

  await recordEmail(payload, { status: "sent" }, resend);
}
