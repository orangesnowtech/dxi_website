import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import { parseEventPayload, type EventPayload } from "@/lib/events";
import {
  countRegistrationsFor,
  deleteEvent,
  getEvent,
  saveEvent,
} from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  try {
    const event = await getEvent(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error(`Failed to load event ${slug}:`, error);
    return NextResponse.json({ error: "Could not load the event." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  try {
    const existing = await getEvent(slug);

    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const payload = (await request.json()) as EventPayload;
    const parsed = parseEventPayload({ ...payload, slug }, existing);

    if (parsed.values === null) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // The slug is the document id, so it is fixed once created. Renaming it
    // here would silently create a second event and leave every shared link
    // pointing at the old one.
    const { slug: _ignored, ...data } = parsed.values;

    await saveEvent(slug, data, session.email, { creating: false });

    return NextResponse.json({ message: "Event updated", slug });
  } catch (error) {
    console.error(`Failed to update event ${slug}:`, error);
    return NextResponse.json({ error: "Could not update the event." }, { status: 500 });
  }
}

/**
 * Permanently deletes an event. Super admin only, and only while nobody has
 * registered.
 *
 * Once a single person has a place, deleting the event would orphan their
 * registration and destroy the record of what they were promised. Archiving is
 * the reversible option and is what the dashboard steers towards.
 */
export async function DELETE(request: NextRequest, { params }: Context) {
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

    // Checked server-side too — the browser dialog is a convenience, not the
    // safeguard.
    const { confirmSlug } = (await request.json().catch(() => ({}))) as { confirmSlug?: string };

    if (confirmSlug?.trim().toLowerCase() !== slug) {
      return NextResponse.json(
        { error: "The typed event address did not match." },
        { status: 400 }
      );
    }

    const registrationCount = await countRegistrationsFor(slug);

    if (registrationCount > 0) {
      return NextResponse.json(
        {
          error: `This event has ${registrationCount} registration(s). Archive it instead — deleting it would orphan them.`,
        },
        { status: 409 }
      );
    }

    await deleteEvent(slug);

    return NextResponse.json({ message: "Event deleted", slug });
  } catch (error) {
    console.error(`Failed to delete event ${slug}:`, error);
    return NextResponse.json({ error: "Could not delete the event." }, { status: 500 });
  }
}
