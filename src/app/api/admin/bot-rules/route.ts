import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getHouseRules, saveHouseRules } from "@/lib/firebase/bot-rules";
import { MAX_HOUSE_RULES_LENGTH } from "@/lib/bot/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const rules = await getHouseRules();

    return NextResponse.json({
      rules,
      maxLength: MAX_HOUSE_RULES_LENGTH,
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Failed to read the assistant's house rules:", error);
    return NextResponse.json({ error: "Could not load the rules." }, { status: 500 });
  }
}

/**
 * Replaces the rules wholesale.
 *
 * A PUT rather than a PATCH because the whole point is one editable block: the
 * dashboard sends back what is in the box, and what is in the box is what the
 * assistant is told. Clearing it is a legitimate save, not a bad request —
 * that is how the rules get switched off.
 */
export async function PUT(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as { text?: string };
    const text = String(payload.text ?? "");

    // Refused rather than silently truncated: quietly dropping the end of what
    // somebody typed means rules they believe are in force and are not.
    if (text.length > MAX_HOUSE_RULES_LENGTH) {
      return NextResponse.json(
        {
          error: `That is ${text.length} characters. The limit is ${MAX_HOUSE_RULES_LENGTH}, because every one of them is re-sent on every message.`,
        },
        { status: 400 }
      );
    }

    const rules = await saveHouseRules(text, session.email);
    console.info(`${session.email} updated the assistant's house rules`);

    return NextResponse.json({
      message: text.trim()
        ? "Saved. The assistant follows these from its next reply."
        : "Cleared. The assistant is back to its built-in rules only.",
      rules,
    });
  } catch (error) {
    console.error("Failed to save the assistant's house rules:", error);
    return NextResponse.json({ error: "Could not save the rules." }, { status: 500 });
  }
}
