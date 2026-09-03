import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { deliver, parseInbound, showTyping } from "@/lib/bot/channels";
import { botIsConfigured, metaIsConfigured, metaVerifyToken } from "@/lib/bot/config";
import { handleIncomingMessage } from "@/lib/bot/conversation";
import { MAX_USER_MESSAGE_LENGTH, type IncomingMessage } from "@/lib/bot/types";
import { verifySignature } from "@/lib/bot/whatsapp";

/**
 * The single endpoint all three Meta channels deliver to.
 *
 * WhatsApp, Messenger and Instagram are three products of one Meta app, and
 * Meta posts all of them to whatever URL that app is configured with. They
 * arrive in different shapes, get flattened by `parseInbound`, and from there
 * are handled by exactly the same agent as the website widget.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The handshake Meta performs when the webhook URL is saved, and again
 * whenever the subscription is re-verified.
 *
 * Compared in constant time. The token is a shared secret, and a plain `===`
 * on a secret is the textbook place to leak one character at a time.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const configured = metaVerifyToken();

  if (!configured) {
    console.error("[meta] verification attempted with no META_VERIFY_TOKEN set.");
    return new NextResponse("Forbidden", { status: 403 });
  }

  const offered = Buffer.from(params.get("hub.verify_token") || "");
  const expected = Buffer.from(configured);
  const matches =
    offered.length === expected.length && crypto.timingSafeEqual(offered, expected);

  if (params.get("hub.mode") === "subscribe" && matches) {
    // Echoed verbatim as plain text. Meta compares the body byte for byte, so
    // a JSON wrapper or a trailing newline fails the handshake.
    return new NextResponse(params.get("hub.challenge") || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Whether we have already handled this exact message.
 *
 * Meta retries anything it does not get a 2xx for within about twenty seconds,
 * and a slow model call can cross that line. Without this, one retry is a
 * second answer to a question already answered — and a second Gemini bill for
 * it. `create` throws when the document exists, so the check and the claim are
 * a single write with no race between them.
 */
const DEDUPE_COLLECTION = "botInboundMessages";

async function claimMessage(messageId: string): Promise<boolean> {
  try {
    await firestore.collection(DEDUPE_COLLECTION).doc(messageId).create({
      at: new Date().toISOString(),
      // Read by a Firestore TTL policy on this field — see META_SETUP.md.
      // Without one this collection grows by a document per message forever,
      // to no purpose: Meta stops retrying within minutes, so a claim is
      // worthless within the hour.
      expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
    });
    return true;
  } catch {
    return false;
  }
}

/** Lets a retry actually retry a message that failed halfway through. */
async function releaseMessage(messageId: string): Promise<void> {
  try {
    await firestore.collection(DEDUPE_COLLECTION).doc(messageId).delete();
  } catch (error) {
    console.error("[meta] could not release a claim:", error);
  }
}

async function handle(message: IncomingMessage): Promise<void> {
  if (message.messageId && !(await claimMessage(message.messageId))) {
    console.log(`[meta] ignoring retry of ${message.messageId}`);
    return;
  }

  // Truncated rather than refused. On the website the widget can tell somebody
  // their message is too long before they send it; here it has already been
  // sent, and "that was too long" helps nobody.
  const text = message.text.slice(0, MAX_USER_MESSAGE_LENGTH);

  // Skipped for a message with nothing in it: that answer costs no model call,
  // so the dots would be gone before anybody saw them.
  if (!message.unsupported) {
    await showTyping(message);
  }

  const result = await handleIncomingMessage({ ...message, text });

  // Null when a person owns the conversation and the bot is deliberately
  // silent. Their reply goes out from the dashboard instead.
  if (!result.reply) {
    return;
  }

  try {
    await deliver(message.channel, message.externalId, result.reply, message.businessId);
  } catch (error) {
    // Caught here rather than thrown on, so the claim above is *not* released.
    // Everything expensive has already happened — the turn is stored and the
    // model has been paid for — and a send that failed on a bad token will
    // fail again on the retry, having bought a second model call to get there.
    // The reply is in the thread, where the dashboard can resend it by hand.
    console.error(`[meta] reply stored but not delivered on ${message.channel}:`, error);
  }
}

export async function POST(request: NextRequest) {
  // Read as text before anything else: the signature covers the raw bytes, and
  // parsing to JSON and re-serialising will not reproduce them.
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    console.error("[meta] rejected a delivery with a bad or missing signature.");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  if (!metaIsConfigured() || !botIsConfigured()) {
    // 200 on purpose. A 5xx makes Meta retry for hours and, after enough of
    // them, disable the subscription — which would need re-verifying by hand
    // once the missing key is set.
    console.error("[meta] delivery arrived while the assistant is not configured.");
    return NextResponse.json({ received: true });
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad JSON", { status: 400 });
  }

  // Processed inline rather than after the response. App Hosting throttles the
  // CPU once a request is answered, so work started and left running is work
  // that may simply never finish.
  for (const message of parseInbound(body)) {
    try {
      await handle(message);
    } catch (error) {
      // Swallowed per message: one failure must not cost the others in the
      // same delivery, and a non-2xx would have Meta resend all of them.
      console.error(`[meta] ${message.channel} message failed:`, error);

      // The claim is given back, so Meta's own retry is not silently
      // discarded as a duplicate of an attempt that never produced a reply.
      if (message.messageId) {
        await releaseMessage(message.messageId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
