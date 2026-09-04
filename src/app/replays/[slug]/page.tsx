import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RECORDING_ACCESS_LABELS,
  RECORDING_REJECTION_MESSAGES,
  formatDuration,
  recordingRejectionReason,
} from "@/lib/recordings";
import { getRecording, toPublicRecording } from "@/lib/firebase/recordings";
import { getEvent } from "@/lib/firebase/events";
import Section, { Wrap } from "@/app/components/ui/Section";
import Eyebrow from "@/app/components/ui/Eyebrow";
import WatchGate from "./WatchGate";

// The watch window closes against the clock; a cached page would keep offering
// a replay that has already shut.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recording = await getRecording(slug);

  if (!recording || recording.status !== "published") {
    return {};
  }

  return {
    title: recording.title,
    description: recording.summary,
    openGraph: {
      title: recording.title,
      description: recording.summary,
      type: "video.other",
      images: recording.thumbnailUrl ? [recording.thumbnailUrl] : undefined,
    },
  };
}

export default async function ReplayPage({ params }: Props) {
  const { slug } = await params;
  const recording = await getRecording(slug);

  // A draft is not a 403 — as far as the public is concerned it does not exist
  // yet, which is the point of a draft.
  if (!recording || recording.status === "draft" || recording.status === "archived") {
    notFound();
  }

  const rejection = recordingRejectionReason(recording, new Date());
  const publicRecording = toPublicRecording(recording);

  // Only for the breadcrumb and the "see the next one" nudge; the gate itself
  // re-reads the event server-side when it verifies a code.
  const event = recording.eventSlug
    ? await getEvent(recording.eventSlug).catch(() => null)
    : null;

  return (
    <>
      <Wrap className="pt-[18px] font-mono text-xs tracking-[0.08em] text-smoke">
        <Link href="/" className="hover:text-signal">
          DXI
        </Link>{" "}
        /{" "}
        <Link href="/replays" className="hover:text-signal">
          REPLAYS
        </Link>{" "}
        / <span className="text-signal">ON DEMAND</span>
      </Wrap>

      <Section background="paper" className="pt-10">
        <div className="mx-auto max-w-[860px]">
          <Eyebrow>Replay</Eyebrow>
          <h1 className="mb-4 font-disp text-[clamp(30px,4.6vw,56px)] uppercase leading-[0.95] tracking-[-0.01em]">
            {recording.title}
            <span className="text-signal">.</span>
          </h1>
          <p className="mb-6 text-[clamp(16px,2.1vw,19px)] text-smoke">{recording.summary}</p>

          <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-smoke">
            {recording.durationSeconds > 0 && (
              <span>{formatDuration(recording.durationSeconds)}</span>
            )}
            <span className="text-signal">{RECORDING_ACCESS_LABELS[recording.access]}</span>
            {recording.availableUntil && (
              <span>
                Closes {new Date(recording.availableUntil).toLocaleDateString("en-NG")}
              </span>
            )}
          </div>

          {rejection ? (
            <div className="border-2 border-line bg-ash p-8">
              <p className="mb-4 text-[16px] text-smoke">
                {RECORDING_REJECTION_MESSAGES[rejection]}
              </p>
              <Link
                href="/events"
                className="border-2 border-ink bg-ink px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-signal hover:bg-signal"
              >
                See what&rsquo;s coming up
              </Link>
            </div>
          ) : (
            <WatchGate
              slug={recording.slug}
              access={publicRecording.access}
              aspectPercent={publicRecording.aspectPercent}
              approxSizeMb={publicRecording.approxSizeMb}
              thumbnailUrl={publicRecording.thumbnailUrl}
            />
          )}

          {recording.description && (
            <div className="mt-10 max-w-[720px]">
              {recording.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="mb-4 text-[16px] leading-relaxed text-smoke">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {event && (
            <div className="mt-10 border-l-2 border-signal pl-5">
              <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-smoke">
                Recorded at
              </div>
              <Link
                href={`/events/${event.slug}`}
                className="text-[16px] font-semibold hover:text-signal"
              >
                {event.title}
              </Link>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
