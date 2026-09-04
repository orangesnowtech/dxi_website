import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { getEvent, summarizeEventDeletion } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/**
 * What deleting this event would destroy.
 *
 * Read before the confirmation dialog draws, so the person about to press the
 * button is looking at the actual numbers rather than a generic warning. "This
 * cannot be undone" is not information; "this deletes 94 registrations, 61 of
 * which paid" is.
 *
 * Super admin only, matching DELETE. Anyone who cannot delete an event has no
 * reason to be counting up what deleting one would cost.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const { response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  const { slug } = await params;

  try {
    const event = await getEvent(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const impact = await summarizeEventDeletion(slug);

    return NextResponse.json({ event: { slug: event.slug, title: event.title }, impact });
  } catch (error) {
    console.error(`Failed to summarize deletion of ${slug}:`, error);
    return NextResponse.json(
      { error: "Could not work out what deleting this would affect." },
      { status: 500 }
    );
  }
}
