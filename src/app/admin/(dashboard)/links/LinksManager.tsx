"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_SITE_ORIGIN,
  normalizeShortCode,
  shareOrigin,
  shortLinkPath,
  suggestShortCode,
  type ShortLink,
} from "@/lib/links";
import { EVENT_STATUS_LABELS, type EventStatus } from "@/lib/events";
import styles from "../../admin.module.css";

type LinkedEvent = {
  slug: string;
  title: string;
  status: EventStatus;
  startsAt: string;
};

type FormState = {
  code: string;
  label: string;
  target: string;
  eventSlug: string;
};

const emptyForm: FormState = { code: "", label: "", target: "", eventSlug: "" };

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("en-NG") : "—";
}

export default function LinksManager({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [events, setEvents] = useState<LinkedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  /** The code being edited, or null while creating. */
  const [editing, setEditing] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  /**
   * The site's real address, which is what every code here is shown and copied
   * against. Deliberately not the browser's origin: the preview backend serves
   * this same dashboard, and a code copied there has to work on the poster it
   * ends up on. Falls back to the browser only in local development, where
   * nothing is configured. Held in state because it is resolved after mount.
   */
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(shareOrigin(window.location.origin));
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/links");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load links");
      }

      setLinks(data.links);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const linkedSlugs = useMemo(
    () => new Set(links.map((link) => link.eventSlug).filter(Boolean)),
    [links]
  );

  const unlinkedEvents = useMemo(
    () => events.filter((event) => !linkedSlugs.has(event.slug)),
    [events, linkedSlugs]
  );

  const totalClicks = useMemo(
    () => links.reduce((sum, link) => sum + (link.clickCount || 0), 0),
    [links]
  );

  /** Renaming is refused server-side once a link has been followed. */
  const codeIsFixed = Boolean(editing && editing.clickCount > 0);

  const save = async (body: FormState & { active?: boolean }, code: string | null) => {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        code ? `/api/admin/links?code=${encodeURIComponent(code)}` : "/api/admin/links",
        {
          method: code ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: body.code,
            label: body.label,
            target: body.target,
            eventSlug: body.eventSlug || null,
          }),
        }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save the link");
      }

      setNotice(data.message);
      resetForm();
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save(form, editing ? editing.code : null);
  };

  const handleSuggest = () => {
    // The label seeds the code, so a link for "Lagos Growth Summit" starts
    // "lagos-growth" rather than something nobody can read back over a call.
    setField("code", suggestShortCode(form.label || form.target));
  };

  const handleEdit = (link: ShortLink) => {
    setEditing(link);
    setForm({
      code: link.code,
      label: link.label,
      target: link.target,
      eventSlug: link.eventSlug || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** One click from an event with no link to an event with one. */
  const handleLinkEvent = (event: LinkedEvent) => {
    setEditing(null);
    setForm({
      code: suggestShortCode(event.title),
      label: event.title,
      target: `/events/${event.slug}`,
      eventSlug: event.slug,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (link: ShortLink) => {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/links?code=${encodeURIComponent(link.code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !link.active }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update the link");
      }

      setNotice(data.message);
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (link: ShortLink) => {
    const confirmed = window.confirm(
      `Delete /r/${link.code}?\n\nNobody has followed it, so nothing breaks. A link that has been followed cannot be deleted — pause that instead.`
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/links?code=${encodeURIComponent(link.code)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete the link");
      }

      setNotice(data.message);
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (link: ShortLink) => {
    try {
      await navigator.clipboard.writeText(`${origin}${shortLinkPath(link.code)}`);
      setCopied(link.code);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy to the clipboard. Select the link and copy it manually.");
    }
  };

  const preview = form.code
    ? `${origin || DEFAULT_SITE_ORIGIN}${shortLinkPath(normalizeShortCode(form.code))}`
    : "The address people will be given.";

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Links</h1>
          <p className={styles.subtitle}>
            Short, sayable addresses the team owns. Every event gets one automatically, and
            the assistant hands out that link rather than the long one. Where a link points
            can be changed at any time — the code on the poster stays, the page it opens
            moves — so a link already sent to a hundred people is never wasted.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <form onSubmit={handleSubmit} className={styles.codeForm}>
          <h2 className={styles.codeFormTitle}>
            {editing ? `Edit /r/${editing.code}` : "Create a link"}
          </h2>

          <div className={styles.codeFormGrid}>
            <div className={styles.codeField}>
              <label htmlFor="code">Code</label>
              <div className={styles.codeInputRow}>
                <input
                  id="code"
                  value={form.code}
                  onChange={(event) => setField("code", normalizeShortCode(event.target.value))}
                  placeholder="lagos-summit"
                  required
                  // Fixed once anyone has followed the link: renaming it would
                  // break whatever is already carrying the old code.
                  disabled={codeIsFixed}
                  className={styles.grantInput}
                />
                {!codeIsFixed && (
                  <button type="button" onClick={handleSuggest} className={styles.generateBtn}>
                    Suggest
                  </button>
                )}
              </div>
              <span className={styles.codeHint}>
                {codeIsFixed
                  ? `Followed ${editing?.clickCount} time(s), so the code is fixed. Change where it points instead.`
                  : preview}
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="target">Points to</label>
              <input
                id="target"
                value={form.target}
                onChange={(event) => setField("target", event.target.value)}
                placeholder="/events/lagos-growth-summit"
                required
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                A path on this site, starting with /, or a full https:// address elsewhere.
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="label">What it is for</label>
              <input
                id="label"
                value={form.label}
                onChange={(event) => setField("label", event.target.value)}
                placeholder="Lagos Growth Summit — flyer link"
                required
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>Internal only. Nobody outside sees this.</span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="eventSlug">Event</label>
              <select
                id="eventSlug"
                value={form.eventSlug}
                onChange={(event) => setField("eventSlug", event.target.value)}
                className={styles.select}
              >
                <option value="">Not an event link</option>
                {events.map((event) => (
                  <option key={event.slug} value={event.slug}>
                    {event.title} — {EVENT_STATUS_LABELS[event.status]}
                  </option>
                ))}
              </select>
              <span className={styles.codeHint}>
                Attach it to an event and the assistant sends this link when that event comes
                up. One link per event; the oldest wins if there are two.
              </span>
            </div>
          </div>

          <div className={styles.codeFormActions}>
            <button type="submit" disabled={busy} className={styles.loginBtn}>
              {busy ? "Saving…" : editing ? "Save changes" : "Create link"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className={styles.paginationBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {!loading && unlinkedEvents.length > 0 && (
          <div className={styles.codeForm}>
            <h2 className={styles.codeFormTitle}>Events with no link</h2>
            <p className={styles.codeHint}>
              These were created before they could get one automatically. The assistant sends
              the long address for them until they have a link.
            </p>
            <div className={styles.actionCell}>
              {unlinkedEvents.map((event) => (
                <button
                  key={event.slug}
                  type="button"
                  onClick={() => handleLinkEvent(event)}
                  className={styles.viewDetailsBtn}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className={styles.stats}>
            <span>
              Links: <strong>{links.length}</strong>
            </span>
            <span>
              Follows: <strong>{totalClicks}</strong>
            </span>
            <span>
              Events covered: <strong>{linkedSlugs.size}</strong>
            </span>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading links…</div>
        ) : links.length === 0 ? (
          <div className={styles.empty}>
            No links yet. Create one above and it answers on /r/ straight away.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Link</th>
                  <th>What it is for</th>
                  <th>Points to</th>
                  <th>Follows</th>
                  <th>Last used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.code} className={styles.row}>
                    <td className={styles.name}>
                      <button
                        type="button"
                        onClick={() => handleCopy(link)}
                        className={styles.copyCodeBtn}
                        title="Copy the full address"
                      >
                        {copied === link.code ? "Copied ✓" : `/r/${link.code}`}
                      </button>
                    </td>
                    <td>{link.label}</td>
                    <td>
                      <a
                        href={link.target}
                        target="_blank"
                        rel="noreferrer"
                        title={link.target}
                      >
                        {link.target.length > 44
                          ? `${link.target.slice(0, 44)}…`
                          : link.target}
                      </a>
                    </td>
                    <td>{link.clickCount || 0}</td>
                    <td>{formatDate(link.lastClickedAt)}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: link.active ? "#10b981" : "#6b7280" }}
                      >
                        {link.active ? "Live" : "Paused"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button
                          onClick={() => handleEdit(link)}
                          disabled={busy}
                          className={styles.viewDetailsBtn}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(link)}
                          disabled={busy}
                          className={styles.paginationBtn}
                        >
                          {link.active ? "Pause" : "Resume"}
                        </button>
                        {isSuperAdmin && (link.clickCount || 0) === 0 && (
                          <button
                            onClick={() => handleDelete(link)}
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
    </div>
  );
}
