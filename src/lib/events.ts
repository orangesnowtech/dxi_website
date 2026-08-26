/**
 * The event portal's shared rules.
 *
 * Events are the shallow end of the DXI funnel: a webinar seat, a training
 * place, a stand at a trade fair. One event carries several registration
 * types, and the type is what decides everything that follows — what it costs,
 * whether a human reviews it, and which questions the form asks.
 *
 * Deliberately free of imports, like `referral.ts`, so the public form, the
 * admin dashboard and the route handlers all decide the same things the same
 * way. Anything that touches Firestore lives in `firebase/events.ts`.
 */

/* ── Events ─────────────────────────────────────────────────────────────── */

export const EVENT_KINDS = ["webinar", "training", "tradefair", "networking", "other"] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  webinar: "Webinar",
  training: "Live training",
  tradefair: "Trade fair",
  networking: "Networking",
  other: "Event",
};

export const EVENT_STATUSES = ["draft", "published", "closed", "archived"] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Registration closed",
  archived: "Archived",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: "#6b7280",
  published: "#10b981",
  closed: "#f59e0b",
  archived: "#9ca3af",
};

export type EventFormat = "online" | "venue";

/**
 * Which questions the form asks. A vendor is applying for a stand, not a seat,
 * so they answer for a business; everyone else answers for themselves.
 */
export type RegistrationProfile = "attendee" | "vendor";

export type RegistrationType = {
  /** Stable, slug-shaped. Stored on every registration, so it never changes. */
  key: string;
  label: string;
  description: string;
  profile: RegistrationProfile;
  /** Zero is free. Anything above it is settled by bank transfer. */
  feeNaira: number;
  /** null means only the event-wide capacity applies. */
  capacity: number | null;
  /** Vendors are reviewed before they are told what to pay. */
  requiresApproval: boolean;
  /** Live tally of registrations holding a place on this type. */
  count: number;
};

export type EventRecord = {
  /** Doubles as the Firestore document id and the public URL segment. */
  slug: string;
  title: string;
  kind: EventKind;
  status: EventStatus;
  /**
   * Square artwork for the listing card. Any https URL.
   *
   * Square because the card crops to 1:1 — a poster laid out for a portrait
   * flyer loses its top and bottom there, so the aspect is part of the brief
   * rather than a rendering detail.
   */
  posterUrl: string;
  /** One line under the title on the listing card. */
  summary: string;
  /** Long copy on the detail page. Plain text; blank lines split paragraphs. */
  description: string;
  startsAt: string;
  endsAt: string | null;
  format: EventFormat;
  venueName: string;
  venueAddress: string;
  /** Held back until a registration is confirmed, so it is never on a page. */
  joinUrl: string;
  /** null means uncapped. */
  capacity: number | null;
  /** Registration shuts at this instant regardless of status. Null for none. */
  registrationClosesAt: string | null;
  registrationTypes: RegistrationType[];
  /** Live tally across every type. */
  registrationCount: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
};

/** What the public pages are allowed to see. Never carries `joinUrl`. */
export type PublicEvent = Omit<EventRecord, "joinUrl" | "createdBy" | "updatedBy">;

/* ── Registrations ──────────────────────────────────────────────────────── */

export const REGISTRATION_STATUSES = [
  "pending",
  "awaiting_payment",
  "confirmed",
  "rejected",
  "cancelled",
] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending review",
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const REGISTRATION_STATUS_COLORS: Record<RegistrationStatus, string> = {
  pending: "#f59e0b",
  awaiting_payment: "#3b82f6",
  confirmed: "#10b981",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

/**
 * Statuses that hold a place. A rejected or cancelled registration gives its
 * seat back, which is why capacity is counted over these rather than over the
 * whole collection.
 */
export const HOLDING_REGISTRATION_STATUSES: RegistrationStatus[] = [
  "pending",
  "awaiting_payment",
  "confirmed",
];

export function holdsAPlace(status: RegistrationStatus) {
  return HOLDING_REGISTRATION_STATUSES.includes(status);
}

export type VendorDetails = {
  businessName: string;
  offering: string;
  boothPreference: string;
  repCount: string;
};

export type EventRegistration = {
  id: string;
  eventSlug: string;
  /** Copied at registration so admin lists and emails still read correctly
   *  after an event is renamed or deleted. */
  eventTitle: string;
  eventStartsAt: string;
  typeKey: string;
  typeLabel: string;
  profile: RegistrationProfile;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  jobTitle: string;
  socialMediaUrl: string;
  howDidYouHear: string;
  /** What they want out of it. Free text — the answer that shapes the room. */
  expectations: string;
  notes: string;
  vendor: VendorDetails | null;
  status: RegistrationStatus;
  feeNaira: number;
  paymentDetailsSentAt: string | null;
  paidAt: string | null;
  /** Six characters, unique across the collection. Issued at registration so
   *  it can be quoted as the transfer narration, but only emailed on confirm. */
  accessCode: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  rejectionSentAt: string | null;
  submittedAt: string;
  updatedAt?: string;
  updatedBy?: string;
};

/**
 * How long a place is held for an unpaid transfer.
 *
 * Shorter than the Academy's window on purpose: an event has a date, and a
 * seat held for a fortnight before a one-day trade fair is a seat wasted.
 */
export const EVENT_PAYMENT_WINDOW_LABEL = "5 days";

export const HOW_DID_YOU_HEAR_OPTIONS = [
  "Social media",
  "Email from DXI",
  "Friend or colleague",
  "DXI website",
  "Event partner",
  "Word of mouth",
  "Other",
];

/* ── Rules ──────────────────────────────────────────────────────────────── */

/**
 * Where a registration starts.
 *
 * Review comes before money: nobody is told what to pay for a stand until
 * someone has decided they should have one. A paid type that needs no review
 * skips straight to the bank details, and a free one is simply in.
 */
export function initialRegistrationStatus(
  type: Pick<RegistrationType, "requiresApproval" | "feeNaira">
): RegistrationStatus {
  if (type.requiresApproval) {
    return "pending";
  }

  return type.feeNaira > 0 ? "awaiting_payment" : "confirmed";
}

/** Where an approval lands, which is the same fork with the review done. */
export function approvedRegistrationStatus(feeNaira: number): RegistrationStatus {
  return feeNaira > 0 ? "awaiting_payment" : "confirmed";
}

export type RegistrationRejection =
  | "event_not_found"
  | "event_not_open"
  | "registration_closed"
  | "event_full"
  | "type_not_found"
  | "type_full"
  | "already_registered";

export const REGISTRATION_REJECTION_MESSAGES: Record<RegistrationRejection, string> = {
  event_not_found: "We could not find that event.",
  event_not_open: "Registration for this event is not open.",
  registration_closed: "Registration for this event has closed.",
  event_full: "This event is fully booked.",
  type_not_found: "That registration type is not available for this event.",
  type_full: "That registration type is fully booked.",
  already_registered: "This email address is already registered for this event.",
};

/**
 * Why an event cannot be registered for right now, or null if it can.
 *
 * `now` is passed in rather than read so the page's check, the route handler's
 * check and the check inside the Firestore transaction all agree.
 */
export function eventRejectionReason(
  event: Pick<
    EventRecord,
    "status" | "registrationClosesAt" | "capacity" | "registrationCount" | "startsAt"
  >,
  now: Date
): RegistrationRejection | null {
  if (event.status !== "published") {
    return "event_not_open";
  }

  // The close date wins where one is set; otherwise registration runs until
  // the event starts, because a seat sold after the doors open is nobody's
  // idea of one.
  const deadlineAt = new Date(event.registrationClosesAt || event.startsAt);

  if (!Number.isNaN(deadlineAt.getTime()) && now > deadlineAt) {
    return "registration_closed";
  }

  if (event.capacity !== null && event.registrationCount >= event.capacity) {
    return "event_full";
  }

  return null;
}

export function typeRejectionReason(
  type: Pick<RegistrationType, "capacity" | "count"> | undefined
): RegistrationRejection | null {
  if (!type) {
    return "type_not_found";
  }

  if (type.capacity !== null && type.count >= type.capacity) {
    return "type_full";
  }

  return null;
}

/** Seats left on a type, or null when nothing caps it. */
export function seatsLeft(
  event: Pick<EventRecord, "capacity" | "registrationCount">,
  type: Pick<RegistrationType, "capacity" | "count">
): number | null {
  const limits: number[] = [];

  if (type.capacity !== null) {
    limits.push(type.capacity - type.count);
  }

  if (event.capacity !== null) {
    limits.push(event.capacity - event.registrationCount);
  }

  return limits.length > 0 ? Math.max(Math.min(...limits), 0) : null;
}

/* ── Self check-in window ───────────────────────────────────────────────── */

/**
 * How long before the start time the public check-in page opens.
 *
 * A deliberate softening of "active when the event starts": the ticket email
 * tells people to arrive about fifteen minutes early, and a door that refuses
 * everyone until the advertised minute builds the queue it exists to clear.
 * Set to 0 for a hard open exactly on time.
 */
export const CHECK_IN_LEAD_MINUTES = 30;

/**
 * How long an event is assumed to run when no end time was set, so check-in
 * still shuts by itself. Without this an event with no `endsAt` would leave
 * its page open forever.
 */
export const ASSUMED_EVENT_HOURS = 6;

export type CheckInWindowState = "before" | "open" | "closed";

export type CheckInWindow = {
  state: CheckInWindowState;
  opensAt: Date;
  closesAt: Date;
};

/**
 * When an event's public check-in page is live.
 *
 * `now` is passed in rather than read so the page, the route handler and the
 * transaction that actually records an arrival all agree — the same reason
 * `eventRejectionReason` takes it.
 */
export function checkInWindow(
  event: Pick<EventRecord, "startsAt" | "endsAt">,
  now: Date
): CheckInWindow {
  const startsAt = new Date(event.startsAt);
  const opensAt = new Date(startsAt.getTime() - CHECK_IN_LEAD_MINUTES * 60_000);

  const rawEnd = event.endsAt ? new Date(event.endsAt) : null;
  const closesAt =
    rawEnd && !Number.isNaN(rawEnd.getTime())
      ? rawEnd
      : new Date(startsAt.getTime() + ASSUMED_EVENT_HOURS * 3_600_000);

  if (Number.isNaN(startsAt.getTime())) {
    return { state: "closed", opensAt, closesAt };
  }

  if (now < opensAt) {
    return { state: "before", opensAt, closesAt };
  }

  return { state: now > closesAt ? "closed" : "open", opensAt, closesAt };
}

export type SelfCheckInRejection =
  | "not_open_yet"
  | "closed"
  | "unknown_code"
  | "not_confirmed"
  | "already_checked_in";

export const SELF_CHECK_IN_MESSAGES: Record<SelfCheckInRejection, string> = {
  not_open_yet: "Check-in has not opened for this event yet.",
  closed: "Check-in for this event has closed.",
  // Deliberately vague. A public box that distinguishes "no such code" from
  // "that code belongs to another event" is a way to enumerate codes.
  unknown_code: "We could not find that code for this event. Check it and try again.",
  not_confirmed:
    "That registration is not confirmed yet. Please see someone at the desk.",
  already_checked_in: "You are already checked in.",
};

/* ── Identifiers ────────────────────────────────────────────────────────── */

const ACCESS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ACCESS_CODE_LENGTH = 6;

export const ACCESS_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

/**
 * A code like `K7P2QM`, read off a phone screen at a door by someone holding a
 * clipboard. The alphabet omits O/0 and I/1 for the same reason referral codes
 * do — those get confused precisely when there is a queue.
 */
export function generateAccessCode(): string {
  let code = "";

  for (let i = 0; i < ACCESS_CODE_LENGTH; i += 1) {
    code += ACCESS_CODE_ALPHABET[Math.floor(Math.random() * ACCESS_CODE_ALPHABET.length)];
  }

  return code;
}

export function normalizeAccessCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ACCESS_CODE_LENGTH);
}

/** The transfer narration. Derived, so it never needs storing twice. */
export function paymentReference(accessCode: string) {
  return `DXI-EV-${accessCode}`;
}

/**
 * Lowercase, dash-separated, URL-safe. Applied on save rather than on read, so
 * a published event's URL cannot change under someone who has shared it.
 */
export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function normalizeTypeKey(value: string) {
  return normalizeSlug(value).slice(0, 32);
}

/* ── Authoring ──────────────────────────────────────────────────────────── */

/** The mutable half of an event, as the dashboard form sends it. */
export type EventPayload = {
  slug?: string;
  title?: string;
  kind?: string;
  status?: string;
  posterUrl?: string;
  summary?: string;
  description?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  format?: string;
  venueName?: string;
  venueAddress?: string;
  joinUrl?: string;
  capacity?: number | string | null;
  registrationClosesAt?: string | null;
  registrationTypes?: Array<{
    key?: string;
    label?: string;
    description?: string;
    profile?: string;
    feeNaira?: number | string;
    capacity?: number | string | null;
    requiresApproval?: boolean;
  }>;
};

export type ParsedEvent = Omit<
  EventRecord,
  "slug" | "registrationCount" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy"
> & { slug: string };

type ParseResult =
  | { error: string; values: null }
  | { error: null; values: ParsedEvent };

function optionalWholeNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return { ok: true as const, value: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return { ok: false as const, value: null };
  }

  return { ok: true as const, value: parsed };
}

/**
 * Reads a create or update body and returns either a clean event or the first
 * thing wrong with it.
 *
 * Shared by POST and PATCH so an update cannot quietly accept something a
 * create rejects — the same trap `parseCodeSettings` exists to avoid on the
 * referral-code routes.
 *
 * `existing` carries the live tallies. Counts are never read from the request:
 * a dashboard that posts a stale array would otherwise hand back seats that
 * registrations are still holding.
 */
export function parseEventPayload(
  payload: EventPayload,
  existing: EventRecord | null
): ParseResult {
  const title = (payload.title || "").trim().slice(0, 140);

  if (!title) {
    return { error: "Give the event a title.", values: null };
  }

  const slug = normalizeSlug(payload.slug || title);

  if (!slug) {
    return { error: "That title does not make a usable web address.", values: null };
  }

  const kind = (EVENT_KINDS as readonly string[]).includes(payload.kind || "")
    ? (payload.kind as EventKind)
    : null;

  if (!kind) {
    return { error: "Choose what kind of event this is.", values: null };
  }

  const status = (EVENT_STATUSES as readonly string[]).includes(payload.status || "")
    ? (payload.status as EventStatus)
    : null;

  if (!status) {
    return { error: "Choose a status for this event.", values: null };
  }

  const summary = (payload.summary || "").trim().slice(0, 300);

  if (!summary) {
    return { error: "Write the one-line summary shown on the events list.", values: null };
  }

  const posterUrl = (payload.posterUrl || "").trim().slice(0, 600);

  // Optional, but a poster that fails to load leaves a hole in the card, so a
  // malformed one is rejected at the point it is typed rather than discovered
  // on the live listing.
  if (posterUrl && !/^https:\/\/[^\s]+$/i.test(posterUrl)) {
    return {
      error: "The poster must be a full https:// image address, or left blank.",
      values: null,
    };
  }

  const startsAtDate = new Date(payload.startsAt || "");

  if (Number.isNaN(startsAtDate.getTime())) {
    return { error: "Enter a valid start date and time.", values: null };
  }

  let endsAt: string | null = null;

  if (payload.endsAt) {
    const endsAtDate = new Date(payload.endsAt);

    if (Number.isNaN(endsAtDate.getTime())) {
      return { error: "Enter a valid end date and time, or leave it blank.", values: null };
    }

    if (endsAtDate <= startsAtDate) {
      return { error: "The event cannot end before it starts.", values: null };
    }

    endsAt = endsAtDate.toISOString();
  }

  const format: EventFormat = payload.format === "online" ? "online" : "venue";
  const venueName = (payload.venueName || "").trim().slice(0, 140);
  const venueAddress = (payload.venueAddress || "").trim().slice(0, 240);
  const joinUrl = (payload.joinUrl || "").trim().slice(0, 500);

  if (format === "venue" && !venueName) {
    return { error: "Name the venue, or set the event to online.", values: null };
  }

  const capacity = optionalWholeNumber(payload.capacity);

  if (!capacity.ok) {
    return {
      error: "Capacity must be a whole number of at least 1, or blank for uncapped.",
      values: null,
    };
  }

  let registrationClosesAt: string | null = null;

  if (payload.registrationClosesAt) {
    const closesAtDate = new Date(payload.registrationClosesAt);

    if (Number.isNaN(closesAtDate.getTime())) {
      return { error: "Enter a valid registration deadline, or leave it blank.", values: null };
    }

    registrationClosesAt = closesAtDate.toISOString();
  }

  const rawTypes = payload.registrationTypes || [];

  if (rawTypes.length === 0) {
    return { error: "Add at least one registration type.", values: null };
  }

  const seenKeys = new Set<string>();
  const registrationTypes: RegistrationType[] = [];

  for (const raw of rawTypes) {
    const label = (raw.label || "").trim().slice(0, 80);

    if (!label) {
      return { error: "Every registration type needs a name.", values: null };
    }

    const key = normalizeTypeKey(raw.key || label);

    if (!key) {
      return { error: `"${label}" does not make a usable type key.`, values: null };
    }

    if (seenKeys.has(key)) {
      return { error: `Two registration types resolve to "${key}". Rename one.`, values: null };
    }

    seenKeys.add(key);

    const feeNaira = Number(raw.feeNaira ?? 0);

    if (!Number.isFinite(feeNaira) || feeNaira < 0) {
      return { error: `The fee for "${label}" must be zero or more.`, values: null };
    }

    const typeCapacity = optionalWholeNumber(raw.capacity);

    if (!typeCapacity.ok) {
      return {
        error: `The capacity for "${label}" must be a whole number of at least 1, or blank.`,
        values: null,
      };
    }

    registrationTypes.push({
      key,
      label,
      description: (raw.description || "").trim().slice(0, 300),
      profile: raw.profile === "vendor" ? "vendor" : "attendee",
      feeNaira: Math.round(feeNaira),
      capacity: typeCapacity.value,
      requiresApproval: Boolean(raw.requiresApproval),
      // Carried over from the stored event, never from the request. A type
      // that is new to this save legitimately starts at zero.
      count: existing?.registrationTypes.find((type) => type.key === key)?.count ?? 0,
    });
  }

  // Removing a type that people already hold places on would strand them:
  // their registrations would count against a type the event no longer lists,
  // and its seats would never come back.
  const strandedType = existing?.registrationTypes.find(
    (type) => type.count > 0 && !seenKeys.has(type.key)
  );

  if (strandedType) {
    return {
      error: `"${strandedType.label}" has ${strandedType.count} registration(s) and cannot be removed. Set its capacity to close it instead.`,
      values: null,
    };
  }

  return {
    error: null,
    values: {
      slug,
      title,
      kind,
      status,
      posterUrl,
      summary,
      description: (payload.description || "").trim().slice(0, 6000),
      startsAt: startsAtDate.toISOString(),
      endsAt,
      format,
      venueName,
      venueAddress,
      joinUrl,
      capacity: capacity.value,
      registrationClosesAt,
      registrationTypes,
    },
  };
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

/** "Wednesday, 12 March 2026 · 4:00 PM" in Lagos time, wherever it renders. */
export function formatEventDateTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = date.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

  const time = date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });

  return `${day} · ${time}`;
}

/** Collapses a same-day range to one date carrying two times. */
export function formatEventWhen(startsAt: string, endsAt?: string | null): string {
  const start = formatEventDateTime(startsAt);

  if (!endsAt || !start) {
    return start;
  }

  const end = new Date(endsAt);

  if (Number.isNaN(end.getTime())) {
    return start;
  }

  const dayOf = (value: Date) => value.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" });
  const sameDay = dayOf(new Date(startsAt)) === dayOf(end);

  const endTime = end.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });

  return sameDay ? `${start} – ${endTime}` : `${start} – ${formatEventDateTime(endsAt)}`;
}

/** Short form for admin tables and listing cards. */
export function formatEventDay(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

export function formatFee(feeNaira: number) {
  return feeNaira > 0 ? `₦${Math.round(feeNaira).toLocaleString("en-NG")}` : "Free";
}

export function isPastEvent(event: Pick<EventRecord, "startsAt" | "endsAt">, now: Date) {
  const over = new Date(event.endsAt || event.startsAt);
  return !Number.isNaN(over.getTime()) && over < now;
}

/** Where an event lives, in one line. */
export function formatEventPlace(
  event: Pick<EventRecord, "format" | "venueName" | "venueAddress">
) {
  if (event.format === "online") {
    return "Online";
  }

  return [event.venueName, event.venueAddress].filter(Boolean).join(", ") || "Venue to be announced";
}
