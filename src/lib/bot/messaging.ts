import { graphApiVersion, metaPageToken } from "./config";
import type { BotChannel, IncomingMessage } from "./types";

/**
 * Messenger and Instagram, which are one integration wearing two names.
 *
 * Both arrive in the same `entry[].messaging[]` shape and both reply through
 * `/me/messages` with a Page token — only the webhook's `object` field says
 * which is which. Instagram is deliberately taken through the Messenger
 * Platform rather than the standalone Instagram Login API for exactly this
 * reason: one code path, one token, one thing to keep working.
 */

type MessagingBody = {
  object?: string;
  entry?: Array<{
    id?: string;
    messaging?: Array<{
      sender?: { id?: string };
      recipient?: { id?: string };
      message?: {
        mid?: string;
        text?: string;
        is_echo?: boolean;
        attachments?: Array<{ type?: string }>;
      };
      postback?: { title?: string; payload?: string };
    }>;
  }>;
};

export function parseMessaging(body: MessagingBody, channel: BotChannel): IncomingMessage[] {
  const out: IncomingMessage[] = [];

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      if (!senderId) continue;

      // `is_echo` is our own outbound message coming back to us. Handling it
      // would answer ourselves, forever, at a Gemini call per lap.
      if (event.message?.is_echo) continue;

      const text = event.message?.text ?? event.postback?.title ?? "";
      const isMessage = Boolean(event.message || event.postback);

      // Delivery and read receipts share this pipe and are not conversation.
      if (!isMessage) continue;

      // The Page or IG account that received it — which is also what we have
      // to send back through, so it is stored on the conversation.
      const businessId = event.recipient?.id ?? entry.id ?? "";

      out.push({
        channel,
        externalId: senderId,
        text,
        businessId,
        messageId: event.message?.mid,
        unsupported: text.trim().length === 0,
        // Not awaited here. The conversation store calls it only when it is
        // about to create a conversation, so an established thread costs no
        // Graph call at all.
        resolveContactName: () => fetchProfileName(senderId, channel, businessId),
      });
    }
  }

  return out;
}

/**
 * Page tokens, resolved from the system-user token and cached.
 *
 * The one non-obvious part of this file. Messenger and Instagram will not
 * accept the system-user token directly on `/me/messages` — it has to be the
 * token belonging to the Page that received the message, and Instagram's
 * messages arrive keyed by the IG account id rather than the Page id. So both
 * ids are mapped to the same Page token.
 *
 * Cached for thirty minutes because it is one Graph call per reply otherwise,
 * and Page tokens fetched this way do not rotate on that timescale.
 */
let pageTokenCache: { tokens: Map<string, string>; expiresAt: number } | null = null;

async function pageTokenFor(businessId: string): Promise<string | null> {
  if (!pageTokenCache || pageTokenCache.expiresAt < Date.now()) {
    const tokens = new Map<string, string>();

    try {
      const response = await fetch(
        `https://graph.facebook.com/${graphApiVersion()}/me/accounts` +
          `?fields=id,access_token,instagram_business_account{id}` +
          `&access_token=${encodeURIComponent(metaPageToken())}`
      );

      if (response.ok) {
        const data = (await response.json()) as {
          data?: Array<{
            id: string;
            access_token?: string;
            instagram_business_account?: { id: string };
          }>;
        };

        for (const page of data.data ?? []) {
          if (!page.access_token) continue;
          tokens.set(page.id, page.access_token);
          if (page.instagram_business_account?.id) {
            tokens.set(page.instagram_business_account.id, page.access_token);
          }
        }
      } else {
        console.error("[meta] page token lookup failed:", response.status, await response.text());
      }
    } catch (error) {
      console.error("[meta] page token lookup error:", error);
    }

    // Cached even when empty, so a broken token does not turn every inbound
    // message into another failing Graph call.
    pageTokenCache = { tokens, expiresAt: Date.now() + 30 * 60_000 };
  }

  return pageTokenCache.tokens.get(businessId) ?? null;
}

async function callSendApi(businessId: string, payload: Record<string, unknown>): Promise<void> {
  const token = await pageTokenFor(businessId);

  if (!token) {
    throw new Error(`No Page token for ${businessId} — is the Page assigned to the system user?`);
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion()}/me/messages?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Send API failed (${response.status}): ${await response.text()}`);
  }
}

export async function sendMessagingText(
  businessId: string,
  to: string,
  text: string
): Promise<void> {
  await callSendApi(businessId, {
    recipient: { id: to },
    // RESPONSE keeps us inside the standard messaging window, which is what a
    // reply to somebody who just wrote in always is.
    messaging_type: "RESPONSE",
    message: { text },
  });
}

/** Best effort, like WhatsApp's — a courtesy that must not cost the reply. */
export async function sendMessagingTyping(businessId: string, to: string): Promise<void> {
  try {
    await callSendApi(businessId, { recipient: { id: to }, sender_action: "mark_seen" });
    await callSendApi(businessId, { recipient: { id: to }, sender_action: "typing_on" });
  } catch (error) {
    console.error("[meta] typing indicator failed:", error);
  }
}

/**
 * The sender's display name, so the dashboard lists a person rather than a
 * seventeen-digit id. WhatsApp hands this over in the webhook itself; here it
 * costs a Graph call, so it is fetched once when the conversation is created.
 */
export async function fetchProfileName(
  senderId: string,
  channel: BotChannel,
  businessId: string
): Promise<string> {
  const token = await pageTokenFor(businessId);
  if (!token) return "";

  const fields = channel === "instagram" ? "name,username" : "first_name,last_name";

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphApiVersion()}/${senderId}` +
        `?fields=${fields}&access_token=${encodeURIComponent(token)}`
    );

    if (!response.ok) return "";

    const data = (await response.json()) as {
      name?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };

    const name =
      channel === "instagram"
        ? data.name || data.username || ""
        : [data.first_name, data.last_name].filter(Boolean).join(" ");

    return name.trim();
  } catch (error) {
    console.error("[meta] profile lookup failed:", error);
    return "";
  }
}
