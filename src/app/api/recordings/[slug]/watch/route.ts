import { NextRequest, NextResponse } from "next/server";
import {
  RECORDING_REJECTION_MESSAGES,
  recordingRejectionReason,
} from "@/lib/recordings";
import { getRecording, recordWatch } from "@/lib/firebase/recordings";
import { verifyAccess, type AccessProof } from "@/lib/firebase/recording-access";
import { loomEmbedUrl } from "@/lib/video/loom";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The only place a Loom embed id is ever handed out.
 *
 * Everything that decides who may watch happens here, in this order:
 * availability first, then the gate, then the id. Checking availability first
 * means an expired replay says so rather than asking somebody for a code and
 * refusing it afterwards.
 *
 * That ordering is also the whole of the protection. The id is not on the
 * page, not in the library listing and not in the HTML source; it exists in
 * the browser only after this route has said yes. Once said, it is said —
 * see the note in `video/loom.ts` about what a Loom id is and is not.
 *
 * POST rather than GET on purpose. The proof of access — a code, an email —
 * belongs in a body, not in a URL that lands in browser history, in server
 * logs and in the `Referer` header of every request the page makes next.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const recording = await getRecording(slug);

    if (!recording) {
      return NextResponse.json(
        { error: RECORDING_REJECTION_MESSAGES.not_found },
        { status: 404 }
      );
    }

    const rejection = recordingRejectionReason(recording, new Date());

    if (rejection) {
      return NextResponse.json(
        { error: RECORDING_REJECTION_MESSAGES[rejection] },
        { status: 403 }
      );
    }

    const proof = (await request.json().catch(() => ({}))) as AccessProof;
    const verdict = await verifyAccess(recording, proof);

    if (!verdict.ok) {
      // 403 with a `needs` the page can act on: which boxes to show, and what
      // to say above them. A bare 403 would leave the viewer guessing.
      return NextResponse.json({ error: verdict.reason, needs: verdict.needs }, { status: 403 });
    }

    if (!recording.loomVideoId) {
      // Publishing without a video is blocked at save time, so this is a
      // replay whose Loom recording was removed afterwards. Said plainly
      // rather than handed to the player as an empty src.
      return NextResponse.json(
        { error: "This replay has no video attached yet. We are on it." },
        { status: 503 }
      );
    }

    // After the gate, so nothing is written down for a request that was
    // refused. Swallows its own errors, so it cannot cost the viewer their
    // replay either.
    await recordWatch({
      recordingSlug: recording.slug,
      watcher: verdict.watcher,
      name: (proof.name || "").trim(),
      phone: (proof.phone || "").trim(),
      access: recording.access,
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      embedUrl: loomEmbedUrl(recording.loomVideoId),
      aspectPercent: recording.aspectPercent,
      title: recording.title,
    });
  } catch (error) {
    console.error("Failed to authorise a replay:", error);
    return NextResponse.json({ error: "Could not start that replay." }, { status: 500 });
  }
}
