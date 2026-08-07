import type { StatsSection } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Reveal from "../ui/Reveal";

/** Proof numbers. Always on black — the red reads hardest there. */
export default function Stats({ section }: { section: StatsSection }) {
  const stats = section.stats ?? [];

  return (
    <Section background="dark" id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark
      />

      {stats.length > 0 && (
        <Reveal className="grid grid-cols-1 gap-[26px] wide:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat._key}>
              <div className="font-disp text-[clamp(40px,5.5vw,66px)] leading-none text-signal">
                {stat.value}
              </div>
              <div className="my-3 mb-1.5 font-mono text-[13px] tracking-[0.05em]">
                {stat.label}
              </div>
              {stat.detail && (
                <div className="text-[13.5px] text-mute-lo">{stat.detail}</div>
              )}
            </div>
          ))}
        </Reveal>
      )}
    </Section>
  );
}
