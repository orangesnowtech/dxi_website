import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeSlug } from "@/lib/events";
import {
  ALLOWED_POSTER_TYPES,
  MAX_POSTER_BYTES,
  uploadEventPoster,
} from "@/lib/firebase/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Uploads an event poster and hands back the URL to store on the event.
 *
 * The upload is its own endpoint rather than part of the event save so a
 * poster can be swapped without re-submitting the whole form, and so a failed
 * upload never costs someone the rest of what they typed.
 */
export async function POST(request: NextRequest) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const slug = normalizeSlug(String(form.get("slug") || "")) || "unfiled";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    if (!ALLOWED_POSTER_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Posters must be a JPEG, PNG or WebP image." },
        { status: 400 }
      );
    }

    // Checked before reading the body into memory as well as inside the upload,
    // so an oversized file is refused rather than buffered.
    if (file.size > MAX_POSTER_BYTES) {
      return NextResponse.json({ error: "Posters must be 5MB or smaller." }, { status: 400 });
    }

    const url = await uploadEventPoster(
      slug,
      Buffer.from(await file.arrayBuffer()),
      file.type
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Poster upload failed:", error);

    // The bucket-missing case is worth surfacing verbatim: it is a one-click
    // fix in the Firebase console and nothing else explains the failure.
    const message =
      error instanceof Error && error.message.includes("bucket")
        ? error.message
        : "Could not upload that poster.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
