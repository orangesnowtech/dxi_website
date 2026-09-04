import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import { parseEventPayload, type EventPayload } from "@/lib/events";
import {
  countRegistrationsFor,
  getEvent,
  purgeEvent,
  saveEvent,
} from "@/lib/firebase/events";
import { deleteEventPosters } from "@/lib/firebase/storage";

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
 * Permanently deletes an event and everything that only existed because of it.
 * Super admin only.
 *
 * Archiving remains the reversible option, and the dashboard still steers
 * towards it. This is for the case archiving does not cover — a test event, a
 * duplicate, something created by mistake — where leaving it archived forever
 * is only litter.
 *
 * Three things stand between a click and a destroyed customer list: the super
 * admin check, the typed slug, and `deleteRegistrations`, which is a separate
 * answer to a separate question. The first two were already here; the third is
 * what makes deleting a populated event possible at all, and it is deliberately
 * not implied by the other two. GET ../export builds the spreadsheet that
 * should be taken first.
 */
export async function DELETE(request: NextRequest, { params }: Context) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

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
    const { confirmSlug, deleteRegistrations } = (await request.json().catch(() => ({}))) as {
      confirmSlug?: string;
      deleteRegistrations?: boolean;
    };

    if (confirmSlug?.trim().toLowerCase() !== slug) {
      return NextResponse.json(
        { error: "The typed event address did not match." },
        { status: 400 }
      );
    }

    const registrationCount = await countRegistrationsFor(slug);

    // Deleting the registrations along with the event is a second decision,
    // and it gets its own answer. Without it the old behaviour stands: an
    // event with people attached refuses to go, because deleting it silently
    // would take a paid customer list with it on a click meant for the event.
    if (registrationCount > 0 && !deleteRegistrations) {
      return NextResponse.json(
        {
          error: `This event has ${registrationCount} registration(s). Archive it instead, or confirm that you also want the registrations deleted.`,
          registrationCount,
          needsRegistrationConsent: true,
        },
        { status: 409 }
      );
    }

    const result = await purgeEvent(slug, session.email);

    // The poster is not in Firestore, so it is not part of the batch and its
    // failure must not undo one. Cleared after the records, and never allowed
    // to turn a completed deletion into an error.
    const postersDeleted = await deleteEventPosters(slug);

    console.info(
      `${session.email} deleted the event ${slug}: ${result.registrationsDeleted} registration(s), ${postersDeleted} poster file(s).`
    );

    return NextResponse.json({
      message: `Deleted ${slug}.`,
      slug,
      ...result,
      postersDeleted,
    });
  } catch (error) {
    console.error(`Failed to delete event ${slug}:`, error);
    return NextResponse.json({ error: "Could not delete the event." }, { status: 500 });
  }
}
