import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
import {
  normalizeShortCode,
  randomShortSuffix,
  suggestShortCode,
  type ShortLink,
} from "@/lib/links";

/**
 * Storage for short links.
 *
 * The code is the document id, which is what makes creation safe: two admins
 * claiming `lagos25` at the same moment cannot both win, because `create()`
 * fails on the second rather than overwriting the first. Everything about what
 * a code and a target may be lives in `links.ts`.
 */

export const SHORT_LINKS_COLLECTION = "shortLinks";

const links = () => firestore.collection(SHORT_LINKS_COLLECTION);

function readLink(snapshot: FirebaseFirestore.DocumentSnapshot): ShortLink {
  return { ...(snapshot.data() as Omit<ShortLink, "code">), code: snapshot.id };
}

export async function listShortLinks(): Promise<ShortLink[]> {
  const snapshot = await links().orderBy("createdAt", "desc").get();
  return snapshot.docs.map(readLink);
}

export async function getShortLink(rawCode: string): Promise<ShortLink | null> {
  const code = normalizeShortCode(rawCode);

  if (!code) {
    return null;
  }

  const snapshot = await links().doc(code).get();
  return snapshot.exists ? readLink(snapshot) : null;
}

export type CreateShortLinkInput = {
  code: string;
  target: string;
  label: string;
  eventSlug: string | null;
  createdBy: string;
};

export async function createShortLink(
  input: CreateShortLinkInput
): Promise<{ ok: true; link: ShortLink } | { ok: false; taken: true }> {
  const record: Omit<ShortLink, "code"> = {
    target: input.target,
    label: input.label,
    eventSlug: input.eventSlug,
    active: true,
    clickCount: 0,
    lastClickedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };

  try {
    await links().doc(input.code).create(record);
  } catch (error) {
    // 6 is ALREADY_EXISTS: the code is taken.
    if ((error as { code?: number }).code === 6) {
      return { ok: false, taken: true };
    }

    throw error;
  }

  return { ok: true, link: { ...record, code: input.code } };
}

export async function updateShortLink(
  code: string,
  patch: Partial<Pick<ShortLink, "target" | "label" | "active" | "eventSlug">>,
  adminEmail: string
) {
  await links()
    .doc(code)
    .update({ ...patch, updatedAt: new Date().toISOString(), updatedBy: adminEmail });
}

export async function deleteShortLink(code: string) {
  await links().doc(code).delete();
}

/**
 * Records a follow.
 *
 * Awaited rather than fired and forgotten: on a serverless host the response
 * ends the invocation, and a write still in flight at that point is simply
 * lost. A failure here must never cost the visitor their redirect, so the
 * caller is expected to swallow it.
 */
export async function countShortLinkClick(code: string) {
  await links()
    .doc(code)
    .update({ clickCount: FieldValue.increment(1), lastClickedAt: new Date().toISOString() });
}

/**
 * The codes belonging to a batch of events, as `slug -> code`.
 *
 * One query for the whole batch rather than one per event: the assistant looks
 * this up on every "what's coming up", and eight round trips to decorate eight
 * events is eight round trips inside a reply somebody is waiting on.
 */
export async function shortLinkCodesForEvents(slugs: string[]): Promise<Map<string, string>> {
  const codes = new Map<string, string>();
  const wanted = slugs.filter(Boolean);

  // Firestore caps an `in` filter at 30 values.
  for (let start = 0; start < wanted.length; start += 30) {
    const batch = wanted.slice(start, start + 30);
    const snapshot = await links().where("eventSlug", "in", batch).get();
    const oldest = new Map<string, ShortLink>();

    // Paused links are dropped here rather than in the query: adding a second
    // filter would need a composite index for what is at most a handful of
    // documents per batch.
    for (const doc of snapshot.docs) {
      const link = readLink(doc);

      if (!link.eventSlug || !link.active) {
        continue;
      }

      // Oldest wins, so a code already handed out stays the one we give.
      const held = oldest.get(link.eventSlug);

      if (!held || link.createdAt < held.createdAt) {
        oldest.set(link.eventSlug, link);
      }
    }

    for (const [slug, link] of oldest) {
      codes.set(slug, link.code);
    }
  }

  return codes;
}

/** The one link for an event, if it has one. */
export async function shortLinkForEvent(eventSlug: string): Promise<ShortLink | null> {
  const snapshot = await links().where("eventSlug", "==", eventSlug).limit(1).get();
  return snapshot.empty ? null : readLink(snapshot.docs[0]);
}

/**
 * Gives an event a short link if it has not got one, and returns the code.
 *
 * Called when an event is created, so the link exists before anybody needs it.
 * Never throws: an event that saved fine must not then fail because a
 * convenience could not be arranged, so a problem here returns null and the
 * dashboard offers to make the link by hand.
 */
export async function ensureEventShortLink(
  eventSlug: string,
  title: string,
  adminEmail: string
): Promise<string | null> {
  try {
    const existing = await shortLinkForEvent(eventSlug);

    if (existing) {
      return existing.code;
    }

    const base = suggestShortCode(title || eventSlug);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = attempt === 0 ? base : `${base}-${randomShortSuffix()}`;
      const result = await createShortLink({
        code,
        target: `/events/${eventSlug}`,
        label: title || eventSlug,
        eventSlug,
        createdBy: adminEmail,
      });

      if (result.ok) {
        return code;
      }
    }

    return null;
  } catch (error) {
    console.error(`Could not create a short link for ${eventSlug}:`, error);
    return null;
  }
}
