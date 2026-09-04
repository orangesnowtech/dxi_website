"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RECORDING_ACCESS,
  RECORDING_ACCESS_HINTS,
  RECORDING_ACCESS_LABELS,
  RECORDING_STATUSES,
  RECORDING_STATUS_COLORS,
  RECORDING_STATUS_LABELS,
  accessNeedsCodes,
  accessNeedsEvent,
  formatDuration,
  normalizeRecordingSlug,
  type Recording,
  type RecordingAccess,
  type RecordingStatus,
} from "@/lib/recordings";
import styles from "../../admin.module.css";

type EventOption = { slug: string; title: string; startsAt: string };

/** A replay as the admin list sends it: the record plus its watch tally. */
type RecordingRow = Recording & { watchCount?: number };

/** One authorised watch, as recorded the moment the gate let somebody in. */
type Watch = {
  id: string;
  watcher: string;
  name: string;
  phone: string;
  access: string;
  at: string;
};

type FormState = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: RecordingStatus;
  access: RecordingAccess;
  eventSlug: string;
  /** Whatever came off the clipboard: the embed snippet, a link, or an id. */
  loomEmbed: string;
  /** One code per line. Sent as typed; the server normalises and dedupes. */
  accessCodes: string;
  thumbnailUrl: string;
  durationSeconds: string;
  approxSizeMb: string;
  availableUntil: string;
};

const emptyForm: FormState = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  status: "draft",
  access: "code",
  eventSlug: "",
  loomEmbed: "",
  accessCodes: "",
  thumbnailUrl: "",
  durationSeconds: "",
  approxSizeMb: "",
  availableUntil: "",
};

/** `datetime-local` wants `YYYY-MM-DDTHH:mm` with no zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function RecordingsManager({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  const [recordings, setRecordings] = useState<RecordingRow[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  /** The slug being edited, or null while creating. */
  const [editing, setEditing] = useState<string | null>(null);
  /** The replay whose watch list is open, or null when the panel is closed. */
  const [viewing, setViewing] = useState<RecordingRow | null>(null);
  const [watchers, setWatchers] = useState<Watch[] | null>(null);
  const [watchersError, setWatchersError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/recordings?status=all");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load replays");
      }

      setRecordings(data.recordings);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        editing
          ? `/api/admin/recordings?slug=${encodeURIComponent(editing)}`
          : "/api/admin/recordings",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            eventSlug: form.eventSlug || null,
            durationSeconds: form.durationSeconds || 0,
            approxSizeMb: form.approxSizeMb || 0,
            availableUntil: form.availableUntil
              ? new Date(form.availableUntil).toISOString()
              : null,
          }),
        }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save the replay");
      }

      setNotice(data.message);
      resetForm();
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Opens the watch list for one replay.
   *
   * Loaded on demand rather than with the table: the list is the interesting
   * part but it is also the long part, and most visits to this page are to
   * add a replay rather than to read who watched one.
   */
  const showWatchers = async (recording: RecordingRow) => {
    setViewing(recording);
    setWatchers(null);
    setWatchersError(null);

    try {
      const response = await fetch(
        `/api/admin/recordings/${encodeURIComponent(recording.slug)}/watchers`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load the watch list.");
      }

      setWatchers(data.watchers as Watch[]);
    } catch (err) {
      setWatchersError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (recording: Recording) => {
    setEditing(recording.slug);
    setForm({
      slug: recording.slug,
      title: recording.title,
      summary: recording.summary,
      description: recording.description,
      status: recording.status,
      access: recording.access,
      eventSlug: recording.eventSlug || "",
      // The bare id, not the original snippet — we never stored that. Pasting
      // a fresh embed over it is how you change the video or fix its shape;
      // leaving it alone keeps both.
      loomEmbed: recording.loomVideoId,
      accessCodes: (recording.accessCodes || []).join("\n"),
      thumbnailUrl: recording.thumbnailUrl,
      durationSeconds: recording.durationSeconds ? String(recording.durationSeconds) : "",
      approxSizeMb: recording.approxSizeMb ? String(recording.approxSizeMb) : "",
      availableUntil: toLocalInput(recording.availableUntil),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (recording: Recording) => {
    const confirmed = window.confirm(
      `Delete the replay "${recording.title}"?\n\nThis removes our record of it. The Loom recording itself is untouched.`
    );

    if (!confirmed) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/admin/recordings?slug=${encodeURIComponent(recording.slug)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete the replay");
      }

      setNotice(data.message);
      await fetchAll();
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
          <h1>Replays</h1>
          <p className={styles.subtitle}>
            Recordings of webinars and trainings, on demand. Record it in Loom, paste the embed
            here, and send the access code to whoever should see it. Each replay decides for
            itself who may watch — on a code we send, open to anyone, in exchange for a name and
            email, only for people who registered, or only for Academy members. A closing date
            keeps the live room full while still honouring the ticket.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <form onSubmit={handleSubmit} className={styles.codeForm}>
          <h2 className={styles.codeFormTitle}>
            {editing ? `Edit ${editing}` : "Add a replay"}
          </h2>

          <div className={styles.codeFormGrid}>
            <div className={styles.codeField}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                {editing
                  ? `Lives at /replays/${editing}`
                  : `Will live at /replays/${normalizeRecordingSlug(form.title) || "…"}`}
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="access">Who can watch</label>
              <select
                id="access"
                value={form.access}
                onChange={(e) => setField("access", e.target.value as RecordingAccess)}
                className={styles.select}
              >
                {RECORDING_ACCESS.map((value) => (
                  <option key={value} value={value}>
                    {RECORDING_ACCESS_LABELS[value]}
                  </option>
                ))}
              </select>
              <span className={styles.codeHint}>{RECORDING_ACCESS_HINTS[form.access]}</span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="eventSlug">
                Event {accessNeedsEvent(form.access) ? "(required)" : "(optional)"}
              </label>
              <select
                id="eventSlug"
                value={form.eventSlug}
                onChange={(e) => setField("eventSlug", e.target.value)}
                className={styles.select}
              >
                <option value="">Not from an event</option>
                {events.map((event) => (
                  <option key={event.slug} value={event.slug}>
                    {event.title}
                  </option>
                ))}
              </select>
              <span className={styles.codeHint}>
                {accessNeedsEvent(form.access)
                  ? "Access codes are checked against this event's registrations."
                  : "Links the replay back to the event it was recorded at."}
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setField("status", e.target.value as RecordingStatus)}
                className={styles.select}
              >
                {RECORDING_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {RECORDING_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <span className={styles.codeHint}>
                Published puts it in the library. A replay with no video cannot be published.
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="availableUntil">Closes on</label>
              <input
                id="availableUntil"
                type="datetime-local"
                value={form.availableUntil}
                onChange={(e) => setField("availableUntil", e.target.value)}
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                Blank never closes. A window is what stops a free replay teaching people to skip
                the live session.
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="durationSeconds">Runtime (seconds)</label>
              <input
                id="durationSeconds"
                type="number"
                min="0"
                value={form.durationSeconds}
                onChange={(e) => setField("durationSeconds", e.target.value)}
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                {formatDuration(Number(form.durationSeconds) || 0) || "Shown on the card."}
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="approxSizeMb">Data size (MB)</label>
              <input
                id="approxSizeMb"
                type="number"
                min="0"
                value={form.approxSizeMb}
                onChange={(e) => setField("approxSizeMb", e.target.value)}
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                Shown before they press play. On mobile data an hour of video can cost more than
                the ticket did.
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="thumbnailUrl">Thumbnail URL</label>
              <input
                id="thumbnailUrl"
                value={form.thumbnailUrl}
                onChange={(e) => setField("thumbnailUrl", e.target.value)}
                placeholder="https://…"
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>Full https address. Blank shows a plain card.</span>
            </div>
          </div>

          <div className={styles.codeField} style={{ marginTop: 18 }}>
            <label htmlFor="loomEmbed">Loom video</label>
            <textarea
              id="loomEmbed"
              value={form.loomEmbed}
              onChange={(e) => setField("loomEmbed", e.target.value)}
              className={styles.grantInput}
              style={{ minHeight: 90, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
              placeholder="Paste the embed code from Loom: Share, Embed, Copy"
            />
            <span className={styles.codeHint}>
              The full embed snippet, a share link or the bare id all work. The snippet is best,
              because it also carries the shape of the recording, which is what stops the player
              letterboxing it. The id never reaches a browser until somebody has passed the gate.
            </span>
          </div>

          <div className={styles.codeField} style={{ marginTop: 18 }}>
            <label htmlFor="accessCodes">
              Access codes {accessNeedsCodes(form.access) ? "(required)" : "(unused for this gate)"}
            </label>
            <textarea
              id="accessCodes"
              value={form.accessCodes}
              onChange={(e) => setField("accessCodes", e.target.value)}
              className={styles.grantInput}
              style={{ minHeight: 90, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
              placeholder={"ONE PER LINE\nDXIREPLAY24\nK7P2QMX9"}
            />
            <span className={styles.codeHint}>
              {accessNeedsCodes(form.access)
                ? "One per line, or separated by commas. Spaces and dashes are ignored when somebody types theirs in. One shared code is fine; a code each is what tells you who actually watched."
                : "Only used when the gate above is set to the access code we send."}
            </span>
          </div>

          <div className={styles.codeField} style={{ marginTop: 18 }}>
            <label htmlFor="summary">Summary</label>
            <input
              id="summary"
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
              required
              className={styles.grantInput}
              placeholder="One line, shown on the library card."
            />
          </div>

          <div className={styles.codeField} style={{ marginTop: 18 }}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className={styles.grantInput}
              style={{ minHeight: 140, resize: "vertical" }}
              placeholder="What they will get out of watching. Blank line between paragraphs."
            />
          </div>

          <div className={styles.codeFormActions}>
            <button type="submit" disabled={busy} className={styles.loginBtn}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add replay"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className={styles.paginationBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <div className={styles.loading}>Loading replays…</div>
        ) : recordings.length === 0 ? (
          <div className={styles.empty}>
            No replays yet. Add one above — save it as a draft until the Loom recording is ready.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Replay</th>
                  <th>Who can watch</th>
                  <th>Runtime</th>
                  <th>Watched</th>
                  <th>Closes</th>
                  <th>Video</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recordings.map((recording) => (
                  <tr key={recording.slug} className={styles.row}>
                    <td>
                      <div className={styles.name}>{recording.title}</div>
                      <span className={styles.referralNote}>/replays/{recording.slug}</span>
                    </td>
                    <td>
                      {RECORDING_ACCESS_LABELS[recording.access]}
                      {accessNeedsCodes(recording.access) && (
                        <span className={styles.referralNote}>
                          {(recording.accessCodes || []).length} code
                          {(recording.accessCodes || []).length === 1 ? "" : "s"} issued
                        </span>
                      )}
                    </td>
                    <td>{formatDuration(recording.durationSeconds) || "—"}</td>
                    <td>
                      {/*
                        A count on its own is a vanity metric. It is a button
                        because the names behind it are the point.
                      */}
                      {recording.watchCount ? (
                        <button
                          type="button"
                          onClick={() => showWatchers(recording)}
                          className={styles.viewDetailsBtn}
                        >
                          {recording.watchCount} watch
                          {recording.watchCount === 1 ? "" : "es"}
                        </button>
                      ) : (
                        <span className={styles.referralNote}>None yet</span>
                      )}
                    </td>
                    <td>
                      {recording.availableUntil
                        ? new Date(recording.availableUntil).toLocaleDateString("en-NG")
                        : "Never"}
                    </td>
                    <td>
                      <span className={styles.referralNote}>
                        {recording.loomVideoId ? "Attached" : "None yet"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: RECORDING_STATUS_COLORS[recording.status] }}
                      >
                        {RECORDING_STATUS_LABELS[recording.status]}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button
                          onClick={() => handleEdit(recording)}
                          disabled={busy}
                          className={styles.viewDetailsBtn}
                        >
                          Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(recording)}
                            disabled={busy}
                            className={styles.deleteBtn}
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

      {viewing && (
        <div className={styles.modalOverlay} onClick={() => setViewing(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Who watched &ldquo;{viewing.title}&rdquo;</h2>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setViewing(null)}
              >
                Close
              </button>
            </div>

            <div className={styles.modalContent}>
              {watchersError && <div className={styles.error}>{watchersError}</div>}
              {!watchers && !watchersError && <p>Loading the watch list…</p>}

              {watchers && watchers.length === 0 && (
                <p>Nobody has watched this one yet.</p>
              )}

              {watchers && watchers.length > 0 && (
                <>
                  {/*
                    Said plainly, because the number above the table and the
                    number of people in it are not the same thing and somebody
                    will otherwise report it as a bug.
                  */}
                  <p className={styles.deleteLead}>
                    {watchers.length} watch{watchers.length === 1 ? "" : "es"} by{" "}
                    {new Set(watchers.map((watch) => watch.watcher || watch.name)).size}{" "}
                    person/people. Somebody coming back tomorrow is counted twice.
                  </p>

                  <a
                    href={`/api/admin/recordings/${encodeURIComponent(viewing.slug)}/export`}
                    className={styles.exportBtn}
                  >
                    Download as a spreadsheet
                  </a>

                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Who</th>
                          <th>Phone</th>
                          <th>How they got in</th>
                        </tr>
                      </thead>
                      <tbody>
                        {watchers.map((watch) => (
                          <tr key={watch.id} className={styles.row}>
                            <td>{new Date(watch.at).toLocaleString("en-NG")}</td>
                            <td>
                              <div className={styles.name}>{watch.name || "—"}</div>
                              <span className={styles.referralNote}>
                                {watch.watcher || "no email captured"}
                              </span>
                            </td>
                            <td>{watch.phone || "—"}</td>
                            <td>
                              {RECORDING_ACCESS_LABELS[watch.access as RecordingAccess] ||
                                watch.access}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
