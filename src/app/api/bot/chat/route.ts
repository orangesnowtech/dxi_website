import { NextRequest, NextResponse } from "next/server";
import { botIsConfigured } from "@/lib/bot/config";
import {
  allMessages,
  conversationId,
  getConversation,
  handleIncomingMessage,
} from "@/lib/bot/conversation";
import { MAX_USER_MESSAGE_LENGTH } from "@/lib/bot/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The website widget's endpoint.
 *
 * No Meta approval, no tokens, no webhook handshake — which is why this ships
 * before the messaging channels and proves the agent, the tools and the
 * handoff end to end on its own.
 *
 * The session id comes from the browser. That is fine for what it is: it keys
 * a conversation so the widget has continuity, and it grants no access to
 * anything. Reading a thread back needs an admin session, not a guessed id.
 */

/** Rejects ids that are not ours, so nothing odd reaches a document path. */
const SESSION_PATTERN = /^[A-Za-z0-9_-]{12,64}$/;

/**
 * Polls for anything said since the widget last looked.
 *
 * This is what makes a handoff real on the website. The bot going quiet is
 * only half of it — without somewhere to collect the human's reply, escalation
 * would be a conversation that simply stops.
 *
 * Scoped to one session id, which is the caller's own conversation and grants
 * nothing else. Reading anybody else's needs an admin session.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get("sessionId") || "";
    const after = searchParams.get("after") || "";

    if (!SESSION_PATTERN.test(sessionId)) {
      return NextResponse.json({ error: "Bad session." }, { status: 400 });
    }

    const conversation = await getConversation(conversationId("web", sessionId));

    if (!conversation) {
      return NextResponse.json({ messages: [], mode: "bot" });
    }

    const since = new Date(after);
    const messages = (await allMessages(conversation.id)).filter(
      (message) =>
        (message.role === "assistant" || message.role === "agent") &&
        (Number.isNaN(since.getTime()) || new Date(message.at) > since)
    );

    return NextResponse.json({
      messages: messages.map((message) => ({ text: message.text, at: message.at })),
      mode: conversation.mode,
    });
  } catch (error) {
    console.error("[bot] poll failed:", error);
    return NextResponse.json({ messages: [], mode: "bot" });
  }
}

export async function POST(request: NextRequest) {
  if (!botIsConfigured()) {
    return NextResponse.json(
      { error: "The assistant is not available right now." },
      { status: 503 }
    );
  }

  try {
    const { sessionId, message } = (await request.json()) as {
      sessionId?: string;
      message?: string;
    };

    if (!sessionId || !SESSION_PATTERN.test(sessionId)) {
      return NextResponse.json({ error: "Bad session." }, { status: 400 });
    }

    const text = (message || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Say something first." }, { status: 400 });
    }

    if (text.length > MAX_USER_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "That message is too long. Could you shorten it?" },
        { status: 400 }
      );
    }

    const result = await handleIncomingMessage({
      channel: "web",
      externalId: sessionId,
      text,
    });

    return NextResponse.json({
      reply: result.reply,
      replyAt: result.replyAt,
      // Lets the widget say "someone will pick this up" rather than sitting
      // there looking broken when the bot has deliberately gone quiet.
      mode: result.mode,
    });
  } catch (error) {
    console.error("[bot] chat failed:", error);
    return NextResponse.json(
      { error: "Sorry — something went wrong. Try again, or message us on WhatsApp." },
      { status: 500 }
    );
  }
}
