import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  checkInWindow,
  formatEventDateTime,
  formatEventPlace,
  formatEventWhen,
} from "@/lib/events";
import { getEvent } from "@/lib/firebase/events";
import Eyebrow from "@/app/components/ui/Eyebrow";
import Section from "@/app/components/ui/Section";
import SelfCheckIn from "./SelfCheckIn";

// The whole page is a function of the current time, so it can never be cached.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  return {
    title: event ? `Check in — ${event.title}` : "Check in",
    // A check-in URL is for people who already hold a ticket. There is nothing
    // for a search engine here, and an indexed door is an odd thing to have.
    robots: { index: false, follow: false },
  };
}

export default async function EventCheckInPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event || event.status === "draft" || event.status === "archived") {
    notFound();
  }

  const window = checkInWindow(event, new Date());

  return (
    <Section background="paper">
      <div className="mx-auto max-w-[560px]">
        <div className="mb-8 text-center">
          <Eyebrow>Check in</Eyebrow>
          <h1 className="mb-3 font-disp text-[clamp(28px,4.4vw,44px)] uppercase leading-none tracking-[-0.01em]">
            {event.title}
          </h1>
          <p className="font-mono text-xs text-signal">
            {formatEventWhen(event.startsAt, event.endsAt)}
          </p>
          <p className="font-mono text-xs text-smoke">{formatEventPlace(event)}</p>
        </div>

        {window.state === "open" ? (
          <SelfCheckIn slug={event.slug} />
        ) : (
          <div className="border-2 border-ink bg-ash p-10 text-center">
            <h2 className="mb-3 font-disp text-[clamp(20px,3vw,28px)] uppercase leading-none">
              {window.state === "before" ? "Not open yet" : "Check-in has closed"}
            </h2>
            <p className="text-[15.5px] text-smoke">
              {window.state === "before" ? (
                <>
                  Check-in opens at{" "}
                  <strong className="text-ink">{formatEventDateTime(window.opensAt.toISOString())}</strong>.
                  Come back then — this page will let you in.
                </>
              ) : (
                <>
                  This event is over. If you are here and still need to be checked in, please
                  speak to someone at the desk.
                </>
              )}
            </p>
            <Link
              href={`/events/${event.slug}`}
              className="mt-7 inline-block bg-ink px-[30px] py-4 font-mono text-sm tracking-[0.04em] text-white transition-colors hover:bg-ink-hover"
            >
              Event details
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}
