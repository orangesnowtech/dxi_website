"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_LOG_PAGE_SIZE, type EmailLogEntry } from "@/lib/email-log";
import styles from "../../admin.module.css";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

export default function EmailLog() {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** The id being resent, so only that row's button is held. */
  const [sending, setSending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [viewing, setViewing] = useState<EmailLogEntry | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/emails");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load emails");
      }

      setEmails(data.emails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const resend = async (email: EmailLogEntry) => {
    // It goes to a real inbox, so it is worth one question first.
    const sure = window.confirm(`Send "${email.subject}" to ${email.to} again?`);

    if (!sure) {
      return;
    }

    setSending(email.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend the email");
      }

      setNotice(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSending(null);
      // Either way there is a new entry: the resend, or the failed attempt.
      await fetchEmails();
    }
  };

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();

    return emails.filter(
      (email) =>
        (status === "all" || email.status === status) &&
        (!term ||
          email.to.toLowerCase().includes(term) ||
          email.toName.toLowerCase().includes(term) ||
          email.subject.toLowerCase().includes(term))
    );
  }, [emails, search, status]);

  const failed = emails.filter((email) => email.status === "failed").length;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Emails</h1>
          <p className={styles.subtitle}>
            Every email the site sends, newest first — and the ones that failed to go. Open one to
            read it, or send it again.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label htmlFor="emailSearch">Search</label>
            <input
              id="emailSearch"
              type="search"
              className={styles.grantInput}
              placeholder="Recipient or subject"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label htmlFor="emailStatus">Status</label>
            <select
              id="emailStatus"
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className={styles.stats}>
            <span>
              Showing: <strong>{shown.length}</strong>
            </span>
            <span>
              Failed: <strong>{failed}</strong>
            </span>
          </div>
        </div>

        {loading && emails.length === 0 ? (
          <div className={styles.loading}>Loading emails…</div>
        ) : emails.length === 0 ? (
          <div className={styles.empty}>
            Nothing has been logged yet. Emails appear here from the moment this page went live;
            anything sent before then was not recorded.
          </div>
        ) : shown.length === 0 ? (
          <div className={styles.empty}>No emails match that search.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sent</th>
                  <th>To</th>
                  <th>Subject</th>
                  <th>From</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((email) => (
                  <tr key={email.id} className={styles.row}>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(email.createdAt)}</td>
                    <td>
                      <span className={styles.name}>{email.to || "—"}</span>
                      {email.toName && <div className={styles.codeHint}>{email.toName}</div>}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.nameBtn}
                        onClick={() => setViewing(email)}
                      >
                        {email.subject || "(no subject)"}
                      </button>
                      {email.resendOf && (
                        <div className={styles.codeHint}>Resent by {email.resentBy}</div>
                      )}
                    </td>
                    <td>{email.fromName}</td>
                    <td>
                      {email.status === "sent" ? (
                        <span className={styles.sentNote}>Sent</span>
                      ) : (
                        <span
                          style={{ color: "#dc2626", fontWeight: 600 }}
                          title={email.error || undefined}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button
                          type="button"
                          className={styles.viewDetailsBtn}
                          onClick={() => setViewing(email)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          disabled={sending !== null}
                          onClick={() => resend(email)}
                        >
                          {sending === email.id ? "Sending…" : "Resend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {emails.length >= EMAIL_LOG_PAGE_SIZE && (
          <p className={styles.codeHint}>
            Showing the latest {EMAIL_LOG_PAGE_SIZE}. Older emails are still kept.
          </p>
        )}

        {viewing && (
          <div className={styles.modalOverlay} onClick={() => setViewing(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{viewing.subject || "(no subject)"}</h2>
                <button
                  type="button"
                  className={styles.closeBtn}
                  aria-label="Close"
                  onClick={() => setViewing(null)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalContent}>
                <p className={styles.codeHint}>
                  To {viewing.toName ? `${viewing.toName} <${viewing.to}>` : viewing.to} · from{" "}
                  {viewing.fromName} &lt;{viewing.fromAddress}&gt; ·{" "}
                  {formatDateTime(viewing.createdAt)}
                </p>
                {viewing.attachments.length > 0 && (
                  <p className={styles.codeHint}>
                    Attached: {viewing.attachments.join(", ")} (not kept, and not included in a
                    resend)
                  </p>
                )}
                {viewing.status === "failed" && (
                  <div className={styles.error}>This one did not go. {viewing.error}</div>
                )}
                {/*
                  Sandboxed with no permissions: the body is HTML we generated,
                  but it carries text people typed into forms, and an email is
                  only ever meant to be looked at.
                */}
                <iframe
                  title="Email body"
                  sandbox=""
                  srcDoc={viewing.html}
                  style={{
                    width: "100%",
                    height: "60vh",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: "#ffffff",
                  }}
                />
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.closeModalBtn}
                  disabled={sending !== null}
                  onClick={() => resend(viewing)}
                >
                  {sending === viewing.id ? "Sending…" : "Resend this email"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
