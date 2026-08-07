import type { IntroSection } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";

export default function Intro({ section }: { section: IntroSection }) {
  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={section.background === "dark"}
        className="mb-0"
      />
    </Section>
  );
}
