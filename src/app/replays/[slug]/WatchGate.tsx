"use client";

import { useState } from "react";
import { formatSize, type RecordingAccess } from "@/lib/recordings";
import { track } from "@/lib/analytics";

/**
 * The gate, and then the player.
 *
 * Nothing plays until the server has checked who is asking and handed back an
 * embed URL. This component never sees the Loom id until that happens — it
 * asks, and either gets a URL or gets told why not. The page source of a
 * gated replay contains no way to watch it.
 *
 * Click-to-load on purpose. No iframe, no third-party request and no cookie
 * exists until somebody chooses to watch, which keeps the page honest against
 * the consent banner and costs a visitor nothing if they only came to read
 * the description.
 */

type Ticket = { embedUrl: string; aspectPercent: number; title: string };

type Props = {
  slug: string;
  access: RecordingAccess;
  aspectPercent: number;
  approxSizeMb: number;
  thumbnailUrl: string;
};

/** What the server said it still needs before this will play. */
type Needs = "code" | "code_and_details" | "email" | "details" | null;

function initialNeeds(access: RecordingAccess): Needs {
  if (access === "code") return "code_and_details";
  if (access === "registrants") return "code";
  if (access === "academy") return "email";
  if (access === "lead") return "details";
  return null;
}

const inputClass =
  "w-full border-2 border-line bg-paper px-3.5 py-3 text-[15px] text-ink focus:border-signal focus:outline-none";

const labelClass = "mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-smoke";

export default function WatchGate({
  slug,
  access,
  aspectPercent,
  approxSizeMb,
  thumbnailUrl,
}: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [needs, setNeeds] = useState<Needs>(initialNeeds(access));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ accessCode: "", name: "", email: "", phone: "" });

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const request = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/recordings/${encodeURIComponent(slug)}/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        // The server says which boxes to show; without that the page would
        // have to guess, and would guess wrong for a half-filled form.
        if (data.needs !== undefined) {
          setNeeds(data.needs as Needs);
        }

        throw new Error(data.error || "That did not work.");
      }

      setTicket({
        embedUrl: data.embedUrl,
        aspectPercent: data.aspectPercent || aspectPercent,
        title: data.title,
      });

      track("replay_watched", { recording_slug: slug, access });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (ticket) {
    return (
      <div className="border-2 border-ink bg-ink">
        {/*
          Loom's own wrapper: a box with no height and a bottom padding equal
          to the video's height as a percentage of its width, with the iframe
          filling it. Fluid at every width without a media query, which is why
          Loom hands the snippet out in this shape. The percentage is the one
          that came with the embed, so a screen recording is not letterboxed
          into 16:9.
        */}
        <div className="relative h-0 w-full" style={{ paddingBottom: `${ticket.aspectPercent}%` }}>
          <iframe
            src={ticket.embedUrl}
            title={ticket.title}
            allowFullScreen
            allow="fullscreen; picture-in-picture"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    );
  }

  const size = formatSize(approxSizeMb);
  const wantsCode = needs === "code" || needs === "code_and_details";
  const wantsDetails = needs === "details" || needs === "code_and_details";

  return (
    <div className="border-2 border-ink bg-paper">
      <div className="relative aspect-video w-full overflow-hidden bg-ash">
        {thumbnailUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-disp text-[56px] text-ink" aria-hidden>
            ▶
          </span>
        </div>
      </div>

      <form onSubmit={request} className="p-6">
        {wantsCode && (
          <div className="mb-4">
            <label htmlFor="accessCode" className={labelClass}>
              {access === "registrants"
                ? "Access code from your ticket email"
                : "The access code we sent you"}
            </label>
            <input
              id="accessCode"
              value={form.accessCode}
              onChange={(e) => setField("accessCode", e.target.value.toUpperCase())}
              placeholder="K7P2QM"
              autoComplete="off"
              className={`${inputClass} max-w-[320px] font-mono tracking-[0.1em]`}
            />
          </div>
        )}

        {needs === "email" && (
          <div className="mb-4">
            <label htmlFor="email" className={labelClass}>
              The email on your Academy membership
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@yourbusiness.com"
              className={`${inputClass} max-w-[380px]`}
            />
          </div>
        )}

        {wantsDetails && (
          <div className="mb-4 grid max-w-[560px] grid-cols-1 gap-3 wide:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>
                Your name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="leadEmail" className={labelClass}>
                Email
              </label>
              <input
                id="leadEmail"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                autoComplete="email"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 border-l-2 border-signal pl-3 text-[14.5px] text-signal">{error}</p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="border-2 border-ink bg-ink px-7 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-signal hover:bg-signal disabled:opacity-50"
          >
            {busy ? "Checking…" : "Watch now"}
          </button>

          {/*
            Said before they commit, not after. On mobile data an hour of video
            can cost more than the ticket did, and a number here is the
            difference between a choice and a nasty surprise.
          */}
          {size && (
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-smoke">
              Uses {size} of data
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
