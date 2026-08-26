import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import {
  SHORT_LINK_MAX_LENGTH,
  SHORT_LINK_MIN_LENGTH,
  isValidShortCodeFormat,
  normalizeLinkTarget,
  normalizeShortCode,
  targetLoopsBackTo,
  type ShortLink,
} from "@/lib/links";
import {
  createShortLink,
  deleteShortLink,
  getShortLink,
  listShortLinks,
  updateShortLink,
} from "@/lib/firebase/links";
import { listEvents } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CODE_RULE = `A code must be ${SHORT_LINK_MIN_LENGTH}-${SHORT_LINK_MAX_LENGTH} characters of lowercase letters, numbers and dashes.`;

type LinkPayload = {
  code?: string;
  target?: string;
  label?: string;
  eventSlug?: string | null;
  active?: boolean;
};

type ParsedSettings = { target: string; label: string; eventSlug: string | null };

/**
 * Reads the mutable half of a create/update body. Shared so an edit cannot
 * drift into accepting a target that a create rejects — the same trap
 * `parseCodeSettings` and `parseEventPayload` exist to avoid.
 */
function parseLinkSettings(
  payload: LinkPayload
): { error: string; values: null } | { error: null; values: ParsedSettings } {
  const label = (payload.label || "").trim().slice(0, 140);

  if (!label) {
    return { error: "Say what this link is for, so the list stays readable.", values: null };
  }

  const target = normalizeLinkTarget(payload.target || "");

  if (target.value === null) {
    return { error: target.error, values: null };
  }

  const eventSlug = (payload.eventSlug || "").trim().slice(0, 140) || null;

  return { error: null, values: { target: target.value, label, eventSlug } };
}

/**
 * Every link, plus the live events.
 *
 * The events come back so the dashboard can offer a one-click link for any
 * that have not got one — which is how events created before this existed get
 * caught up — and so a link made by hand can be attached to an event, which is
 * what makes the assistant send it.
 */
export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const [links, allEvents] = await Promise.all([listShortLinks(), listEvents("all")]);

    const events = allEvents
      .filter((event) => event.status !== "archived")
      .map((event) => ({
        slug: event.slug,
        title: event.title,
        status: event.status,
        startsAt: event.startsAt,
      }));

    return NextResponse.json({
      links,
      events,
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Failed to list short links:", error);
    return NextResponse.json({ error: "Could not load the links." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as LinkPayload;
    const code = normalizeShortCode(payload.code || "");

    if (code.length < SHORT_LINK_MIN_LENGTH || !isValidShortCodeFormat(code)) {
      return NextResponse.json({ error: CODE_RULE }, { status: 400 });
    }

    // Narrowing on `values` rather than `error`: an empty-string error would
    // not exclude the failure branch, and TypeScript is right to say so.
    const parsed = parseLinkSettings(payload);

    if (!parsed.values) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (targetLoopsBackTo(parsed.values.target, code)) {
      return NextResponse.json(
        { error: "That target is the link itself, which would just bounce forever." },
        { status: 400 }
      );
    }

    const result = await createShortLink({
      code,
      ...parsed.values,
      createdBy: session.email,
    });

    if (!result.ok) {
      return NextResponse.json({ error: `/r/${code} is already taken.` }, { status: 409 });
    }

    return NextResponse.json({ message: `Created /r/${code}.`, link: result.link });
  } catch (error) {
    console.error("Failed to create a short link:", error);
    return NextResponse.json({ error: "Could not create the link." }, { status: 500 });
  }
}

/**
 * Retargets a link, renames it, or pauses and resumes it.
 *
 * Retargeting is the whole point: the code on the poster stays, the page it
 * opens changes. Renaming is allowed only while nobody has followed the link —
 * once a code is out in the world, changing it breaks whatever is carrying it,
 * and a rename that looks like an ordinary edit is how that happens by
 * accident.
 */
export async function PATCH(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const code = normalizeShortCode(request.nextUrl.searchParams.get("code") || "");

    if (!code) {
      return NextResponse.json({ error: "A link code is required." }, { status: 400 });
    }

    const payload = (await request.json()) as LinkPayload;
    const existing = await getShortLink(code);

    if (!existing) {
      return NextResponse.json({ error: "That link does not exist." }, { status: 404 });
    }

    // A bare {active} body is the pause/resume toggle; anything more is a full
    // edit and gets validated as one.
    if (typeof payload.active === "boolean" && payload.target === undefined) {
      await updateShortLink(code, { active: payload.active }, session.email);

      return NextResponse.json({
        message: payload.active ? `/r/${code} is live again.` : `/r/${code} is paused.`,
      });
    }

    const parsed = parseLinkSettings(payload);

    if (!parsed.values) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const nextCode = normalizeShortCode(payload.code || code);

    if (nextCode !== code) {
      return renameLink(existing, nextCode, parsed.values, payload.active, session.email);
    }

    if (targetLoopsBackTo(parsed.values.target, code)) {
      return NextResponse.json(
        { error: "That target is the link itself, which would just bounce forever." },
        { status: 400 }
      );
    }

    await updateShortLink(
      code,
      {
        ...parsed.values,
        ...(typeof payload.active === "boolean" ? { active: payload.active } : {}),
      },
      session.email
    );

    return NextResponse.json({ message: `Updated /r/${code}.` });
  } catch (error) {
    console.error("Failed to update a short link:", error);
    return NextResponse.json({ error: "Could not update the link." }, { status: 500 });
  }
}

/**
 * Moves a link to a new code.
 *
 * Written as a create-then-delete rather than an update because the code is
 * the document id. The create is what enforces uniqueness, so the old document
 * is only removed once the new one is safely in place.
 */
async function renameLink(
  existing: ShortLink,
  nextCode: string,
  values: ParsedSettings,
  active: boolean | undefined,
  adminEmail: string
) {
  if (nextCode.length < SHORT_LINK_MIN_LENGTH || !isValidShortCodeFormat(nextCode)) {
    return NextResponse.json({ error: CODE_RULE }, { status: 400 });
  }

  if (existing.clickCount > 0) {
    return NextResponse.json(
      {
        error: `/r/${existing.code} has been followed ${existing.clickCount} time(s), so its code is fixed. Change where it points instead, or make a second link.`,
      },
      { status: 409 }
    );
  }

  if (targetLoopsBackTo(values.target, nextCode)) {
    return NextResponse.json(
      { error: "That target is the link itself, which would just bounce forever." },
      { status: 400 }
    );
  }

  const result = await createShortLink({ code: nextCode, ...values, createdBy: adminEmail });

  if (!result.ok) {
    return NextResponse.json({ error: `/r/${nextCode} is already taken.` }, { status: 409 });
  }

  if (active === false) {
    await updateShortLink(nextCode, { active: false }, adminEmail);
  }

  await deleteShortLink(existing.code);

  return NextResponse.json({
    message: `/r/${existing.code} is now /r/${nextCode}.`,
    link: result.link,
  });
}

/**
 * Deletes a link outright. Super admin only, and refused once anyone has
 * followed it — pausing leaves the code claimed, so nothing else can later be
 * created that quietly answers an address already printed somewhere.
 */
export async function DELETE(request: NextRequest) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const code = normalizeShortCode(request.nextUrl.searchParams.get("code") || "");

    if (!code) {
      return NextResponse.json({ error: "A link code is required." }, { status: 400 });
    }

    const existing = await getShortLink(code);

    if (!existing) {
      return NextResponse.json({ error: "That link does not exist." }, { status: 404 });
    }

    if (existing.clickCount > 0) {
      return NextResponse.json(
        {
          error: `/r/${code} has been followed ${existing.clickCount} time(s). Pause it instead — deleting frees the code for something else to answer.`,
        },
        { status: 409 }
      );
    }

    await deleteShortLink(code);
    console.info(`${session.email} deleted the unused short link /r/${code}`);

    return NextResponse.json({ message: `Deleted /r/${code}.` });
  } catch (error) {
    console.error("Failed to delete a short link:", error);
    return NextResponse.json({ error: "Could not delete the link." }, { status: 500 });
  }
}
