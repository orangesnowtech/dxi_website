import type { PlateGridSection, SiteSettings } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Plate from "../ui/Plate";
import BandStrip from "../ui/BandStrip";
import Reveal from "../ui/Reveal";

export default function PlateGrid({
  section,
  settings,
}: {
  section: PlateGridSection;
  settings: SiteSettings | null;
}) {
  const plates = section.plates ?? [];
  const columns = section.columns === 2 ? "wide:grid-cols-2" : "wide:grid-cols-3";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={section.background === "dark"}
      />

      {plates.length > 0 && (
        <div className={`grid grid-cols-1 gap-5 ${columns}`}>
          {plates.map((plate) => (
            <Reveal key={plate._key} className="flex">
              <Plate plate={plate} settings={settings} />
            </Reveal>
          ))}
        </div>
      )}

      {section.band && <BandStrip band={section.band} settings={settings} />}
    </Section>
  );
}
