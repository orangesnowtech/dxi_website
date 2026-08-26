import { NextRequest, NextResponse } from "next/server";
import { botIsConfigured } from "@/lib/bot/config";
import { handleIncomingMessage } from "@/lib/bot/conversation";
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
