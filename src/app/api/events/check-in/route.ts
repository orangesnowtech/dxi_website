import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_CODE_LENGTH,
  SELF_CHECK_IN_MESSAGES,
  normalizeAccessCode,
  normalizeSlug,
} from "@/lib/events";
import { selfCheckIn } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Crude per-IP throttle.
 *
 * A six-character code from a 32-letter alphabet is about a billion
 * possibilities, so guessing one is not the worry — hammering the endpoint is,
 * since every attempt costs a Firestore transaction and a wrong guess is free
 * to make.
 *
 * In-memory, so it resets when the instance recycles and is not shared across
 * instances. That is a real limit and it is accepted: this raises the cost of
 * a script without pretending to be a security boundary. If abuse ever
 * materialises, this wants moving to Firestore or a proper rate limiter.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

function throttled(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });

    // Opportunistic sweep so the map cannot grow without bound over a long
    // running instance.
    if (attempts.size > 5000) {
      for (const [k, v] of attempts) {
        if (now > v.resetAt) attempts.delete(k);
      }
    }

    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    const { slug, accessCode } = (await request.json()) as {
      slug?: string;
      accessCode?: string;
    };

    const eventSlug = normalizeSlug(slug || "");
    const code = normalizeAccessCode(accessCode || "");

    if (!eventSlug) {
      return NextResponse.json({ error: "Missing event." }, { status: 400 });
    }

    if (code.length !== ACCESS_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Enter the ${ACCESS_CODE_LENGTH}-character code from your email.` },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (throttled(`${ip}:${eventSlug}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Wait a moment and try again." },
        { status: 429 }
      );
    }

    const result = await selfCheckIn(eventSlug, code, new Date());

    if (!result.ok) {
      // 409 for a code that exists but cannot be used right now, 404 for one we
      // cannot place at all — the message stays vague either way.
      const status =
        result.reason === "unknown_code"
          ? 404
          : result.reason === "not_open_yet" || result.reason === "closed"
            ? 403
            : 409;

      return NextResponse.json(
        { error: SELF_CHECK_IN_MESSAGES[result.reason], reason: result.reason },
        { status }
      );
    }

    return NextResponse.json({
      message: "Checked in",
      firstName: result.firstName,
      typeLabel: result.typeLabel,
      checkedInAt: result.checkedInAt,
    });
  } catch (error) {
    console.error("Self check-in failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please see someone at the desk." },
      { status: 500 }
    );
  }
}
