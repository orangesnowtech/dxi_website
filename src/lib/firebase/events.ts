import { FieldValue } from "firebase-admin/firestore";
import type { DocumentData, Query, Transaction } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
import {
  approvedRegistrationStatus,
  eventRejectionReason,
  generateAccessCode,
  holdsAPlace,
  initialRegistrationStatus,
  typeRejectionReason,
  type EventRecord,
  type EventRegistration,
  type EventStatus,
  type PublicEvent,
  type RegistrationRejection,
  type RegistrationStatus,
  type RegistrationType,
  type VendorDetails,
} from "@/lib/events";

export const EVENTS_COLLECTION = "events";
export const EVENT_REGISTRATIONS_COLLECTION = "eventRegistrations";

const events = () => firestore.collection(EVENTS_COLLECTION);
const registrations = () => firestore.collection(EVENT_REGISTRATIONS_COLLECTION);

/**
 * Strips everything a browser has no business seeing.
 *
 * `joinUrl` is the whole reason this exists: a webinar link on a public page is
 * a webinar anyone can walk into, so it never leaves the server except in the
 * email that goes to a confirmed registrant.
 */
export function toPublicEvent(event: EventRecord): PublicEvent {
  const { joinUrl: _joinUrl, createdBy: _createdBy, updatedBy: _updatedBy, ...rest } = event;
  return rest;
}

function readEvent(snapshot: FirebaseFirestore.DocumentSnapshot): EventRecord {
  return { ...(snapshot.data() as Omit<EventRecord, "slug">), slug: snapshot.id };
}

export async function getEvent(slug: string): Promise<EventRecord | null> {
  const snapshot = await events().doc(slug).get();
  return snapshot.exists ? readEvent(snapshot) : null;
}

/**
 * Everything the public listing shows: published events, soonest first, with
 * events that are already over pushed to a separate list by the caller.
 *
 * Ordered in Firestore rather than in memory so the index does the work once
 * the calendar is longer than a handful of entries.
 */
export async function listPublishedEvents(): Promise<PublicEvent[]> {
  const snapshot = await events()
    .where("status", "==", "published")
    .orderBy("startsAt", "asc")
    .get();

  return snapshot.docs.map((doc) => toPublicEvent(readEvent(doc)));
}

/** The admin list. Unfiltered by default, because drafts are the point. */
export async function listEvents(status?: EventStatus | "all"): Promise<EventRecord[]> {
  let query: Query<DocumentData> = events();

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.orderBy("startsAt", "desc").get();

  return snapshot.docs.map(readEvent);
}

/* ── Registration ───────────────────────────────────────────────────────── */

export type RegistrationInput = {
  eventSlug: string;
  typeKey: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationName: string;
  jobTitle: string;
  socialMediaUrl: string;
  howDidYouHear: string;
  notes: string;
  vendor: VendorDetails | null;
};

export type RegistrationResult =
  | { ok: true; registration: EventRegistration; event: EventRecord; type: RegistrationType }
  | { ok: false; reason: RegistrationRejection };

/**
 * Claims a place and writes the registration, both or neither.
 *
 * The capacity check has to happen inside the transaction rather than against
 * the read the page rendered from: the last seat at a trade fair is exactly
 * the one two people click for at the same moment, and a read-then-write check
 * hands it to both of them. The per-type tallies live in an array on the event
 * document, which is also why this cannot be an atomic increment — the whole
 * array is rewritten from a value read in the same transaction.
 */
export async function registerForEvent(input: RegistrationInput): Promise<RegistrationResult> {
  const eventRef = events().doc(input.eventSlug);
  const email = input.email.trim().toLowerCase();

  return firestore.runTransaction(async (transaction) => {
    // Every read first: Firestore rejects a transaction that reads after it
    // has written.
    const eventSnapshot = await transaction.get(eventRef);

    if (!eventSnapshot.exists) {
      return { ok: false as const, reason: "event_not_found" as const };
    }

    const event = readEvent(eventSnapshot);
    const now = new Date();

    const eventRejection = eventRejectionReason(event, now);

    if (eventRejection) {
      return { ok: false as const, reason: eventRejection };
    }

    const typeIndex = event.registrationTypes.findIndex((type) => type.key === input.typeKey);
    const type = typeIndex >= 0 ? event.registrationTypes[typeIndex] : undefined;
    const typeRejection = typeRejectionReason(type);

    if (typeRejection || !type) {
      return { ok: false as const, reason: typeRejection || ("type_not_found" as const) };
    }

    // One place per email per event. A cancelled or rejected registration does
    // not block a second attempt — that is the only way back in after either.
    const duplicates = await transaction.get(
      registrations()
        .where("eventSlug", "==", input.eventSlug)
        .where("email", "==", email)
        .where("status", "in", ["pending", "awaiting_payment", "confirmed"])
        .limit(1)
    );

    if (!duplicates.empty) {
      return { ok: false as const, reason: "already_registered" as const };
    }

    const accessCode = await reserveAccessCode(transaction);

    const status = initialRegistrationStatus(type);
    const registrationRef = registrations().doc();
    const fullName = `${input.firstName} ${input.lastName}`.trim();

    const registration: Omit<EventRegistration, "id"> = {
      eventSlug: input.eventSlug,
      eventTitle: event.title,
      eventStartsAt: event.startsAt,
      typeKey: type.key,
      typeLabel: type.label,
      profile: type.profile,
      firstName: input.firstName,
      lastName: input.lastName,
      fullName,
      email,
      phone: input.phone,
      organizationName: input.organizationName,
      jobTitle: input.jobTitle,
      socialMediaUrl: input.socialMediaUrl,
      howDidYouHear: input.howDidYouHear,
      notes: input.notes,
      vendor: type.profile === "vendor" ? input.vendor : null,
      status,
      feeNaira: type.feeNaira,
      paymentDetailsSentAt: null,
      paidAt: null,
      accessCode,
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
      rejectionSentAt: null,
      submittedAt: now.toISOString(),
    };

    transaction.set(registrationRef, {
      ...registration,
      // Sorted on in the admin list. Kept alongside the ISO string, which is
      // what the client and the emails read.
      createdAt: FieldValue.serverTimestamp(),
    });

    const nextTypes = event.registrationTypes.map((entry, index) =>
      index === typeIndex ? { ...entry, count: entry.count + 1 } : entry
    );

    transaction.update(eventRef, {
      registrationTypes: nextTypes,
      registrationCount: event.registrationCount + 1,
    });

    return {
      ok: true as const,
      registration: { ...registration, id: registrationRef.id },
      event,
      type,
    };
  });
}

/**
 * Finds an access code nothing else is using.
 *
 * A six-character code out of a 32-letter alphabet collides about as often as
 * it rains in the Sahara, but a collision would hand two people the same
 * ticket, so it is checked rather than assumed. Reads only — safe to call
 * before the transaction's writes.
 */
async function reserveAccessCode(transaction: Transaction): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateAccessCode();
    const existing = await transaction.get(
      registrations().where("accessCode", "==", candidate).limit(1)
    );

    if (existing.empty) {
      return candidate;
    }
  }

  // Five collisions in a row means something is wrong with the generator, not
  // with luck. Fail loudly rather than issue a duplicate ticket.
  throw new Error("Could not allocate a unique access code.");
}

/* ── Status changes ─────────────────────────────────────────────────────── */

export type StatusChangeResult =
  | { ok: true; registration: EventRegistration; previousStatus: RegistrationStatus }
  | { ok: false; error: string };

/**
 * Moves a registration between statuses and keeps the event's tallies honest.
 *
 * Rejecting or cancelling gives the seat back, and re-approving takes one
 * again — so the counters are adjusted by the difference between what the two
 * statuses hold, inside the same transaction as the status write. Anything
 * less and a busy trade fair drifts away from its real numbers within a day.
 */
export async function changeRegistrationStatus(
  registrationId: string,
  nextStatus: RegistrationStatus,
  adminEmail: string
): Promise<StatusChangeResult> {
  const registrationRef = registrations().doc(registrationId);

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(registrationRef);

    if (!snapshot.exists) {
      return { ok: false as const, error: "Registration not found." };
    }

    const registration = { ...(snapshot.data() as EventRegistration), id: snapshot.id };
    const previousStatus = registration.status;

    if (previousStatus === nextStatus) {
      return { ok: true as const, registration, previousStatus };
    }

    const delta = (holdsAPlace(nextStatus) ? 1 : 0) - (holdsAPlace(previousStatus) ? 1 : 0);
    const eventRef = events().doc(registration.eventSlug);
    const eventSnapshot = delta === 0 ? null : await transaction.get(eventRef);

    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      status: nextStatus,
      updatedAt: now,
      updatedBy: adminEmail,
    };

    // Marking a paid place confirmed is how a transfer is recorded. Stamped
    // once — re-confirming a registration should not move the date it was paid.
    if (nextStatus === "confirmed" && registration.feeNaira > 0 && !registration.paidAt) {
      update.paidAt = now;
    }

    transaction.update(registrationRef, update);

    if (eventSnapshot?.exists) {
      const event = readEvent(eventSnapshot);
      const nextTypes = event.registrationTypes.map((type) =>
        type.key === registration.typeKey
          ? { ...type, count: Math.max(type.count + delta, 0) }
          : type
      );

      transaction.update(eventRef, {
        registrationTypes: nextTypes,
        registrationCount: Math.max(event.registrationCount + delta, 0),
      });
    }

    return {
      ok: true as const,
      registration: { ...registration, ...update, status: nextStatus } as EventRegistration,
      previousStatus,
    };
  });
}

/** Approving a vendor either confirms them or sends them to the bank details. */
export async function approveRegistration(registrationId: string, adminEmail: string) {
  const snapshot = await registrations().doc(registrationId).get();

  if (!snapshot.exists) {
    return { ok: false as const, error: "Registration not found." };
  }

  const registration = snapshot.data() as EventRegistration;

  return changeRegistrationStatus(
    registrationId,
    approvedRegistrationStatus(registration.feeNaira),
    adminEmail
  );
}

export async function getRegistration(id: string): Promise<EventRegistration | null> {
  const snapshot = await registrations().doc(id).get();
  return snapshot.exists
    ? { ...(snapshot.data() as EventRegistration), id: snapshot.id }
    : null;
}

export async function listRegistrations(options: {
  eventSlug?: string;
  status?: RegistrationStatus | "all";
  limit: number;
  offset: number;
}) {
  let query: Query<DocumentData> = registrations();

  if (options.eventSlug) {
    query = query.where("eventSlug", "==", options.eventSlug);
  }

  if (options.status && options.status !== "all") {
    query = query.where("status", "==", options.status);
  }

  const countSnapshot = await query.count().get();

  const snapshot = await query
    .orderBy("createdAt", "desc")
    .limit(options.limit + 1)
    .offset(options.offset)
    .get();

  const rows = snapshot.docs.map(
    (doc) => ({ ...(doc.data() as EventRegistration), id: doc.id }) as EventRegistration
  );

  return {
    registrations: rows.slice(0, options.limit),
    total: countSnapshot.data().count,
    hasMore: rows.length > options.limit,
  };
}

/** Marks the moment a hand-sent email went out, so nobody sends it twice. */
export async function stampRegistration(
  registrationId: string,
  field: "paymentDetailsSentAt" | "rejectionSentAt",
  adminEmail: string
) {
  await registrations().doc(registrationId).update({
    [field]: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
  });
}

/* ── Check-in ───────────────────────────────────────────────────────────── */

/**
 * Door search: an exact access code first, then a name.
 *
 * The code path is a single indexed lookup because it is what happens ninety
 * times out of a hundred. The name path falls back to scanning the event's
 * registrations, which Firestore cannot do case-insensitively or as a
 * substring — acceptable because it is scoped to one event and only runs when
 * somebody has lost their code.
 */
export async function searchRegistrations(query: string, eventSlug?: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const asCode = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (asCode.length === 6) {
    let byCode: Query<DocumentData> = registrations().where("accessCode", "==", asCode);

    if (eventSlug) {
      byCode = byCode.where("eventSlug", "==", eventSlug);
    }

    const snapshot = await byCode.limit(1).get();

    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => ({
        ...(doc.data() as EventRegistration),
        id: doc.id,
      }));
    }
  }

  let scope: Query<DocumentData> = registrations();

  if (eventSlug) {
    scope = scope.where("eventSlug", "==", eventSlug);
  }

  const snapshot = await scope.get();
  const needle = trimmed.toLowerCase();

  return snapshot.docs
    .map((doc) => ({ ...(doc.data() as EventRegistration), id: doc.id }))
    .filter(
      (registration) =>
        registration.fullName?.toLowerCase().includes(needle) ||
        registration.email?.toLowerCase().includes(needle) ||
        registration.organizationName?.toLowerCase().includes(needle)
    )
    .slice(0, 25);
}

export type CheckInResult =
  | { ok: true; registration: EventRegistration }
  | { ok: false; error: string; registration?: EventRegistration };

/**
 * Records an arrival, once.
 *
 * Both guards matter at a real door: an unconfirmed registration is somebody
 * who has not paid or not been approved, and a second scan of the same code is
 * either a queue mistake or a ticket being passed around.
 */
export async function checkInRegistration(
  registrationId: string,
  staffEmail: string
): Promise<CheckInResult> {
  const registrationRef = registrations().doc(registrationId);

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(registrationRef);

    if (!snapshot.exists) {
      return { ok: false as const, error: "Registration not found." };
    }

    const registration = { ...(snapshot.data() as EventRegistration), id: snapshot.id };

    if (registration.status !== "confirmed") {
      return {
        ok: false as const,
        error: `This registration is ${registration.status.replace(/_/g, " ")}, not confirmed.`,
        registration,
      };
    }

    if (registration.checkedIn) {
      return {
        ok: false as const,
        error: "Already checked in.",
        registration,
      };
    }

    const now = new Date().toISOString();

    transaction.update(registrationRef, {
      checkedIn: true,
      checkedInAt: now,
      checkedInBy: staffEmail,
    });

    return {
      ok: true as const,
      registration: { ...registration, checkedIn: true, checkedInAt: now, checkedInBy: staffEmail },
    };
  });
}

/* ── Event writes ───────────────────────────────────────────────────────── */

export async function saveEvent(
  slug: string,
  data: Omit<EventRecord, "slug" | "registrationCount" | "createdAt" | "createdBy">,
  adminEmail: string,
  { creating }: { creating: boolean }
) {
  const ref = events().doc(slug);

  if (creating) {
    await ref.create({
      ...data,
      registrationCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    });
    return;
  }

  await ref.update({
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
  });
}

/** How many registrations an event still carries, for the delete guard. */
export async function countRegistrationsFor(eventSlug: string) {
  const snapshot = await registrations().where("eventSlug", "==", eventSlug).count().get();
  return snapshot.data().count;
}

export async function deleteEvent(slug: string) {
  await events().doc(slug).delete();
}
