import type { FaqSection } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Reveal from "../ui/Reveal";

export default function Faq({ section }: { section: FaqSection }) {
  const items = section.items ?? [];
  const onDark = section.background === "dark";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={onDark}
      />

      {items.length > 0 && (
        <Reveal className="max-w-[800px]">
          {items.map((item) => (
            <details
              key={item._key}
              /* `faq-item` supplies the +/× marker — see globals.css. */
              className={`faq-item border-b py-5 ${onDark ? "border-[#2a2a2a]" : "border-line"}`}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-disp text-[15px] uppercase">
                {item.question}
              </summary>
              <p
                className={`max-w-[64ch] pt-3 text-[15px] ${onDark ? "text-mute" : "text-smoke"}`}
              >
                {item.answer}
              </p>
            </details>
          ))}
        </Reveal>
      )}
    </Section>
  );
}
