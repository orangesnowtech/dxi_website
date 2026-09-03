import crypto from "crypto";
import { graphApiVersion, metaAppSecret, whatsappToken } from "./config";
import type { IncomingMessage } from "./types";

/**
 * WhatsApp Cloud API: proving a delivery is genuine, reading it, and replying.
 *
 * Only text is handled. The agent answers in prose and its tools return links,
 * so an image or a voice note has nothing to be done with yet — they are
 * acknowledged rather than silently swallowed, which is the difference between
 * a customer thinking we are slow and a customer thinking we are broken.
 */

/**
 * Whether this request really came from our Meta app.
 *
 * The whole security model of the webhook. Without it the URL is an
 * unauthenticated way to make the site write Firestore documents and pay
 * Google for model calls, and the sender id — which is what a conversation is
 * keyed on — would be attacker-chosen.
 */
export function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = metaAppSecret();

  if (!appSecret || !signatureHeader) {
    return false;
  }

  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  const received = Buffer.from(signatureHeader);
  const computed = Buffer.from(expected);

  // Length-checked first: timingSafeEqual throws on a mismatch rather than
  // returning false, and a short header is the easy way to trigger that.
  return received.length === computed.length && crypto.timingSafeEqual(received, computed);
}

type WhatsAppBody = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: Array<{ profile?: { name?: string } }>;
        messages?: Array<{
          id?: string;
          from?: string;
          type?: string;
          text?: { body?: string };
          interactive?: {
            button_reply?: { title?: string };
            list_reply?: { title?: string };
          };
          image?: { caption?: string };
        }>;
      };
    }>;
  }>;
};

/**
 * Flattens a delivery into the messages the rest of the app understands.
 *
 * Meta nests three levels deep and batches unrelated things together —
 * delivery receipts and read receipts arrive down the same pipe as messages.
 * Everything that is not somebody typing is dropped here, so nothing above
 * this has to know the shape.
 */
export function parseWhatsApp(body: WhatsAppBody): IncomingMessage[] {
  const out: IncomingMessage[] = [];

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      const phoneNumberId = value.metadata?.phone_number_id ?? "";
      const profileName = value.contacts?.[0]?.profile?.name ?? "";

      for (const raw of value.messages ?? []) {
        if (!raw.from) continue;

        let text = "";

        if (raw.type === "text") {
          text = raw.text?.body ?? "";
        } else if (raw.type === "interactive") {
          text = raw.interactive?.button_reply?.title ?? raw.interactive?.list_reply?.title ?? "";
        } else if (raw.type === "image") {
          text = raw.image?.caption ?? "";
        }

        out.push({
          channel: "whatsapp",
          externalId: raw.from,
          text,
          businessId: phoneNumberId,
          messageId: raw.id,
          contactName: profileName,
          // Everything that is not text the agent can read. The route answers
          // these itself rather than paying for a model call on an empty string.
          unsupported: text.trim().length === 0,
        });
      }
    }
  }

  return out;
}

/** Sends a reply on the number the conversation arrived on. */
export async function sendWhatsAppText(
  phoneNumberId: string,
  to: string,
  text: string
): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion()}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        // The assistant hands out short links constantly; a preview makes them
        // look like something worth tapping rather than a bare string.
        text: { body: text, preview_url: true },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`WhatsApp send failed (${response.status}): ${await response.text()}`);
  }
}

/**
 * Marks the message read and shows a typing indicator.
 *
 * A model call plus a Firestore round trip is a few seconds of nothing
 * happening on the customer's screen. Best effort on purpose: this is a
 * courtesy, and failing it must never cost the reply that follows.
 */
export async function sendWhatsAppTyping(
  phoneNumberId: string,
  messageId: string
): Promise<void> {
  try {
    await fetch(`https://graph.facebook.com/${graphApiVersion()}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
        typing_indicator: { type: "text" },
      }),
    });
  } catch (error) {
    console.error("[meta] typing indicator failed:", error);
  }
}
