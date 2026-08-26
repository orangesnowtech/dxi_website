import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listConversations } from "@/lib/bot/conversation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = request.nextUrl;
    const filter = searchParams.get("filter") || "all";

    const conversations = await listConversations({
      // "waiting" is the one that matters on a busy day: somebody asked for a
      // person and nobody has answered yet.
      mode: filter === "waiting" ? "human" : "all",
      leadsOnly: filter === "leads",
      limit: Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200),
    });

    return NextResponse.json({
      conversations:
        filter === "waiting"
          ? conversations.filter((conversation) => conversation.awaitingAgent)
          : conversations,
      viewer: { email: session.email },
    });
  } catch (error) {
    console.error("Failed to list chats:", error);
    return NextResponse.json({ error: "Could not load conversations." }, { status: 500 });
  }
}
