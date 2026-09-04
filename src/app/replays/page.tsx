import type { Metadata } from "next";
import Link from "next/link";
import {
  RECORDING_ACCESS_LABELS,
  closingSoon,
  formatDuration,
  formatSize,
  type PublicRecording,
} from "@/lib/recordings";
import { listPublishedRecordings } from "@/lib/firebase/recordings";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/ui/Reveal";

// Watch windows close against the clock, so a cached copy would keep offering
// a replay that has already shut.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Replays",
  description:
    "Missed a DXI webinar? Watch it back. Recordings of our trainings and webinars, on demand.",
};

function Card({ recording }: { recording: PublicRecording }) {
  const runtime = formatDuration(recording.durationSeconds);
  const size = formatSize(recording.approxSizeMb);
  const closing = closingSoon(recording.availableUntil, new Date());

  return (
    <Link
      href={`/replays/${recording.slug}`}
      className="group flex flex-col border-2 border-ink bg-paper transition-colors hover:border-signal"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-ash">
        {recording.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={recording.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
            Replay
          </div>
        )}
        <span
          className="absolute inset-0 flex items-center justify-center text-[40px] text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        >
          ▶
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 font-disp text-[19px] uppercase leading-tight">{recording.title}</h3>
        <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-smoke">{recording.summary}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-smoke">
          {runtime && <span>{runtime}</span>}
          {/* The number people actually decide on, when data costs money. */}
          {size && <span className="text-ink">{size}</span>}
          <span className="text-signal">{RECORDING_ACCESS_LABELS[recording.access]}</span>
        </div>

        {closing && recording.availableUntil && (
          <div className="mt-3 border-l-2 border-signal pl-3 font-mono text-[11px] uppercase tracking-[0.1em] text-signal">
            Closes {new Date(recording.availableUntil).toLocaleDateString("en-NG")}
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function ReplaysPage() {
  // A library that 500s because Firestore hiccuped is worse than one that says
  // it is empty; the page still explains what replays are either way.
  const recordings = await listPublishedRecordings().catch((error) => {
    console.error("Could not load the replay library:", error);
    return [] as PublicRecording[];
  });

  const now = new Date();
  const live = recordings.filter(
    (recording) => !recording.availableUntil || new Date(recording.availableUntil) > now
  );

  return (
    <Section background="paper">
      <SectionHeader
        eyebrow="On demand"
        heading="Watch it back"
        body="Missed one, or want it again? Our webinars and trainings, recorded. Some are open to everyone; others are for the people who registered."
      />

      {live.length === 0 ? (
        <div className="border-2 border-line bg-ash p-10 text-center">
          <p className="text-[16px] text-smoke">
            No replays are up yet. Come to the next one live —{" "}
            <Link href="/events" className="text-signal underline underline-offset-4">
              see what is coming up
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 wide:grid-cols-3">
          {live.map((recording) => (
            <Reveal key={recording.slug}>
              <Card recording={recording} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
