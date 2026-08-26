import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EVENT_KIND_LABELS,
  REGISTRATION_REJECTION_MESSAGES,
  eventRejectionReason,
  formatEventPlace,
  formatEventWhen,
} from "@/lib/events";
import { getEvent, toPublicEvent } from "@/lib/firebase/events";
import Eyebrow from "@/app/components/ui/Eyebrow";
import Section, { Wrap } from "@/app/components/ui/Section";
import Reveal from "@/app/components/ui/Reveal";
import RegistrationForm from "./RegistrationForm";

// Seats are counted live on this page, and the form posts against the same
// numbers. A cached copy would show a place that has already gone.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event || event.status !== "published") {
    return {};
  }

  return {
    title: event.title,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary, type: "website" },
  };
}

/** One fact from the strip under the title. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-signal pl-4">
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-smoke">
        {label}
      </div>
      <div className="text-[15px] font-semibold">{value}</div>
    </div>
  );
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);

  // A draft or archived event is not a 403 — as far as the public is
  // concerned it does not exist yet, which is the point of a draft.
  if (!event || event.status === "draft" || event.status === "archived") {
    notFound();
  }

  const rejection = eventRejectionReason(event, new Date());
  const publicEvent = toPublicEvent(event);

  return (
    <>
      <Wrap className="pt-[18px] font-mono text-xs tracking-[0.08em] text-smoke">
        <Link href="/" className="hover:text-signal">
          DXI
        </Link>{" "}
        /{" "}
        <Link href="/events" className="hover:text-signal">
          EVENTS
        </Link>{" "}
        / <span className="text-signal">{EVENT_KIND_LABELS[event.kind].toUpperCase()}</span>
      </Wrap>

      <header className="relative overflow-hidden bg-paper text-ink">
        <div
          className="absolute top-0 right-0 h-[min(28vw,340px)] w-[min(28vw,340px)] bg-signal"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
        <div className="relative z-2 mx-auto w-full max-w-wrap px-6 pt-16 pb-14">
          <Eyebrow>{EVENT_KIND_LABELS[event.kind]}</Eyebrow>
          <h1 className="mb-[18px] max-w-[16ch] font-disp text-[clamp(34px,5.6vw,72px)] uppercase leading-[0.95] tracking-[-0.01em]">
            {event.title}
            <span className="text-signal">.</span>
          </h1>
          <p className="mb-[34px] max-w-[620px] text-[clamp(16px,2.1vw,20px)] text-smoke">
            {event.summary}
          </p>

          <div className="grid grid-cols-1 gap-5 wide:grid-cols-3">
            <Fact label="When" value={formatEventWhen(event.startsAt, event.endsAt)} />
            <Fact label="Where" value={formatEventPlace(event)} />
            <Fact
              label="Format"
              value={event.format === "online" ? "Online — link sent on confirmation" : "In person"}
            />
          </div>
        </div>
      </header>

      {event.description && (
        <Section background="ash">
          <Reveal className="max-w-[760px]">
            {event.description
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="mb-5 text-[16.5px] leading-[1.7] text-[#333] last:mb-0">
                  {paragraph}
                </p>
              ))}
          </Reveal>
        </Section>
      )}

      <Section background="paper" id="register">
        {rejection ? (
          <Reveal className="mx-auto max-w-[760px] border-2 border-ink bg-ash p-10 text-center">
            <Eyebrow>Registration</Eyebrow>
            <h2 className="mb-3 font-disp text-[clamp(24px,3.4vw,36px)] uppercase leading-none">
              {rejection === "event_full" ? "Fully booked" : "Registration closed"}
            </h2>
            <p className="text-[16px] text-smoke">
              {REGISTRATION_REJECTION_MESSAGES[rejection]} Message us on WhatsApp and we will let
              you know when the next one opens.
            </p>
            <Link
              href="/events"
              className="mt-7 inline-block bg-ink px-[30px] py-4 font-mono text-sm tracking-[0.04em] text-white transition-colors hover:bg-ink-hover"
            >
              See other events
            </Link>
          </Reveal>
        ) : (
          <RegistrationForm event={publicEvent} />
        )}
      </Section>
    </>
  );
}
