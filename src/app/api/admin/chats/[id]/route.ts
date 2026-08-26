import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  allMessages,
  appendMessage,
  getConversation,
  setMode,
} from "@/lib/bot/conversation";
import { MAX_USER_MESSAGE_LENGTH } from "@/lib/bot/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;

  try {
    const conversation = await getConversation(decodeURIComponent(id));

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    return NextResponse.json({
      conversation,
      messages: await allMessages(conversation.id),
    });
  } catch (error) {
    console.error("Failed to load chat:", error);
    return NextResponse.json({ error: "Could not load the conversation." }, { status: 500 });
  }
}

/**
 * An agent's reply.
 *
 * Taking a conversation also takes it out of the bot's hands: replying while
 * the bot still owns the thread would put two voices in front of one person.
 * So the mode is set to human here rather than left to a separate click
 * somebody would forget.
 */
export async function POST(request: NextRequest, { params }: Context) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;

  try {
    const conversationId = decodeURIComponent(id);
    const conversation = await getConversation(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const { text } = (await request.json()) as { text?: string };
    const message = (text || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Write something first." }, { status: 400 });
    }

    if (message.length > MAX_USER_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "That reply is too long." }, { status: 400 });
    }

    if (conversation.mode !== "human") {
      await setMode(conversationId, "human", session.email);
    } else if (conversation.awaitingAgent) {
      // Somebody has answered, so the handoff is no longer unattended and the
      // bot must not resume behind their back when the timeout passes.
      await setMode(conversationId, "human", session.email);
    }

    const stored = await appendMessage(conversationId, "agent", message, session.email);

    // Web conversations collect this on their next poll. Meta channels will
    // push it out through the same responder the bot uses.
    return NextResponse.json({ message: stored });
  } catch (error) {
    console.error("Failed to send agent reply:", error);
    return NextResponse.json({ error: "Could not send that reply." }, { status: 500 });
  }
}

/** Hands a conversation back to the bot, or takes it away again. */
export async function PATCH(request: NextRequest, { params }: Context) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;

  try {
    const { mode } = (await request.json()) as { mode?: string };

    if (mode !== "bot" && mode !== "human") {
      return NextResponse.json({ error: "Mode must be bot or human." }, { status: 400 });
    }

    await setMode(decodeURIComponent(id), mode, session.email);

    return NextResponse.json({ message: `Handed to the ${mode}`, mode });
  } catch (error) {
    console.error("Failed to change chat mode:", error);
    return NextResponse.json({ error: "Could not change the mode." }, { status: 500 });
  }
}
