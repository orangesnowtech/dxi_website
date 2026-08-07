import type { CardGridSection, SiteSettings } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Card from "../ui/Card";
import BandStrip from "../ui/BandStrip";
import Reveal from "../ui/Reveal";

export default function CardGrid({
  section,
  settings,
}: {
  section: CardGridSection;
  settings: SiteSettings | null;
}) {
  const cards = section.cards ?? [];
  // Single column below the breakpoint, then 2 or 3 across.
  const columns = section.columns === 2 ? "wide:grid-cols-2" : "wide:grid-cols-3";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={section.background === "dark"}
      />

      {cards.length > 0 && (
        <div className={`grid grid-cols-1 gap-5 ${columns}`}>
          {cards.map((card) => (
            <Reveal key={card._key}>
              <Card card={card} settings={settings} />
            </Reveal>
          ))}
        </div>
      )}

      {section.band && <BandStrip band={section.band} settings={settings} />}
    </Section>
  );
}
