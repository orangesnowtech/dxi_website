import type { StepsSection } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Reveal from "../ui/Reveal";

export default function Steps({ section }: { section: StepsSection }) {
  const steps = section.steps ?? [];
  const onDark = section.background === "dark";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={onDark}
      />

      {steps.length > 0 && (
        <Reveal className="grid grid-cols-1 gap-3.5 wide:grid-cols-5">
          {steps.map((step, i) => (
            <div
              key={step._key}
              className={`border-t-[3px] pt-4 ${onDark ? "border-white" : "border-ink"}`}
            >
              {/* Numbered by position, so reordering in the studio renumbers automatically. */}
              <div className="font-mono text-[13px] tracking-[0.1em] text-signal">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-2 mb-1.5 font-disp text-[15px] uppercase">{step.title}</h3>
              {step.body && (
                <p className={`text-[13px] ${onDark ? "text-mute" : "text-smoke"}`}>{step.body}</p>
              )}
            </div>
          ))}
        </Reveal>
      )}
    </Section>
  );
}
