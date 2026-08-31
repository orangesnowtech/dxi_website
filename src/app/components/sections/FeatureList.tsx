import type { FeatureListSection, SiteSettings, Tier } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import BandStrip from "../ui/BandStrip";
import Reveal from "../ui/Reveal";

/** Ladder order. A capability tagged at a tier is included at every tier above. */
const TIERS: Tier[] = ["starter", "standard", "scale"];

const TIER_LABEL: Record<Tier, string> = {
  starter: "STARTER",
  standard: "STANDARD",
  scale: "SCALE",
};

/** Solid badge — the tier a capability unlocks at. Narrow screens only. */
const TIER_BADGE: Record<Tier, string> = {
  starter: "bg-ash text-smoke",
  standard: "bg-ink text-white",
  scale: "bg-signal text-white",
};

const TIER_BADGE_DARK: Record<Tier, string> = {
  starter: "bg-coal text-mute",
  standard: "bg-white text-ink",
  scale: "bg-signal text-white",
};

/**
 * Column tracks, shared by the header and every capability row so the three
 * tier columns line up down the page.
 *
 * The trailing 28px track is the group rows' `+` marker gutter — capability
 * rows leave it empty so their tier columns sit under the headings.
 *
 * Narrow screens drop the three tier tracks (they are `hidden` below `wide`)
 * and show a single badge instead.
 */
const TIER_COLUMNS = "wide:grid-cols-[1fr_repeat(3,104px)_28px]";
const COLUMNS = `grid-cols-[1fr_auto_28px] ${TIER_COLUMNS}`;

/**
 * The "what's inside" breakdown: a tier spec sheet, sectioned by capability
 * area, where each section heading opens to explain itself.
 *
 * The grid is deliberately at bullet level rather than feature level. Rolling
 * "Advertising" into one row hid the thing a buyer is actually deciding
 * between — retargeting arrives at Standard, lookalikes not until Scale — so
 * every element gets its own row and its own marks, and the feature above it
 * is a section heading rather than a data row.
 *
 * Built from `<details>` on a CSS grid rather than a `<table>`: a disclosure
 * cannot legally wrap a `<tr>`. The grid buys column alignment; the per-cell
 * visually-hidden text buys back the row/column relationship a real table
 * would have given a screen reader.
 *
 * Mobile drops the tier columns for a single "unlocks at" badge per row.
 * Because a tier carries everything below it, that badge is exactly equivalent
 * to three cells — no information lost, and nothing scrolls sideways.
 */
export default function FeatureList({
  section,
  settings,
}: {
  section: FeatureListSection;
  settings: SiteSettings | null;
}) {
  const features = section.features ?? [];
  const onDark = section.background === "dark";

  const badge = onDark ? TIER_BADGE_DARK : TIER_BADGE;
  const rule = onDark ? "border-seam" : "border-line";
  const muted = onDark ? "text-mute" : "text-smoke";
  const groupFill = onDark ? "bg-coal hover:bg-seam" : "bg-ash hover:bg-line";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={onDark}
      />

      {/* Leads rather than closes: it names the tiers the columns are headed with. */}
      {section.band && (
        <BandStrip band={section.band} settings={settings} className="mb-[38px]" />
      )}

      {features.length > 0 && (
        <Reveal>
          {section.caption && (
            <p className={`mb-3.5 font-mono text-[11.5px] tracking-[0.04em] ${muted}`}>
              {section.caption}
            </p>
          )}

          <div className={`border-t-[3px] ${onDark ? "border-white" : "border-ink"}`}>
            {/* Column headers only earn their space once the tier columns exist. */}
            <div
              className={`hidden border-b-2 px-3 pb-2.5 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] wide:grid ${TIER_COLUMNS} ${
                onDark ? "border-seam" : "border-ink"
              } ${muted}`}
            >
              <span>Capability</span>
              {TIERS.map((tier) => (
                <span key={tier} className="text-center">
                  {TIER_LABEL[tier]}
                </span>
              ))}
              <span />
            </div>

            {features.map((feature, i) => (
              <div key={feature._key}>
                {/* Section heading. Opens to the prose; the rows below stay put. */}
                <details className={`faq-item border-b ${rule}`}>
                  <summary
                    className={`grid cursor-pointer grid-cols-[1fr_28px] items-center gap-x-3 px-3 py-[13px] transition-colors duration-150 motion-reduce:transition-none ${groupFill}`}
                  >
                    <span className="font-disp text-[13.5px] uppercase leading-tight">
                      {/* Numbered by position, so reordering renumbers automatically. */}
                      <span className="mr-2.5 font-mono tracking-[0.1em] text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {feature.title}
                      {feature.lede && (
                        <span
                          className={`ml-2.5 hidden font-mono text-[12px] normal-case tracking-[0.02em] wide:inline ${muted}`}
                        >
                          {feature.lede}
                        </span>
                      )}
                    </span>
                  </summary>

                  {feature.body && (
                    <p className={`max-w-[72ch] px-3 pb-[18px] pt-1 text-[14px] ${muted}`}>
                      {feature.body}
                    </p>
                  )}
                </details>

                {(feature.points ?? []).map((point) => (
                  <div
                    key={point._key}
                    className={`grid items-center gap-x-3 border-b px-3 py-[11px] ${COLUMNS} ${rule}`}
                  >
                    <span className="text-[13.5px] leading-snug">{point.text}</span>

                    {/* Narrow screens: one badge instead of three columns. */}
                    <span
                      className={`shrink-0 px-2 py-[3px] font-mono text-[10.5px] tracking-[0.14em] wide:hidden ${badge[point.tier]}`}
                    >
                      {TIER_LABEL[point.tier]}
                      <span className="sr-only"> and above</span>
                    </span>

                    {TIERS.map((tier) => {
                      const included = TIERS.indexOf(tier) >= TIERS.indexOf(point.tier);
                      return (
                        <span key={tier} className="hidden text-center wide:block">
                          <span
                            className={
                              included
                                ? "text-[15px] leading-none text-signal"
                                : onDark
                                  ? "text-seam"
                                  : "text-line"
                            }
                            aria-hidden="true"
                          >
                            {included ? "●" : "–"}
                          </span>
                          <span className="sr-only">
                            {TIER_LABEL[tier]}: {included ? "included" : "not included"}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}
