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

// Single implementation, kept next to the templates that need it most.
export { escapeHtml } from "./emails/academy";

export async function sendZeptoEmail(payload: Record<string, unknown>, token: string) {
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
}
