import type { Metadata } from "next";
import Link from "next/link";
import {
  EVENT_KIND_LABELS,
  formatEventWhen,
  formatEventPlace,
  formatFee,
  isPastEvent,
  seatsLeft,
  type PublicEvent,
} from "@/lib/events";
import { listPublishedEvents } from "@/lib/firebase/events";
import Eyebrow from "../components/ui/Eyebrow";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/ui/Reveal";

// Capacity is on these cards, so a cached copy would keep offering seats that
// have already gone.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Webinars, live trainings and trade fairs from DXI Marketing. Register for a seat, a stand, or a spot in the room.",
};

/** Cheapest way in, which is the number worth putting on a card. */
function fromPrice(event: PublicEvent) {
  const fees = event.registrationTypes.map((type) => type.feeNaira);

  if (fees.length === 0) {
    return "";
  }

  const lowest = Math.min(...fees);

  if (lowest === 0) {
    return "Free";
  }

  return fees.length > 1 ? `From ${formatFee(lowest)}` : formatFee(lowest);
}

/** The tightest "hurry up" the event can honestly make. */
function scarcityNote(event: PublicEvent) {
  const remaining = event.registrationTypes
    .map((type) => seatsLeft(event, type))
    .filter((value): value is number => value !== null);

  if (remaining.length === 0) {
    return null;
  }

  const fewest = Math.min(...remaining);

  if (fewest === 0) {
    return "Fully booked";
  }

  return fewest <= 10 ? `${fewest} place${fewest === 1 ? "" : "s"} left` : null;
}

function EventCard({ event, past = false }: { event: PublicEvent; past?: boolean }) {
  const scarcity = past ? null : scarcityNote(event);
  const price = fromPrice(event);

  return (
    <Reveal>
      <Link
        href={`/events/${event.slug}`}
        className={`group block h-full border border-line bg-paper transition-colors hover:border-signal ${
          past ? "opacity-70" : ""
        }`}
      >
        {/*
          Fixed 1:1 frame. The poster is cropped to fill rather than letterboxed
          so a row of cards keeps one rhythm even when someone uploads artwork
          that is not quite square. Plain <img> rather than next/image: posters
          come from Firebase Storage and, later, wherever else, and an optimiser
          allowlist is one more thing to break a card on.
        */}
        {event.posterUrl && (
          <div className="aspect-square w-full overflow-hidden border-b border-line bg-ash">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.posterUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        )}

        <div className="p-7">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-block bg-ink px-[9px] py-[3px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white">
            {EVENT_KIND_LABELS[event.kind]}
          </span>
          {price && (
            <span
              className={`inline-block px-[9px] py-[3px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white ${
                price === "Free" ? "bg-free" : "bg-signal"
              }`}
            >
              {price}
            </span>
          )}
        </div>

        <h3 className="mb-1.5 font-disp text-lg uppercase leading-tight">{event.title}</h3>

        <p className="mb-1 font-mono text-xs text-signal">
          {formatEventWhen(event.startsAt, event.endsAt)}
        </p>
        <p className="mb-3 font-mono text-xs text-smoke">{formatEventPlace(event)}</p>

        <p className="text-[14.5px] text-smoke">{event.summary}</p>

        <div className="mt-[22px] flex items-center justify-between gap-3">
          <span className="font-mono text-[13px] tracking-[0.04em] text-ink group-hover:text-signal">
            {past ? "View details" : "Register"} <span aria-hidden>→</span>
          </span>
          {scarcity && (
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
              {scarcity}
            </span>
          )}
        </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function EventsPage() {
  const all = await listPublishedEvents();
  const now = new Date();

  const upcoming = all.filter((event) => !isPastEvent(event, now));
  // Reversed so the most recent thing we ran is the first one people see.
  const past = all.filter((event) => isPastEvent(event, now)).reverse();

  return (
    <>
      <header className="relative overflow-hidden bg-ink text-white">
        <div
          className="absolute top-0 right-0 h-[min(34vw,420px)] w-[min(34vw,420px)] bg-signal"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
        <div className="relative z-2 mx-auto w-full max-w-wrap px-6 pt-24 pb-26">
          <Eyebrow>Events · The way in</Eyebrow>
          <h1 className="mb-[22px] max-w-[12ch] font-disp text-[clamp(44px,7.2vw,96px)] uppercase leading-[0.95] tracking-[-0.01em]">
            <span className="block">Come</span>
            <span className="block">
              Meet Us<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="mb-0 max-w-[560px] text-[clamp(17px,2.2vw,21px)] text-mute-hi">
            A webinar seat, a live training, a stand at a trade fair. Every DXI event is a door into
            the same system — walk through whichever one fits.
          </p>
        </div>
      </header>

      <Section background="paper">
        <SectionHeader
          eyebrow="What's coming"
          heading="Upcoming events"
          body="Places are limited on most of these, and registration closes when the room is full."
        />

        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 wide:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <Reveal className="border-2 border-line bg-ash p-10 text-center">
            <p className="font-disp text-lg uppercase">Nothing on the calendar right now</p>
            <p className="mt-2 text-[15px] text-smoke">
              We run these regularly. Message us on WhatsApp and we will tell you when the next one
              opens.
            </p>
          </Reveal>
        )}
      </Section>

      {past.length > 0 && (
        <Section background="ash">
          <SectionHeader
            eyebrow="Archive"
            heading="Already happened"
            body="What we have run recently. Some of these come round again."
          />
          <div className="grid grid-cols-1 gap-5 wide:grid-cols-3">
            {past.slice(0, 6).map((event) => (
              <EventCard key={event.slug} event={event} past />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
