import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { EVENT_STATUSES, type EventStatus } from "@/lib/events";
import { getEvent, setEventStatus } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/**
 * Publishes, unpublishes, closes or archives an event in one call.
 *
 * Its own endpoint because the main PATCH runs the whole event through
 * `parseEventPayload`, which demands a title, a summary, a start time and at
 * least one registration type. Unpublishing something in a hurry should not
 * mean re-submitting all of that, and a status-only body would fail validation
 * on fields nobody was trying to change.
 */
export async function PATCH(request: NextRequest, { params }: Context) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  try {
    const { status } = (await request.json()) as { status?: string };

    if (!status || !(EVENT_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${EVENT_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const event = await getEvent(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    await setEventStatus(slug, status as EventStatus, session.email);

    return NextResponse.json({ message: "Status updated", slug, status });
  } catch (error) {
    console.error(`Failed to set status on event ${slug}:`, error);
    return NextResponse.json({ error: "Could not update the status." }, { status: 500 });
  }
}
