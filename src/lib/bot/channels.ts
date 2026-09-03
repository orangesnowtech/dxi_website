import { whatsappPhoneNumberId } from "./config";
import { parseMessaging, sendMessagingText, sendMessagingTyping } from "./messaging";
import { parseWhatsApp, sendWhatsAppText, sendWhatsAppTyping } from "./whatsapp";
import type { BotChannel, IncomingMessage } from "./types";

/**
 * The one place that knows which channel is which.
 *
 * Above this line a message is a message: the agent, the conversation store
 * and the dashboard all treat WhatsApp, Messenger, Instagram and the website
 * identically. Adding a fourth channel is an adapter and two lines here.
 */

/** Turns whatever Meta posted into our own messages, or nothing. */
export function parseInbound(body: unknown): IncomingMessage[] {
  const object = (body as { object?: string } | null)?.object;

  switch (object) {
    case "whatsapp_business_account":
      return parseWhatsApp(body as Parameters<typeof parseWhatsApp>[0]);
    case "page":
      return parseMessaging(body as Parameters<typeof parseMessaging>[0], "messenger");
    case "instagram":
      return parseMessaging(body as Parameters<typeof parseMessaging>[0], "instagram");
    default:
      return [];
  }
}

/**
 * Pushes a line of text out to a person on a Meta channel.
 *
 * Web is a deliberate no-op rather than an error: the widget polls for its
 * replies, so there is nothing to push, and making callers branch on that
 * would put channel knowledge back in the places this file exists to keep it
 * out of.
 */
export async function deliver(
  channel: BotChannel,
  externalId: string,
  text: string,
  businessId?: string
): Promise<void> {
  if (channel === "web") {
    return;
  }

  if (channel === "whatsapp") {
    // The stored number wins; the configured one is the fallback for
    // conversations that predate businessId being recorded.
    await sendWhatsAppText(businessId || whatsappPhoneNumberId(), externalId, text);
    return;
  }

  if (!businessId) {
    throw new Error(`No Page id stored for this ${channel} conversation.`);
  }

  await sendMessagingText(businessId, externalId, text);
}

/** Read receipt and typing dots, best effort. See the adapters. */
export async function showTyping(message: IncomingMessage): Promise<void> {
  if (message.channel === "whatsapp") {
    if (message.messageId) {
      await sendWhatsAppTyping(message.businessId || whatsappPhoneNumberId(), message.messageId);
    }
    return;
  }

  if (message.channel !== "web" && message.businessId) {
    await sendMessagingTyping(message.businessId, message.externalId);
  }
}
