import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { parseEventPayload, type EventPayload, type EventStatus } from "@/lib/events";
import { getEvent, listEvents, saveEvent } from "@/lib/firebase/events";
import { ensureEventShortLink, shortLinkCodesForEvents } from "@/lib/firebase/links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const status = request.nextUrl.searchParams.get("status");
    const events = await listEvents((status as EventStatus | "all") || undefined);

    // Sent alongside rather than stored on the event, so retargeting a link
    // never means rewriting the event it belongs to. A failure here costs the
    // short "Copy link" and nothing else, so the list still loads.
    const codes = await shortLinkCodesForEvents(events.map((event) => event.slug)).catch(
      (error) => {
        console.error("Could not read the events' short links:", error);
        return new Map<string, string>();
      }
    );

    return NextResponse.json({
      events,
      shortCodes: Object.fromEntries(codes),
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Failed to list events:", error);
    return NextResponse.json({ error: "Could not load events." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as EventPayload;
    const parsed = parseEventPayload(payload, null);

    if (parsed.values === null) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { slug, ...data } = parsed.values;

    // The slug is the document id and the public URL, so a clash is not a
    // merge — it is one event quietly overwriting another.
    if (await getEvent(slug)) {
      return NextResponse.json(
        { error: `An event already lives at /events/${slug}. Choose a different title or slug.` },
        { status: 409 }
      );
    }

    await saveEvent(slug, data, session.email, { creating: true });

    // Done here rather than inside saveEvent so a failure to arrange the short
    // link cannot roll back or fail an event that already saved. It returns
    // null on any trouble, and the links dashboard offers to make it by hand.
    const shortCode = await ensureEventShortLink(slug, data.title, session.email);

    return NextResponse.json({ message: "Event created", slug, shortCode }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Could not create the event." }, { status: 500 });
  }
}
