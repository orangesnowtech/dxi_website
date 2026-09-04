/**
 * Replays.
 *
 * A webinar somebody paid for and then missed is a refund request waiting to
 * happen. A recording turns it into something they still got — and turns a
 * one-evening event into an asset that keeps earning.
 *
 * Deliberately free of imports, like `events.ts` and `links.ts`, so the public
 * player, the admin dashboard and the route handlers all decide who may watch
 * the same way. Nothing here touches Firestore, and nothing here knows what
 * Loom is; both live behind their own modules.
 */

/* ── Who may watch ──────────────────────────────────────────────────────── */

export const RECORDING_ACCESS = ["public", "code", "lead", "registrants", "academy"] as const;

export type RecordingAccess = (typeof RECORDING_ACCESS)[number];

export const RECORDING_ACCESS_LABELS: Record<RecordingAccess, string> = {
  public: "Anyone",
  code: "With the access code we send",
  lead: "After name and email",
  registrants: "People who registered",
  academy: "Academy members",
};

export const RECORDING_ACCESS_HINTS: Record<RecordingAccess, string> = {
  public: "No gate at all. Use for a talk that is meant to travel.",
  code: "You set the codes here and send them out. Also asks for a name and email, so the watch list is worth reading.",
  lead: "Captured as a lead before it plays — the replay works as the magnet.",
  registrants: "Verified against the access code in their ticket email. Needs an event.",
  academy: "Checked against approved Academy applications. Keeps strangers out, not impostors — anyone who knows a member's address gets in.",
};

/** Gates that cannot be judged without knowing which event a replay belongs to. */
export function accessNeedsEvent(access: RecordingAccess) {
  return access === "registrants";
}

/** Gates checked against codes stored on the replay itself. */
export function accessNeedsCodes(access: RecordingAccess) {
  return access === "code";
}

/**
 * How an access code is written down and how it is compared.
 *
 * Uppercased and stripped of everything else, so somebody typing "k7p2 qm"
 * off a phone screen still gets in, and so a code saved with a stray space
 * still matches what we sent. Lives here rather than beside the verifier
 * because the admin form and the gate must agree exactly; if only one of them
 * normalised, every code with a hyphen in it would be a support message.
 */
export function normalizeAccessCode(value: string) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Short enough to guess is not a gate. */
export const MIN_ACCESS_CODE_LENGTH = 4;

/** No sane replay needs more, and an unbounded array is an unbounded document. */
export const MAX_ACCESS_CODES = 500;

/**
 * Reads the codes out of whatever the admin form sent.
 *
 * Accepts one per line, commas, or an array, because all three are what
 * pasting a column out of a spreadsheet produces. Deduplicated, since issuing
 * the same code twice is a typo rather than an intention.
 */
export function parseAccessCodes(input: string | string[] | null | undefined) {
  const raw = Array.isArray(input) ? input : String(input || "").split(/[\s,;]+/);

  return [...new Set(raw.map(normalizeAccessCode).filter(Boolean))];
}

/* ── The record ─────────────────────────────────────────────────────────── */

export const RECORDING_STATUSES = ["draft", "published", "archived"] as const;

export type RecordingStatus = (typeof RECORDING_STATUSES)[number];

export const RECORDING_STATUS_LABELS: Record<RecordingStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const RECORDING_STATUS_COLORS: Record<RecordingStatus, string> = {
  draft: "#6b7280",
  published: "#10b981",
  archived: "#9ca3af",
};

export type Recording = {
  /** Doubles as the Firestore document id and the public URL segment. */
  slug: string;
  title: string;
  /** One line under the title in the library. */
  summary: string;
  /** Long copy on the watch page. Plain text; blank lines split paragraphs. */
  description: string;
  status: RecordingStatus;
  access: RecordingAccess;
  /**
   * The event this replays, or null for a recording that stands alone — a
   * masterclass, a clip, something that never had a registration behind it.
   */
  eventSlug: string | null;
  /**
   * Loom's id for the video — the 32 hex characters out of the embed code.
   *
   * A secret, not a key: anyone holding it can watch. It is stripped from
   * everything the public side ever sees, and only handed out by the watch
   * route to a request that has already passed the gate.
   */
  loomVideoId: string;
  /**
   * Player height as a percentage of its width, from the pasted embed.
   *
   * Loom records the shape of the screen it recorded, so this is usually not
   * 16:9. Keeping the embed's own number is what stops every replay playing
   * inside black bars.
   */
  aspectPercent: number;
  /**
   * The codes that open the `code` gate, normalised and deduplicated.
   *
   * A list rather than a single string so one replay can be opened with a
   * shared code, or with a code each — same field, and the second costs
   * nothing to grow into. Never leaves the server.
   */
  accessCodes: string[];
  /** Square-ish still for the library card. Any https URL. */
  thumbnailUrl: string;
  /** Runtime, for the card and for telling people what they are committing to. */
  durationSeconds: number;
  /**
   * Rough download size at the default rendition, in megabytes.
   *
   * Shown to the viewer before they press play. On Lagos mobile data an hour
   * of video can cost more than the event did, and a number on the page is the
   * difference between an informed choice and a nasty surprise.
   */
  approxSizeMb: number;
  /**
   * When the replay stops being watchable, or null for no limit.
   *
   * A free, permanent replay quietly teaches people not to turn up live. A
   * window keeps the live room full while still honouring the ticket.
   */
  availableUntil: string | null;
  publishedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
};

/** What the public library is allowed to see. Never carries the id or the codes. */
export type PublicRecording = Omit<
  Recording,
  "loomVideoId" | "accessCodes" | "createdBy" | "updatedBy"
>;

/* ── Rules ──────────────────────────────────────────────────────────────── */

/**
 * Why a replay cannot be watched right now, or null if it can.
 *
 * Separate from the access gate: this is about the recording itself being
 * available at all, before anybody's credentials come into it. Checking it
 * first means an expired replay says so, rather than asking for a code and
 * then refusing it.
 */
export type RecordingRejection = "not_found" | "not_published" | "expired";

export const RECORDING_REJECTION_MESSAGES: Record<RecordingRejection, string> = {
  not_found: "We could not find that replay.",
  not_published: "That replay is not available yet.",
  expired: "That replay has closed. Ask us and we will see what we can do.",
};

export function recordingRejectionReason(
  recording: Pick<Recording, "status" | "availableUntil">,
  now: Date
): RecordingRejection | null {
  if (recording.status !== "published") {
    return "not_published";
  }

  if (recording.availableUntil && new Date(recording.availableUntil) <= now) {
    return "expired";
  }

  return null;
}

/** Whether a watch window is closing soon enough to be worth saying out loud. */
export function closingSoon(availableUntil: string | null, now: Date) {
  if (!availableUntil) {
    return false;
  }

  const msLeft = new Date(availableUntil).getTime() - now.getTime();

  return msLeft > 0 && msLeft < 7 * 24 * 60 * 60 * 1000;
}

/**
 * Slug rules, matching `normalizeSlug` in `events.ts`.
 *
 * Duplicated rather than shared because both files are deliberately
 * import-free — the same reasoning that has `referral.ts` and `events.ts`
 * each carrying their own.
 */
export function normalizeRecordingSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.round((total % 3600) / 60);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
}

/**
 * The data warning, in the words a viewer needs.
 *
 * Deliberately concrete rather than a vague "data charges may apply". Somebody
 * deciding whether to watch on mobile needs the number.
 */
export function formatSize(approxSizeMb: number) {
  if (!Number.isFinite(approxSizeMb) || approxSizeMb <= 0) {
    return "";
  }

  return approxSizeMb >= 1000
    ? `about ${(approxSizeMb / 1000).toFixed(1)} GB`
    : `about ${Math.round(approxSizeMb)} MB`;
}

/* ── Admin payload parsing ──────────────────────────────────────────────── */

export type RecordingPayload = {
  slug?: string;
  title?: string;
  summary?: string;
  description?: string;
  status?: string;
  access?: string;
  eventSlug?: string | null;
  loomVideoId?: string;
  aspectPercent?: number | string;
  accessCodes?: string | string[];
  thumbnailUrl?: string;
  durationSeconds?: number | string;
  approxSizeMb?: number | string;
  availableUntil?: string | null;
};

export type ParsedRecording = Omit<
  Recording,
  "slug" | "publishedAt" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy"
> & { slug: string };

type ParseResult =
  | { error: string; values: null }
  | { error: null; values: ParsedRecording };

function optionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return { ok: true as const, value: 0 };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: false as const, value: 0 };
  }

  return { ok: true as const, value: parsed };
}

/**
 * Reads a create or update body and returns either a clean recording or the
 * first thing wrong with it. Shared by POST and PATCH so an update cannot
 * quietly accept something a create rejects — the same trap `parseEventPayload`
 * and `parseLinkSettings` exist to avoid.
 */
export function parseRecordingPayload(payload: RecordingPayload): ParseResult {
  const title = (payload.title || "").trim().slice(0, 160);

  if (!title) {
    return { error: "Give the replay a title.", values: null };
  }

  const slug = normalizeRecordingSlug(payload.slug || title);

  if (!slug) {
    return { error: "That title does not make a usable web address.", values: null };
  }

  const status = (RECORDING_STATUSES as readonly string[]).includes(payload.status || "")
    ? (payload.status as RecordingStatus)
    : null;

  if (!status) {
    return { error: "Choose a status for this replay.", values: null };
  }

  const access = (RECORDING_ACCESS as readonly string[]).includes(payload.access || "")
    ? (payload.access as RecordingAccess)
    : null;

  if (!access) {
    return { error: "Choose who is allowed to watch this.", values: null };
  }

  const summary = (payload.summary || "").trim().slice(0, 300);

  if (!summary) {
    return { error: "Write the one-line summary shown in the library.", values: null };
  }

  const eventSlug = (payload.eventSlug || "").trim().slice(0, 140) || null;

  // A registrants-only replay is verified against the codes issued for one
  // event. Without an event there is nothing to check a code against, and the
  // gate would silently let everybody through.
  if (accessNeedsEvent(access) && !eventSlug) {
    return {
      error: "A replay for registrants must say which event they registered for.",
      values: null,
    };
  }

  const accessCodes = parseAccessCodes(payload.accessCodes);

  // Without a code the `code` gate is a form that lets everybody through, and
  // it would be a while before anyone noticed.
  if (accessNeedsCodes(access) && accessCodes.length === 0) {
    return {
      error: "Add at least one access code, or choose a different way in.",
      values: null,
    };
  }

  if (accessCodes.some((code) => code.length < MIN_ACCESS_CODE_LENGTH)) {
    return {
      error: `Access codes need at least ${MIN_ACCESS_CODE_LENGTH} letters or numbers. A shorter one can be guessed.`,
      values: null,
    };
  }

  if (accessCodes.length > MAX_ACCESS_CODES) {
    return { error: `That is more than ${MAX_ACCESS_CODES} codes for one replay.`, values: null };
  }

  const thumbnailUrl = (payload.thumbnailUrl || "").trim().slice(0, 600);

  if (thumbnailUrl && !/^https:\/\//i.test(thumbnailUrl)) {
    return { error: "The thumbnail must be a full https:// image address, or blank.", values: null };
  }

  const duration = optionalNumber(payload.durationSeconds);

  if (!duration.ok) {
    return { error: "The runtime must be a number of seconds, or blank.", values: null };
  }

  const size = optionalNumber(payload.approxSizeMb);

  if (!size.ok) {
    return { error: "The size must be a number of megabytes, or blank.", values: null };
  }

  let availableUntil: string | null = null;

  if (payload.availableUntil) {
    const trimmed = String(payload.availableUntil).trim();

    if (Number.isNaN(new Date(trimmed).getTime())) {
      return { error: "The closing date is not a valid date.", values: null };
    }

    availableUntil = new Date(trimmed).toISOString();
  }

  // Published without a video is a page that offers a replay and then cannot
  // play one. Draft is the state for a recording still being prepared.
  const loomVideoId = (payload.loomVideoId || "").trim().toLowerCase();

  if (status === "published" && !loomVideoId) {
    return {
      error: "There is no Loom video attached yet, so this cannot be published. Save it as a draft.",
      values: null,
    };
  }

  const aspect = Number(payload.aspectPercent);
  const aspectPercent = Number.isFinite(aspect) && aspect >= 20 && aspect <= 250 ? aspect : 56.25;

  return {
    error: null,
    values: {
      slug,
      title,
      summary,
      description: (payload.description || "").trim().slice(0, 8000),
      status,
      access,
      eventSlug,
      loomVideoId,
      aspectPercent,
      accessCodes,
      thumbnailUrl,
      durationSeconds: Math.round(duration.value),
      approxSizeMb: Math.round(size.value),
      availableUntil,
    },
  };
}
