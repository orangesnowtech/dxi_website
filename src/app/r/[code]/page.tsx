import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { countShortLinkClick, getShortLink } from "@/lib/firebase/links";
import Eyebrow from "@/app/components/ui/Eyebrow";
import Section from "@/app/components/ui/Section";

/**
 * Where a short link lands.
 *
 * A page rather than a route handler so a dead code gets a page that says so.
 * The alternative — bouncing an unknown code to the homepage — leaves someone
 * who typed a link off a flyer with no idea whether they mistyped it or the
 * event is over.
 */

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

// Short links are the same page twice over as far as a crawler is concerned,
// and an indexed /r/… is a redirect competing with the page it points at.
export const metadata: Metadata = {
  title: "Redirecting",
  robots: { index: false, follow: false },
};

export default async function ShortLinkPage({ params }: Props) {
  const { code } = await params;

  // Firestore being unreachable must show the dead-link page, not a 500 — the
  // visitor can still be pointed at the events list from there.
  const link = await getShortLink(code).catch((error) => {
    console.error(`Could not resolve short link ${code}:`, error);
    return null;
  });

  if (link && link.active) {
    // A count that fails is not worth a visitor's redirect.
    await countShortLinkClick(link.code).catch((error) => {
      console.error(`Could not count a click on ${link.code}:`, error);
    });

    // Outside the try/catch above on purpose: redirect() works by throwing.
    redirect(link.target);
  }

  return (
    <Section background="paper" className="min-h-[60vh]">
      <Eyebrow>Link not found</Eyebrow>
      <h1 className="mb-[18px] max-w-[18ch] font-disp text-[clamp(30px,4.6vw,58px)] uppercase leading-[0.95]">
        This link is no longer live
        <span className="text-signal">.</span>
      </h1>
      <p className="mb-8 max-w-[560px] text-[clamp(16px,2.1vw,19px)] text-smoke">
        {link
          ? "It has been paused. If someone sent it to you today, ask them for the current one."
          : "Check it against what you were sent — a short link is a few characters and one wrong letter lands here."}
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/events"
          className="border-2 border-ink bg-ink px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-signal hover:border-signal"
        >
          See what&rsquo;s on
        </Link>
        <Link
          href="/"
          className="border-2 border-line px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:border-signal"
        >
          DXI home
        </Link>
      </div>
    </Section>
  );
}
