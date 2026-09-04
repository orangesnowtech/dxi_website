"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EVENT_KINDS,
  EVENT_KIND_LABELS,
  EVENT_STATUSES,
  EVENT_STATUS_COLORS,
  EVENT_STATUS_LABELS,
  formatEventDay,
  formatFee,
  normalizeSlug,
  type EventKind,
  type EventRecord,
  type EventStatus,
} from "@/lib/events";
import { shareOrigin, shortLinkPath } from "@/lib/links";
import styles from "../../admin.module.css";

/** What the server says deleting one event would destroy. */
type DeletionImpact = {
  registrations: { total: number; confirmed: number; paid: number; checkedIn: number };
  shortLinks: { code: string; target: string }[];
  recordings: { slug: string; title: string; status: string; access: string }[];
};

type TypeForm = {
  key: string;
  label: string;
  description: string;
  profile: "attendee" | "vendor";
  feeNaira: string;
  capacity: string;
  requiresApproval: boolean;
  /** Live tally, shown but never sent — the server keeps its own. */
  count: number;
};

type EventForm = {
  slug: string;
  title: string;
  kind: EventKind;
  status: EventStatus;
  posterUrl: string;
  summary: string;
  description: string;
  startsAt: string;
  endsAt: string;
  format: "online" | "venue";
  venueName: string;
  venueAddress: string;
  joinUrl: string;
  capacity: string;
  registrationClosesAt: string;
  registrationTypes: TypeForm[];
};

const emptyType = (): TypeForm => ({
  key: "",
  label: "",
  description: "",
  profile: "attendee",
  feeNaira: "0",
  capacity: "",
  requiresApproval: false,
  count: 0,
});

const emptyForm = (): EventForm => ({
  slug: "",
  title: "",
  kind: "webinar",
  status: "draft",
  posterUrl: "",
  summary: "",
  description: "",
  startsAt: "",
  endsAt: "",
  format: "online",
  venueName: "",
  venueAddress: "",
  joinUrl: "",
  capacity: "",
  registrationClosesAt: "",
  registrationTypes: [{ ...emptyType(), label: "General admission" }],
});

/**
 * ISO to the value a `datetime-local` input wants.
 *
 * Deliberately the browser's own timezone rather than a forced Africa/Lagos:
 * an admin sees and types the wall-clock time on the machine in front of them,
 * and `new Date(value)` on submit reverses it exactly.
 */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function toIso(localValue: string) {
  if (!localValue) {
    return null;
  }

  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function eventToForm(event: EventRecord): EventForm {
  return {
    slug: event.slug,
    title: event.title,
    kind: event.kind,
    status: event.status,
    posterUrl: event.posterUrl || "",
    summary: event.summary,
    description: event.description || "",
    startsAt: toLocalInput(event.startsAt),
    endsAt: toLocalInput(event.endsAt),
    format: event.format,
    venueName: event.venueName || "",
    venueAddress: event.venueAddress || "",
    joinUrl: event.joinUrl || "",
    capacity: event.capacity === null ? "" : String(event.capacity),
    registrationClosesAt: toLocalInput(event.registrationClosesAt),
    registrationTypes: event.registrationTypes.map((type) => ({
      key: type.key,
      label: type.label,
      description: type.description || "",
      profile: type.profile,
      feeNaira: String(type.feeNaira),
      capacity: type.capacity === null ? "" : String(type.capacity),
      requiresApproval: type.requiresApproval,
      count: type.count,
    })),
  };
}

export default function EventsManager({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState<EventForm | null>(null);
  /** The slug being edited, or null when the form is creating. */
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);
  /** Slug whose public link was just copied, for the button's confirmation. */
  const [copied, setCopied] = useState<string | null>(null);
  /** `slug -> short code`, for the events that have a link. Managed on /admin/links. */
  const [shortCodes, setShortCodes] = useState<Record<string, string>>({});
  /** The event the delete dialog is open for, or null when it is closed. */
  const [deleting, setDeleting] = useState<EventRecord | null>(null);
  const [impact, setImpact] = useState<DeletionImpact | null>(null);
  const [impactError, setImpactError] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState("");
  /** The separate yes to destroying the registrations. Never pre-ticked. */
  const [consentToRegistrations, setConsentToRegistrations] = useState(false);
  const [exported, setExported] = useState(false);

  /**
   * Sends a poster straight to storage and keeps only the URL on the form.
   *
   * Uploading on selection rather than on save means a slow upload never holds
   * up the rest of the form, and a failure costs the picture rather than
   * everything else that was typed.
   */
  const handlePosterUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slug", form?.slug || normalizeSlug(form?.title || "") || "unfiled");

      const response = await fetch("/api/admin/events/poster", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not upload that poster");
      }

      setField("posterUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload that poster");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Copies one of an event's public URLs, against the site's real address —
   * not the browser's, which on the preview backend would hand out a link to
   * the preview backend.
   *
   * `kind` distinguishes the two so the confirmation lands on the button that
   * was actually pressed rather than both.
   */
  const handleCopyLink = async (slug: string, kind: "page" | "check-in") => {
    const code = shortCodes[slug];

    // The short link is what gets copied when there is one: this button feeds
    // WhatsApp messages and flyers, not browser bars. Check-in is not
    // shortened — it is read off a screen at the door, not passed around.
    const path =
      kind === "check-in"
        ? `/events/${slug}/check-in`
        : code
          ? shortLinkPath(code)
          : `/events/${slug}`;

    try {
      await navigator.clipboard.writeText(`${shareOrigin(window.location.origin)}${path}`);
      setCopied(`${slug}:${kind}`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Could not copy — the browser blocked clipboard access.");
    }
  };

  /**
   * Publishes or unpublishes straight from the list.
   *
   * Warns before pulling something the public may already be holding tickets
   * for: unpublishing hides the event page and stops registration, and anyone
   * who follows a shared link gets a 404 rather than an explanation.
   */
  const handleStatusChange = async (event: EventRecord, status: EventStatus) => {
    if (
      event.status === "published" &&
      status !== "published" &&
      event.registrationCount > 0 &&
      !window.confirm(
        `"${event.title}" has ${event.registrationCount} registration(s).\n\n` +
          `Taking it off the site hides the event page and closes registration. ` +
          `Anyone following a link they were sent will get a "not found" page.\n\nContinue?`
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/events/${event.slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update the status");
      }

      setNotice(`"${event.title}" is now ${EVENT_STATUS_LABELS[status].toLowerCase()}.`);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/events?status=${statusFilter}`);

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load events");
      }

      setEvents(data.events);
      setShortCodes(data.shortCodes || {});
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const setField = <K extends keyof EventForm>(field: K, value: EventForm[K]) =>
    setForm((previous) => (previous ? { ...previous, [field]: value } : previous));

  const setTypeField = <K extends keyof TypeForm>(index: number, field: K, value: TypeForm[K]) =>
    setForm((previous) =>
      previous
        ? {
            ...previous,
            registrationTypes: previous.registrationTypes.map((type, i) =>
              i === index ? { ...type, [field]: value } : type
            ),
          }
        : previous
    );

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();

    if (!form) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    const body = {
      slug: form.slug || normalizeSlug(form.title),
      title: form.title,
      kind: form.kind,
      status: form.status,
      posterUrl: form.posterUrl,
      summary: form.summary,
      description: form.description,
      startsAt: toIso(form.startsAt),
      endsAt: toIso(form.endsAt),
      format: form.format,
      venueName: form.venueName,
      venueAddress: form.venueAddress,
      joinUrl: form.joinUrl,
      capacity: form.capacity === "" ? null : form.capacity,
      registrationClosesAt: toIso(form.registrationClosesAt),
      registrationTypes: form.registrationTypes.map((type) => ({
        key: type.key || undefined,
        label: type.label,
        description: type.description,
        profile: type.profile,
        feeNaira: type.feeNaira === "" ? 0 : type.feeNaira,
        capacity: type.capacity === "" ? null : type.capacity,
        requiresApproval: type.requiresApproval,
      })),
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/events/${editing}` : "/api/admin/events",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save the event");
      }

      setNotice(editing ? "Event updated." : `Event created at /events/${data.slug}`);
      setForm(null);
      setEditing(null);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Opens the delete dialog and asks the server what it would cost.
   *
   * The numbers are read before anything is confirmed, because "delete this
   * event" and "delete the ninety people who paid for it" are different
   * decisions, and only one of them is written on the button.
   */
  const handleDelete = async (event: EventRecord) => {
    setDeleting(event);
    setImpact(null);
    setImpactError(null);
    setConfirmSlug("");
    setConsentToRegistrations(false);
    setExported(false);

    try {
      const response = await fetch(`/api/admin/events/${event.slug}/deletion`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not check what this would affect.");
      }

      setImpact(data.impact as DeletionImpact);
    } catch (err) {
      setImpactError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const closeDeleteDialog = () => {
    setDeleting(null);
    setImpact(null);
    setImpactError(null);
    setConfirmSlug("");
    setConsentToRegistrations(false);
    setExported(false);
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/events/${deleting.slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmSlug,
          deleteRegistrations: consentToRegistrations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete the event");
      }

      // Says what actually happened rather than just "deleted". The replays
      // pulled back to draft are a visible change to a public page, and
      // nobody asked for that in so many words.
      const parts = [`Deleted "${deleting.title}".`];

      if (data.registrationsDeleted > 0) {
        parts.push(`${data.registrationsDeleted} registration(s) destroyed.`);
      }

      if (data.shortLinksCutLoose > 0) {
        parts.push(
          `${data.shortLinksCutLoose} short link(s) kept but now pointing at a dead page — retarget them under Links.`
        );
      }

      if (data.recordingsDrafted > 0) {
        parts.push(
          `${data.recordingsDrafted} replay(s) pulled back to draft: their gate checked codes against this event.`
        );
      }

      setNotice(parts.join(" "));
      closeDeleteDialog();
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Events</h1>
          <p className={styles.subtitle}>
            Create an event, decide who can register for it and at what price, then watch the
            registrations come in.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        {form ? (
          <form className={styles.codeForm} onSubmit={handleSubmit}>
            <h2 className={styles.codeFormTitle}>
              {editing ? `Editing "${form.title || editing}"` : "New event"}
            </h2>

            <div className={styles.codeFormGrid}>
              <div className={styles.codeField}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  className={styles.grantInput}
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                  maxLength={140}
                />
                <span className={styles.codeHint}>
                  Public address: /events/{form.slug || normalizeSlug(form.title) || "…"}
                  {editing ? " (fixed once created)" : ""}
                </span>
              </div>

              <div className={styles.codeField}>
                <label htmlFor="kind">Kind</label>
                <select
                  id="kind"
                  className={styles.select}
                  value={form.kind}
                  onChange={(e) => setField("kind", e.target.value as EventKind)}
                >
                  {EVENT_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {EVENT_KIND_LABELS[kind]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.codeField}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className={styles.select}
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as EventStatus)}
                >
                  {EVENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {EVENT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <span className={styles.codeHint}>
                  Only published events appear on the site.
                </span>
              </div>

              <div className={styles.codeField}>
                <label htmlFor="startsAt">Starts</label>
                <input
                  id="startsAt"
                  type="datetime-local"
                  className={styles.grantInput}
                  value={form.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                  required
                />
              </div>

              <div className={styles.codeField}>
                <label htmlFor="endsAt">Ends</label>
                <input
                  id="endsAt"
                  type="datetime-local"
                  className={styles.grantInput}
                  value={form.endsAt}
                  onChange={(e) => setField("endsAt", e.target.value)}
                />
                <span className={styles.codeHint}>Optional.</span>
              </div>

              <div className={styles.codeField}>
                <label htmlFor="registrationClosesAt">Registration closes</label>
                <input
                  id="registrationClosesAt"
                  type="datetime-local"
                  className={styles.grantInput}
                  value={form.registrationClosesAt}
                  onChange={(e) => setField("registrationClosesAt", e.target.value)}
                />
                <span className={styles.codeHint}>
                  Blank means registration runs until the event starts.
                </span>
              </div>

              <div className={styles.codeField}>
                <label htmlFor="format">Format</label>
                <select
                  id="format"
                  className={styles.select}
                  value={form.format}
                  onChange={(e) => setField("format", e.target.value as "online" | "venue")}
                >
                  <option value="online">Online</option>
                  <option value="venue">In person</option>
                </select>
              </div>

              {form.format === "online" ? (
                <div className={styles.codeField}>
                  <label htmlFor="joinUrl">Join link</label>
                  <input
                    id="joinUrl"
                    className={styles.grantInput}
                    value={form.joinUrl}
                    onChange={(e) => setField("joinUrl", e.target.value)}
                    placeholder="https://meet.google.com/…"
                  />
                  <span className={styles.codeHint}>
                    Never shown on the site. Sent only to confirmed registrants.
                  </span>
                </div>
              ) : (
                <>
                  <div className={styles.codeField}>
                    <label htmlFor="venueName">Venue name</label>
                    <input
                      id="venueName"
                      className={styles.grantInput}
                      value={form.venueName}
                      onChange={(e) => setField("venueName", e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.codeField}>
                    <label htmlFor="venueAddress">Venue address</label>
                    <input
                      id="venueAddress"
                      className={styles.grantInput}
                      value={form.venueAddress}
                      onChange={(e) => setField("venueAddress", e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className={styles.codeField}>
                <label htmlFor="capacity">Total capacity</label>
                <input
                  id="capacity"
                  type="number"
                  min={1}
                  className={styles.grantInput}
                  value={form.capacity}
                  onChange={(e) => setField("capacity", e.target.value)}
                  placeholder="Uncapped"
                />
                <span className={styles.codeHint}>
                  Across every registration type. Blank for uncapped.
                </span>
              </div>
            </div>

            <div className={styles.codeField} style={{ marginTop: 18 }}>
              <label htmlFor="poster">Square poster</label>
              <div className={styles.posterRow}>
                {/*
                  The square doubles as the drop target and a second way to
                  open the picker, so the whole control is clickable rather
                  than just the button beside it.
                */}
                <button
                  type="button"
                  className={`${styles.posterPreview} ${dragging ? styles.posterPreviewActive : ""}`}
                  onClick={() => posterInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handlePosterUpload(file);
                  }}
                  aria-label={form.posterUrl ? "Replace the poster" : "Upload a poster"}
                >
                  {form.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.posterUrl} alt="Poster preview" />
                  ) : (
                    <span>{dragging ? "Drop it here" : "No poster"}</span>
                  )}
                </button>

                <div className={styles.posterControls}>
                  {/* The real input is driven by the button; on its own it is
                      too easy to miss among the rest of the form. */}
                  <input
                    id="poster"
                    ref={posterInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.hiddenFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePosterUpload(file);
                      // Cleared so picking the same file twice still fires.
                      e.target.value = "";
                    }}
                  />

                  <button
                    type="button"
                    className={styles.uploadBtn}
                    disabled={uploading}
                    onClick={() => posterInputRef.current?.click()}
                  >
                    {uploading
                      ? "Uploading…"
                      : form.posterUrl
                        ? "Replace poster"
                        : "Upload poster"}
                  </button>

                  <span className={styles.codeHint}>
                    JPEG, PNG or WebP, up to 5MB. Drag one onto the square, or paste a URL
                    below. Cropped to a square from the top on the card, so upload it square.
                  </span>

                  <input
                    className={styles.grantInput}
                    value={form.posterUrl}
                    onChange={(e) => setField("posterUrl", e.target.value)}
                    placeholder="…or paste an image URL"
                  />

                  {form.posterUrl && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => setField("posterUrl", "")}
                    >
                      Remove poster
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.codeField} style={{ marginTop: 18 }}>
              <label htmlFor="summary">Summary</label>
              <input
                id="summary"
                className={styles.grantInput}
                value={form.summary}
                onChange={(e) => setField("summary", e.target.value)}
                required
                maxLength={300}
              />
              <span className={styles.codeHint}>One line, shown on the events list.</span>
            </div>

            <div className={styles.codeField} style={{ marginTop: 18 }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className={styles.grantInput}
                style={{ minHeight: 140, resize: "vertical" }}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="The full pitch. Leave a blank line between paragraphs."
              />
            </div>

            <h3 className={styles.codeFormTitle} style={{ marginTop: 26 }}>
              Registration types
            </h3>

            <div className={styles.typeRows}>
              {form.registrationTypes.map((type, index) => (
                <div key={index} className={styles.typeRow}>
                  <div className={styles.typeRowHead}>
                    <strong>{type.label || `Type ${index + 1}`}</strong>
                    {type.count > 0 && (
                      <span className={styles.countPill}>{type.count} registered</span>
                    )}
                    <span className={styles.adminBarSpacer} />
                    <button
                      type="button"
                      className={styles.revokeBtn}
                      disabled={form.registrationTypes.length === 1 || type.count > 0}
                      title={
                        type.count > 0
                          ? "This type has registrations and cannot be removed."
                          : undefined
                      }
                      onClick={() =>
                        setForm((previous) =>
                          previous
                            ? {
                                ...previous,
                                registrationTypes: previous.registrationTypes.filter(
                                  (_, i) => i !== index
                                ),
                              }
                            : previous
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className={styles.codeFormGrid}>
                    <div className={styles.codeField}>
                      <label htmlFor={`label-${index}`}>Name</label>
                      <input
                        id={`label-${index}`}
                        className={styles.grantInput}
                        value={type.label}
                        onChange={(e) => setTypeField(index, "label", e.target.value)}
                        required
                        placeholder="Visitor, Vendor, Member…"
                      />
                    </div>

                    <div className={styles.codeField}>
                      <label htmlFor={`profile-${index}`}>Form</label>
                      <select
                        id={`profile-${index}`}
                        className={styles.select}
                        value={type.profile}
                        onChange={(e) =>
                          setTypeField(index, "profile", e.target.value as "attendee" | "vendor")
                        }
                      >
                        <option value="attendee">Attendee — personal details only</option>
                        <option value="vendor">Vendor — adds stand questions</option>
                      </select>
                    </div>

                    <div className={styles.codeField}>
                      <label htmlFor={`fee-${index}`}>Fee (₦)</label>
                      <input
                        id={`fee-${index}`}
                        type="number"
                        min={0}
                        className={styles.grantInput}
                        value={type.feeNaira}
                        onChange={(e) => setTypeField(index, "feeNaira", e.target.value)}
                      />
                      <span className={styles.codeHint}>
                        0 is free. Anything more is settled by bank transfer.
                      </span>
                    </div>

                    {/*
                      The per-type "Places" input is hidden until an event
                      actually needs different limits per type. With one type
                      it only duplicates the event's Total capacity, and a
                      mismatch between the two reads as a bug.

                      Hidden, not removed: `type.capacity` stays in form state
                      and is still submitted, so an event that already carries
                      per-type limits keeps them through an edit. The server
                      rules and `seatsLeft` are untouched, so restoring this is
                      putting the input back.
                    */}

                    <div className={styles.codeField}>
                      <label htmlFor={`description-${index}`}>Description</label>
                      <input
                        id={`description-${index}`}
                        className={styles.grantInput}
                        value={type.description}
                        onChange={(e) => setTypeField(index, "description", e.target.value)}
                        placeholder="Shown under the name on the form."
                      />
                    </div>

                    <div className={styles.codeField}>
                      <label htmlFor={`approval-${index}`}>Review</label>
                      <label className={styles.checkboxRow}>
                        <input
                          id={`approval-${index}`}
                          type="checkbox"
                          checked={type.requiresApproval}
                          onChange={(e) =>
                            setTypeField(index, "requiresApproval", e.target.checked)
                          }
                        />
                        <span>Review each application before confirming it</span>
                      </label>
                      <span className={styles.codeHint}>
                        Paid places are only sent bank details once approved.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.generateBtn}
              style={{ marginTop: 14 }}
              onClick={() =>
                setForm((previous) =>
                  previous
                    ? { ...previous, registrationTypes: [...previous.registrationTypes, emptyType()] }
                    : previous
                )
              }
            >
              + Add a registration type
            </button>

            <div className={styles.codeFormActions}>
              <button type="submit" className={styles.loginBtn} disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create event"}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => {
                  setForm(null);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.controls}>
            <div className={styles.filterGroup}>
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                className={styles.select}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {EVENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className={styles.loginBtn}
              style={{ width: "auto" }}
              onClick={() => {
                setForm(emptyForm());
                setEditing(null);
                setNotice(null);
              }}
            >
              + New event
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading events…</div>
        ) : events.length === 0 ? (
          <div className={styles.empty}>No events yet. Create one to get started.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Kind</th>
                  <th>When</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Types</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.slug} className={styles.row}>
                    <td>
                      <div className={styles.name}>{event.title}</div>
                      <span className={styles.referralNote}>
                        /events/{event.slug}
                        {shortCodes[event.slug] ? ` · /r/${shortCodes[event.slug]}` : ""}
                      </span>
                    </td>
                    <td>{EVENT_KIND_LABELS[event.kind]}</td>
                    <td>{formatEventDay(event.startsAt)}</td>
                    <td>
                      {/*
                        Editable in place. Pulling an event off the site should
                        not mean opening the full form and re-saving every
                        field, which is what it took before.
                      */}
                      <select
                        className={styles.statusSelect}
                        style={{
                          borderColor: EVENT_STATUS_COLORS[event.status],
                          color: EVENT_STATUS_COLORS[event.status],
                        }}
                        value={event.status}
                        disabled={busy}
                        onChange={(e) =>
                          handleStatusChange(event, e.target.value as EventStatus)
                        }
                      >
                        {EVENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {EVENT_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {event.registrationCount}
                      {event.capacity !== null ? ` / ${event.capacity}` : ""}
                    </td>
                    <td>
                      {event.registrationTypes.map((type) => (
                        <div key={type.key} className={styles.referralNote}>
                          {type.label} — {formatFee(type.feeNaira)} ({type.count}
                          {type.capacity !== null ? `/${type.capacity}` : ""})
                        </div>
                      ))}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <Link
                          href={`/admin/events/${event.slug}`}
                          className={styles.viewDetailsBtn}
                        >
                          Registrations
                        </Link>
                        <button
                          type="button"
                          className={styles.copyCodeBtn}
                          onClick={() => handleCopyLink(event.slug, "page")}
                          title={
                            shortCodes[event.slug]
                              ? `Copy /r/${shortCodes[event.slug]} — the short link for ${event.title}`
                              : `Copy the public link for ${event.title}`
                          }
                        >
                          {copied === `${event.slug}:page` ? "Copied!" : "Copy link"}
                        </button>
                        <button
                          type="button"
                          className={styles.copyCodeBtn}
                          onClick={() => handleCopyLink(event.slug, "check-in")}
                          title="Copy the self check-in link — for a screen or QR code at the door"
                        >
                          {copied === `${event.slug}:check-in` ? "Copied!" : "Copy check-in"}
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => {
                            setForm(eventToForm(event));
                            setEditing(event.slug);
                            setNotice(null);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            className={styles.revokeBtn}
                            onClick={() => handleDelete(event)}
                            disabled={busy}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {deleting && (
        <div className={styles.modalOverlay} onClick={closeDeleteDialog}>
          <div
            className={styles.modal}
            style={{ maxWidth: 620 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Delete &ldquo;{deleting.title}&rdquo;</h2>
              <button type="button" className={styles.closeModalBtn} onClick={closeDeleteDialog}>
                Cancel
              </button>
            </div>

            <div className={styles.modalContent}>
              {impactError && <div className={styles.error}>{impactError}</div>}

              {!impact && !impactError && <p>Checking what this would affect…</p>}

              {impact && (
                <>
                  <p className={styles.deleteLead}>
                    Archiving is reversible and keeps everything. This is not. Here is what
                    goes:
                  </p>

                  <ul className={styles.deleteImpact}>
                    <li>
                      <strong>{impact.registrations.total} registration(s)</strong> deleted
                      permanently
                      {impact.registrations.total > 0 && (
                        <span className={styles.deleteImpactNote}>
                          {impact.registrations.confirmed} confirmed,{" "}
                          {impact.registrations.paid} of whom paid,{" "}
                          {impact.registrations.checkedIn} checked in on the day
                        </span>
                      )}
                    </li>
                    <li>
                      <strong>The event page and its poster</strong>, so{" "}
                      <code>/events/{deleting.slug}</code> becomes a 404
                    </li>
                    {impact.shortLinks.length > 0 && (
                      <li>
                        <strong>{impact.shortLinks.length} short link(s)</strong> kept, but left
                        pointing at a dead page
                        <span className={styles.deleteImpactNote}>
                          {impact.shortLinks.map((link) => `/r/${link.code}`).join(", ")} — a
                          printed code is not ours to break, so retarget them under Links
                        </span>
                      </li>
                    )}
                    {impact.recordings.length > 0 && (
                      <li>
                        <strong>{impact.recordings.length} replay(s)</strong> kept, but cut loose
                        from this event
                        <span className={styles.deleteImpactNote}>
                          {impact.recordings
                            .map(
                              (recording) =>
                                `${recording.title}${
                                  recording.access === "registrants"
                                    ? " (gated on this event's codes — will be pulled back to draft)"
                                    : ""
                                }`
                            )
                            .join("; ")}
                        </span>
                      </li>
                    )}
                  </ul>

                  {impact.registrations.total > 0 && (
                    <>
                      {/*
                        The rows are the only record that some of these people
                        ever paid us. Offered before the confirmation, not
                        after, because after is too late.
                      */}
                      <a
                        href={`/api/admin/events/${deleting.slug}/export`}
                        onClick={() => setExported(true)}
                        className={styles.exportBtn}
                      >
                        {exported ? "Downloaded ✓ — take another copy" : "Download the registration list first"}
                      </a>

                      <label className={styles.deleteConsent}>
                        <input
                          type="checkbox"
                          checked={consentToRegistrations}
                          onChange={(e) => setConsentToRegistrations(e.target.checked)}
                        />
                        <span>
                          Yes, delete the {impact.registrations.total} registration(s) too. I
                          understand this cannot be undone.
                        </span>
                      </label>
                    </>
                  )}

                  <label className={styles.deleteConfirmLabel} htmlFor="confirmSlug">
                    Type <code>{deleting.slug}</code> to confirm
                  </label>
                  <input
                    id="confirmSlug"
                    value={confirmSlug}
                    onChange={(e) => setConfirmSlug(e.target.value)}
                    autoComplete="off"
                    className={styles.grantInput}
                    placeholder={deleting.slug}
                  />
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.closeModalBtn} onClick={closeDeleteDialog}>
                Keep the event
              </button>
              <button
                type="button"
                className={styles.revokeBtn}
                onClick={confirmDelete}
                disabled={
                  busy ||
                  !impact ||
                  confirmSlug.trim().toLowerCase() !== deleting.slug ||
                  (impact.registrations.total > 0 && !consentToRegistrations)
                }
              >
                {busy ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
