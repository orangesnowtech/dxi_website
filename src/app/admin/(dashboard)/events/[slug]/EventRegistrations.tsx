"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
  approvedRegistrationStatus,
  formatEventWhen,
  formatFee,
  paymentReference,
  type EventRecord,
  type EventRegistration,
  type RegistrationStatus,
} from "@/lib/events";
import styles from "../../../admin.module.css";

const PAGE_SIZE = 50;

function formatMoment(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
}

export default function EventRegistrations({ event }: { event: EventRecord }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventRegistration | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/registrations?event=${event.slug}&status=${statusFilter}&limit=${PAGE_SIZE}&offset=${offset}`
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load registrations");
      }

      setRegistrations(data.registrations);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [event.slug, offset, router, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const counts = useMemo(() => {
    const checkedIn = registrations.filter((registration) => registration.checkedIn).length;
    return { checkedIn };
  }, [registrations]);

  const setStatus = async (registration: EventRegistration, status: RegistrationStatus) => {
    const response = await fetch(`/api/admin/registrations?id=${registration.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not update the registration");
    }
  };

  const sendEmail = async (
    registration: EventRegistration,
    kind: "ticket" | "payment" | "rejection",
    note?: string
  ) => {
    const response = await fetch("/api/admin/registrations/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: registration.id, kind, note }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not send the email");
    }

    return data.message as string;
  };

  /** Wraps an action so every path reports the same way and always reloads. */
  const run = async (registration: EventRegistration, action: () => Promise<string>) => {
    setBusyId(registration.id);
    setError(null);
    setNotice(null);

    try {
      setNotice(await action());
      await fetchRegistrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  /**
   * Approving is two writes and they belong together: the status moves, and
   * the registrant is told. Doing them separately is how somebody ends up
   * approved in the dashboard and silent in their inbox.
   */
  const handleApprove = (registration: EventRegistration) =>
    run(registration, async () => {
      const next = approvedRegistrationStatus(registration.feeNaira);
      await setStatus(registration, next);
      const sent = await sendEmail(registration, next === "confirmed" ? "ticket" : "payment");
      return `Approved. ${sent}`;
    });

  const handleMarkPaid = (registration: EventRegistration) =>
    run(registration, async () => {
      await setStatus(registration, "confirmed");
      const sent = await sendEmail(registration, "ticket");
      return `Marked paid and confirmed. ${sent}`;
    });

  const handleReject = (registration: EventRegistration) => {
    const note = window.prompt(
      `Rejecting ${registration.fullName}.\n\nAdd a note for them (optional — leave blank for the standard message):`
    );

    if (note === null) {
      return;
    }

    return run(registration, async () => {
      await setStatus(registration, "rejected");
      const sent = await sendEmail(registration, "rejection", note || undefined);
      return `Rejected. ${sent}`;
    });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          {/*
            A bordered control rather than a line of grey text: under a 2.5rem
            title, a plain link is swamped and reads as a caption.
          */}
          <div className={styles.pageNav}>
            <Link href="/admin/events" className={styles.backLink}>
              ← All events
            </Link>
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              Public page ↗
            </Link>
            <Link
              href={`/events/${event.slug}/check-in`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              Check-in page ↗
            </Link>
          </div>
          <h1>{event.title}</h1>
          <p className={styles.subtitle}>
            {formatEventWhen(event.startsAt, event.endsAt)} · {event.registrationCount}
            {event.capacity !== null ? ` of ${event.capacity}` : ""} registered
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              className={styles.select}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setOffset(0);
              }}
            >
              <option value="all">All</option>
              {REGISTRATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {REGISTRATION_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.stats}>
            <span>
              Showing <strong>{registrations.length}</strong> of <strong>{total}</strong>
            </span>
            <span>
              Checked in on this page: <strong>{counts.checkedIn}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading registrations…</div>
        ) : registrations.length === 0 ? (
          <div className={styles.empty}>No registrations match this filter.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Fee</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Checked in</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} className={styles.row}>
                    <td>
                      {/*
                        The Details button lives in the last of eight columns,
                        which on most screens sits off the right edge of a table
                        that scrolls sideways. The name is always visible, so it
                        opens the same panel.
                      */}
                      <button
                        type="button"
                        className={styles.nameBtn}
                        onClick={() => setSelected(registration)}
                        title="See everything this person submitted"
                      >
                        {registration.fullName}
                      </button>
                      {registration.organizationName && (
                        <span className={styles.referralNote}>
                          {registration.organizationName}
                        </span>
                      )}
                    </td>
                    <td>
                      <a href={`mailto:${registration.email}`}>{registration.email}</a>
                      <span className={styles.referralNote}>{registration.phone}</span>
                    </td>
                    <td>{registration.typeLabel}</td>
                    <td>{formatFee(registration.feeNaira)}</td>
                    <td>
                      <code>{registration.accessCode}</code>
                      {registration.feeNaira > 0 && (
                        <span className={styles.referralNote}>
                          {paymentReference(registration.accessCode)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: REGISTRATION_STATUS_COLORS[registration.status],
                        }}
                      >
                        {REGISTRATION_STATUS_LABELS[registration.status]}
                      </span>
                    </td>
                    <td>
                      {registration.checkedIn ? (
                        <span className={styles.sentNote}>
                          {formatMoment(registration.checkedInAt)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        {registration.status === "pending" && (
                          <button
                            type="button"
                            className={styles.sendPaymentBtn}
                            disabled={busyId === registration.id}
                            onClick={() => handleApprove(registration)}
                          >
                            Approve
                          </button>
                        )}

                        {registration.status === "awaiting_payment" && (
                          <>
                            <button
                              type="button"
                              className={styles.sendPaymentBtn}
                              disabled={busyId === registration.id}
                              onClick={() => handleMarkPaid(registration)}
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              disabled={busyId === registration.id}
                              onClick={() =>
                                run(registration, () => sendEmail(registration, "payment"))
                              }
                            >
                              Resend details
                            </button>
                          </>
                        )}

                        {registration.status === "confirmed" && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            disabled={busyId === registration.id}
                            onClick={() => run(registration, () => sendEmail(registration, "ticket"))}
                          >
                            Resend ticket
                          </button>
                        )}

                        {registration.status !== "rejected" &&
                          registration.status !== "cancelled" && (
                            <button
                              type="button"
                              className={styles.revokeBtn}
                              disabled={busyId === registration.id}
                              onClick={() => handleReject(registration)}
                            >
                              Reject
                            </button>
                          )}

                        <button
                          type="button"
                          className={styles.viewDetailsBtn}
                          onClick={() => setSelected(registration)}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(offset > 0 || hasMore) && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              {offset + 1}–{offset + registrations.length} of {total}
            </span>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={!hasMore}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        )}

        {selected && (
          <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{selected.fullName}</h2>
                <button
                  type="button"
                  className={styles.closeModalBtn}
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.section}>
                  <h3>Registration</h3>
                  <div className={styles.field}>
                    <strong>Type:</strong> {selected.typeLabel} ({selected.profile})
                  </div>
                  <div className={styles.field}>
                    <strong>Status:</strong> {REGISTRATION_STATUS_LABELS[selected.status]}
                  </div>
                  <div className={styles.field}>
                    <strong>Fee:</strong> {formatFee(selected.feeNaira)}
                  </div>
                  <div className={styles.field}>
                    <strong>Access code:</strong> {selected.accessCode}
                  </div>
                  <div className={styles.field}>
                    <strong>Submitted:</strong> {formatMoment(selected.submittedAt)}
                  </div>
                  <div className={styles.field}>
                    <strong>Payment details sent:</strong>{" "}
                    {formatMoment(selected.paymentDetailsSentAt)}
                  </div>
                  {/*
                    The moment we handed the confirmation to ZeptoMail. Compare
                    it with the Received header in the inbox: a gap here is a
                    delay at the mail provider, not in the dashboard.
                  */}
                  <div className={styles.field}>
                    <strong>Confirmation sent:</strong> {formatMoment(selected.ticketSentAt)}
                  </div>
                  <div className={styles.field}>
                    <strong>Paid:</strong> {formatMoment(selected.paidAt)}
                  </div>
                  <div className={styles.field}>
                    <strong>Checked in:</strong> {formatMoment(selected.checkedInAt)}
                    {selected.checkedInBy ? ` by ${selected.checkedInBy}` : ""}
                  </div>
                </div>

                <div className={styles.section}>
                  <h3>Contact</h3>
                  <div className={styles.field}>
                    <strong>Email:</strong> {selected.email}
                  </div>
                  <div className={styles.field}>
                    <strong>Phone:</strong> {selected.phone}
                  </div>
                  <div className={styles.field}>
                    <strong>Organization:</strong> {selected.organizationName || "—"}
                  </div>
                  <div className={styles.field}>
                    <strong>Job title:</strong> {selected.jobTitle || "—"}
                  </div>
                  <div className={styles.field}>
                    <strong>Website / social:</strong> {selected.socialMediaUrl || "—"}
                  </div>
                  <div className={styles.field}>
                    <strong>Heard via:</strong> {selected.howDidYouHear || "—"}
                  </div>
                </div>

                {selected.vendor && (
                  <div className={styles.section}>
                    <h3>Stand</h3>
                    <div className={styles.field}>
                      <strong>Business:</strong> {selected.vendor.businessName || "—"}
                    </div>
                    <div className={styles.field}>
                      <strong>Booth preference:</strong> {selected.vendor.boothPreference || "—"}
                    </div>
                    <div className={styles.field}>
                      <strong>Representatives:</strong> {selected.vendor.repCount || "—"}
                    </div>
                    <div className={`${styles.field} ${styles.multiline}`}>
                      <strong>Exhibiting:</strong> {selected.vendor.offering || "—"}
                    </div>
                  </div>
                )}

                {selected.expectations && (
                  <div className={styles.section}>
                    <h3>What they want out of it</h3>
                    <div className={`${styles.field} ${styles.multiline}`}>
                      {selected.expectations}
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <div className={styles.section}>
                    <h3>Notes</h3>
                    <div className={`${styles.field} ${styles.multiline}`}>{selected.notes}</div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
