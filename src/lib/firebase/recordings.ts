import { firestore } from "@/lib/firebase/admin";
import {
  normalizeRecordingSlug,
  type PublicRecording,
  type Recording,
  type RecordingStatus,
} from "@/lib/recordings";

/**
 * Replay storage.
 *
 * The slug is the document id, so creating one is what enforces uniqueness —
 * two admins publishing the same replay at once cannot both win. Everything
 * about who may watch lives in `recordings.ts`; everything about Loom lives
 * in `video/loom.ts`.
 */

export const RECORDINGS_COLLECTION = "recordings";
export const RECORDING_VIEWS_COLLECTION = "recordingViews";

const recordings = () => firestore.collection(RECORDINGS_COLLECTION);

function readRecording(snapshot: FirebaseFirestore.DocumentSnapshot): Recording {
  return { ...(snapshot.data() as Omit<Recording, "slug">), slug: snapshot.id };
}

/**
 * Strips what a browser has no business seeing.
 *
 * The two stripped fields are the whole of the gate. A Loom embed id is
 * enough to watch, and an access code is enough to get one — either of them
 * reaching a page turns a paid replay into a public one. So the public shape
 * is defined by subtraction here, once, rather than by every page that
 * renders a recording remembering what to leave out.
 */
export function toPublicRecording(recording: Recording): PublicRecording {
  const {
    loomVideoId: _loomVideoId,
    accessCodes: _accessCodes,
    createdBy: _createdBy,
    updatedBy: _updatedBy,
    ...rest
  } = recording;

  return rest;
}

export async function getRecording(slug: string): Promise<Recording | null> {
  const clean = normalizeRecordingSlug(slug);

  if (!clean) {
    return null;
  }

  const snapshot = await recordings().doc(clean).get();
  return snapshot.exists ? readRecording(snapshot) : null;
}

/** The public library, newest first. Never includes drafts. */
export async function listPublishedRecordings(): Promise<PublicRecording[]> {
  const snapshot = await recordings()
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toPublicRecording(readRecording(doc)));
}

/** The admin list. Unfiltered by default, because drafts are the point. */
export async function listRecordings(status?: RecordingStatus | "all"): Promise<Recording[]> {
  const query =
    status && status !== "all"
      ? recordings().where("status", "==", status)
      : recordings();

  const snapshot = await query.orderBy("createdAt", "desc").get();

  return snapshot.docs.map(readRecording);
}

/** Every replay attached to one event, for the event page to offer. */
export async function recordingsForEvent(eventSlug: string): Promise<PublicRecording[]> {
  const snapshot = await recordings()
    .where("eventSlug", "==", eventSlug)
    .where("status", "==", "published")
    .get();

  return snapshot.docs.map((doc) => toPublicRecording(readRecording(doc)));
}

export async function saveRecording(
  slug: string,
  data: Omit<Recording, "slug" | "createdAt" | "createdBy" | "publishedAt">,
  adminEmail: string,
  { creating, publishedAt }: { creating: boolean; publishedAt: string | null }
) {
  const ref = recordings().doc(slug);

  if (creating) {
    await ref.create({
      ...data,
      publishedAt,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    });
    return;
  }

  await ref.update({
    ...data,
    publishedAt,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
  });
}

export async function deleteRecording(slug: string) {
  await recordings().doc(slug).delete();
}

/* ── Who watched ────────────────────────────────────────────────────────── */

export type RecordingView = {
  recordingSlug: string;
  /** Email where the gate identified one, empty for a public replay. */
  watcher: string;
  name: string;
  phone: string;
  /** Which gate let them in, so a lead can be told apart from a member. */
  access: string;
  at: string;
};

/**
 * Records one authorised watch.
 *
 * This is the half of the feature that pays for itself. "Who asked to watch
 * the replay of the pricing webinar" is a list of people who raised their hand
 * after the room emptied, and it is worth more than the view count.
 *
 * Never awaited into the viewer's critical path by the caller, and never
 * allowed to fail one: somebody who has earned their playback URL must get it
 * whether or not we managed to write this down.
 */
export async function recordWatch(view: RecordingView) {
  try {
    await firestore.collection(RECORDING_VIEWS_COLLECTION).add(view);
  } catch (error) {
    console.error(`Could not record a watch of ${view.recordingSlug}:`, error);
  }
}

/**
 * How many authorised watches one replay has had.
 *
 * An aggregation rather than a read: the dashboard shows this next to every
 * replay in the list, and pulling every row back to call `.length` on it would
 * make the page slower with every watch the feature earns.
 *
 * Counts watches, not people — the same person coming back tomorrow is two.
 * That is the honest number for "how much is this being used"; the list below
 * is where you find out who.
 */
export async function countWatches(recordingSlug: string) {
  const snapshot = await firestore
    .collection(RECORDING_VIEWS_COLLECTION)
    .where("recordingSlug", "==", recordingSlug)
    .count()
    .get();

  return snapshot.data().count;
}

/** The watch list for one replay, newest first. */
export async function listWatchers(recordingSlug: string, limit = 500) {
  const snapshot = await firestore
    .collection(RECORDING_VIEWS_COLLECTION)
    .where("recordingSlug", "==", recordingSlug)
    .orderBy("at", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as RecordingView) }));
}
