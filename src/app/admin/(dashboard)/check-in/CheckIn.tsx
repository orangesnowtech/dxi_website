"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  REGISTRATION_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
  formatEventDay,
  formatFee,
  type EventRegistration,
} from "@/lib/events";
import styles from "../../admin.module.css";

type EventOption = { slug: string; title: string; startsAt: string };

function formatMoment(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lagos",
      });
}

/**
 * The door screen.
 *
 * Built for one thumb and a queue: the search box keeps focus, the result is
 * one big card, and the confirm button is the only thing worth tapping. Every
 * outcome — found, wrong status, already in — is a colour and a sentence
 * rather than something to read.
 */
export default function CheckIn({ events }: { events: EventOption[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [eventSlug, setEventSlug] = useState(events[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventRegistration[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSearch = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();

    if (query.trim().length < 2) {
      setError("Type at least two characters, or a full access code.");
      return;
    }

    setSearching(true);
    setError(null);
    setNotice(null);

    try {
      const params = new URLSearchParams({ q: query.trim() });

      if (eventSlug) {
        params.set("event", eventSlug);
      }

      const response = await fetch(`/api/admin/check-in?${params}`);

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.results);

      if (data.results.length === 0) {
        setError("Nobody matches that. Check the spelling, or try their surname.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async (registration: EventRegistration) => {
    setBusyId(registration.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registration.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        // The server sends the registration back on a conflict so the card can
        // update to show when they actually came in.
        if (data.registration) {
          setResults(
            (previous) =>
              previous?.map((row) => (row.id === registration.id ? data.registration : row)) ??
              previous
          );
        }

        throw new Error(data.error || "Could not check that guest in");
      }

      setResults(
        (previous) =>
          previous?.map((row) => (row.id === registration.id ? data.registration : row)) ??
          previous
      );
      setNotice(`${registration.fullName} is in.`);

      // Clear for the next person in the queue without losing the result card.
      setQuery("");
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Check-in</h1>
          <p className={styles.subtitle}>
            Search by access code, name, email or company. Only confirmed registrations can be
            checked in.
          </p>
        </div>

        <form className={styles.checkInForm} onSubmit={handleSearch}>
          {events.length > 0 && (
            <div className={styles.codeField}>
              <label htmlFor="eventSlug">Event</label>
              <select
                id="eventSlug"
                className={styles.select}
                value={eventSlug}
                onChange={(e) => {
                  setEventSlug(e.target.value);
                  setResults(null);
                }}
              >
                <option value="">Every event</option>
                {events.map((event) => (
                  <option key={event.slug} value={event.slug}>
                    {event.title} — {formatEventDay(event.startsAt)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.codeField}>
            <label htmlFor="query">Access code or name</label>
            <div className={styles.codeInputRow}>
              <input
                id="query"
                ref={inputRef}
                className={`${styles.grantInput} ${styles.checkInInput}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="K7P2QM"
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus
              />
              <button type="submit" className={styles.generateBtn} disabled={searching}>
                {searching ? "…" : "Search"}
              </button>
            </div>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        {results && results.length > 0 && (
          <div className={styles.typeRows}>
            {results.map((registration) => (
              <div key={registration.id} className={styles.resultCard}>
                <div className={styles.resultHead}>
                  <div>
                    <div className={styles.name} style={{ fontSize: "1.25rem" }}>
                      {registration.fullName}
                    </div>
                    <span className={styles.referralNote}>
                      {registration.typeLabel} · {formatFee(registration.feeNaira)} ·{" "}
                      {registration.organizationName || "No organization given"}
                    </span>
                    <span className={styles.referralNote}>{registration.eventTitle}</span>
                  </div>
                  <div className={styles.resultCode}>{registration.accessCode}</div>
                </div>

                <div className={styles.resultMeta}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: REGISTRATION_STATUS_COLORS[registration.status],
                    }}
                  >
                    {REGISTRATION_STATUS_LABELS[registration.status]}
                  </span>

                  {registration.checkedIn ? (
                    <span className={styles.checkedInBadge}>
                      Already in — {formatMoment(registration.checkedInAt)}
                      {registration.checkedInBy ? ` · ${registration.checkedInBy}` : ""}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.confirmBtn}
                      disabled={busyId === registration.id || registration.status !== "confirmed"}
                      onClick={() => handleConfirm(registration)}
                    >
                      {busyId === registration.id ? "Checking in…" : "Check in"}
                    </button>
                  )}
                </div>

                {registration.notes && (
                  <div className={styles.resultNotes}>
                    <strong>Note:</strong> {registration.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
