import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import {
  normalizeRecordingSlug,
  parseRecordingPayload,
  type RecordingPayload,
  type RecordingStatus,
} from "@/lib/recordings";
import {
  deleteRecording,
  getRecording,
  listRecordings,
  saveRecording,
} from "@/lib/firebase/recordings";
import { listEvents } from "@/lib/firebase/events";
import { DEFAULT_ASPECT_PERCENT, parseLoomEmbed } from "@/lib/video/loom";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Turns whatever came out of Loom into the two fields we store.
 *
 * The form sends `loomEmbed` — the snippet, the share link or a bare id,
 * whichever the admin had on their clipboard. Doing it here rather than in
 * `recordings.ts` keeps that file free of imports and ignorant of Loom, which
 * is what lets the gate logic be read on its own.
 *
 * Shared by POST and PATCH so an edit cannot quietly accept a paste a create
 * would reject.
 *
 * `fallbackAspect` is what an edit already had stored. A share link or a bare
 * id says nothing about the video's shape, and re-saving a replay that way
 * should not squash a player that was set up correctly from a full embed.
 */
function readLoom(
  payload: RecordingPayload & { loomEmbed?: string },
  fallbackAspect = DEFAULT_ASPECT_PERCENT
) {
  const pasted = (payload.loomEmbed || "").trim();

  if (!pasted) {
    return { error: null as string | null, videoId: "", aspectPercent: fallbackAspect };
  }

  const parsed = parseLoomEmbed(pasted);

  if (!parsed) {
    return {
      error:
        "That does not look like a Loom video. Paste the embed code, the share link, or the 32-character id.",
      videoId: "",
      aspectPercent: fallbackAspect,
    };
  }

  return {
    error: null,
    videoId: parsed.videoId,
    aspectPercent: parsed.aspectPercent ?? fallbackAspect,
  };
}

/** Replays, plus the events one can be attached to. */
export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const status = request.nextUrl.searchParams.get("status");
    const [recordings, allEvents] = await Promise.all([
      listRecordings((status as RecordingStatus | "all") || undefined),
      listEvents("all"),
    ]);

    return NextResponse.json({
      recordings,
      events: allEvents.map((event) => ({
        slug: event.slug,
        title: event.title,
        startsAt: event.startsAt,
      })),
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Failed to list recordings:", error);
    return NextResponse.json({ error: "Could not load the replays." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as RecordingPayload & { loomEmbed?: string };
    const loom = readLoom(payload);

    if (loom.error) {
      return NextResponse.json({ error: loom.error }, { status: 400 });
    }

    const parsed = parseRecordingPayload({
      ...payload,
      loomVideoId: loom.videoId,
      aspectPercent: loom.aspectPercent,
    });

    if (parsed.values === null) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { slug, ...data } = parsed.values;

    // The slug is the document id and the public URL, so a clash is not a
    // merge — it is one replay quietly overwriting another.
    if (await getRecording(slug)) {
      return NextResponse.json(
        { error: `A replay already lives at /replays/${slug}. Choose a different title or slug.` },
        { status: 409 }
      );
    }

    await saveRecording(slug, data, session.email, {
      creating: true,
      publishedAt: data.status === "published" ? new Date().toISOString() : null,
    });

    return NextResponse.json({ message: "Replay created", slug }, { status: 201 });
  } catch (error) {
    console.error("Failed to create a recording:", error);
    return NextResponse.json({ error: "Could not create the replay." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const slug = normalizeRecordingSlug(request.nextUrl.searchParams.get("slug") || "");

    if (!slug) {
      return NextResponse.json({ error: "A replay slug is required." }, { status: 400 });
    }

    const existing = await getRecording(slug);

    if (!existing) {
      return NextResponse.json({ error: "That replay does not exist." }, { status: 404 });
    }

    const payload = (await request.json()) as RecordingPayload & { loomEmbed?: string };
    const loom = readLoom(payload, existing.aspectPercent || DEFAULT_ASPECT_PERCENT);

    if (loom.error) {
      return NextResponse.json({ error: loom.error }, { status: 400 });
    }

    const parsed = parseRecordingPayload({
      ...payload,
      slug,
      loomVideoId: loom.videoId,
      aspectPercent: loom.aspectPercent,
    });

    if (parsed.values === null) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { slug: _slug, ...data } = parsed.values;

    // Set once, on the first publish. Re-stamping it on every save would make
    // the library reshuffle itself every time somebody fixed a typo.
    const publishedAt =
      data.status === "published" ? existing.publishedAt || new Date().toISOString() : null;

    await saveRecording(slug, data, session.email, { creating: false, publishedAt });

    return NextResponse.json({ message: `Updated ${slug}.` });
  } catch (error) {
    console.error("Failed to update a recording:", error);
    return NextResponse.json({ error: "Could not update the replay." }, { status: 500 });
  }
}

/**
 * Deletes a replay. Super admin only.
 *
 * Removes our record of it, not the video in Loom — deleting the recording
 * there is a separate, deliberate act, and an accidental click here should
 * not destroy a master that may be the only copy.
 */
export async function DELETE(request: NextRequest) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const slug = normalizeRecordingSlug(request.nextUrl.searchParams.get("slug") || "");
    const existing = slug ? await getRecording(slug) : null;

    if (!existing) {
      return NextResponse.json({ error: "That replay does not exist." }, { status: 404 });
    }

    await deleteRecording(slug);
    console.info(`${session.email} deleted the replay ${slug}`);

    return NextResponse.json({
      message: `Deleted ${slug}. The Loom recording itself is untouched.`,
    });
  } catch (error) {
    console.error("Failed to delete a recording:", error);
    return NextResponse.json({ error: "Could not delete the replay." }, { status: 500 });
  }
}
