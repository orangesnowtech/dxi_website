import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getRecording, listWatchers } from "@/lib/firebase/recordings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/**
 * Who watched one replay, newest first.
 *
 * The half of the feature that pays for itself. A view counter tells you a
 * replay is popular; this tells you which named person asked to watch the
 * pricing webinar back after the room emptied, which is a list worth calling.
 *
 * Any admin may read it. It is the same population as the registration list
 * they already work from, and gating it behind the super admin would only mean
 * the people doing the following up cannot see who to follow up.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  try {
    const recording = await getRecording(slug);

    if (!recording) {
      return NextResponse.json({ error: "That replay does not exist." }, { status: 404 });
    }

    const watchers = await listWatchers(slug);

    return NextResponse.json({
      recording: { slug: recording.slug, title: recording.title, access: recording.access },
      watchers,
    });
  } catch (error) {
    console.error(`Failed to list watchers for ${slug}:`, error);
    return NextResponse.json({ error: "Could not load the watch list." }, { status: 500 });
  }
}
