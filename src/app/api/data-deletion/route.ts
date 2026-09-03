import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { metaAppSecret } from "@/lib/bot/config";
import { deleteConversationData } from "@/lib/bot/conversation";
import { siteOrigin } from "@/lib/links";

/**
 * Meta's data deletion callback.
 *
 * When somebody removes our app from their Facebook or Instagram settings,
 * Meta posts a `signed_request` here. We verify it, erase that person, and
 * hand back a URL and a reference so they can see it happened. Configured at
 * App Settings → Basic → "Data Deletion Request URL", and required before the
 * app can go Live.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Unpacks Meta's signed request, or returns null.
 *
 * The signature is the whole point: without it this endpoint would delete
 * anybody's conversation for anybody who could guess an id, which is a
 * denial-of-service dressed as a privacy feature.
 */
function parseSignedRequest(signed: string): { user_id?: string } | null {
  const appSecret = metaAppSecret();

  if (!appSecret) {
    console.error("[data-deletion] META_APP_SECRET is not set — cannot verify.");
    return null;
  }

  const [encodedSignature, payload] = signed.split(".");

  if (!encodedSignature || !payload) {
    return null;
  }

  // Signed over the encoded payload exactly as sent, not over the decoded JSON.
  const expected = crypto.createHmac("sha256", appSecret).update(payload).digest();
  const received = base64UrlDecode(encodedSignature);

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(payload).toString("utf8"));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Sent as a form post, not JSON.
  let signed: string | null = null;

  try {
    signed = (await request.formData()).get("signed_request") as string | null;
  } catch {
    signed = new URLSearchParams(await request.text()).get("signed_request");
  }

  if (!signed) {
    return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
  }

  const data = parseSignedRequest(signed);

  if (!data?.user_id) {
    return NextResponse.json({ error: "Invalid signed_request" }, { status: 400 });
  }

  try {
    const deleted = await deleteConversationData(data.user_id);
    console.log(`[data-deletion] erased ${deleted.length} conversation(s).`);
  } catch (error) {
    // Deliberately not surfaced to Meta as a failure. Meta's contract is that
    // we acknowledge the request; retrying it would not fix a Firestore
    // outage, and the log is what gets this finished by hand.
    console.error("[data-deletion] erasure failed:", error);
  }

  const code = `del_${data.user_id}`;

  return NextResponse.json({
    url: `${siteOrigin()}/data-deletion?code=${encodeURIComponent(code)}`,
    confirmation_code: code,
  });
}
