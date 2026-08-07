import type { Section, SiteSettings } from "@/lib/sanity/types";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import CardGrid from "./sections/CardGrid";
import PlateGrid from "./sections/PlateGrid";
import Stats from "./sections/Stats";
import Steps from "./sections/Steps";
import Faq from "./sections/Faq";
import CourseGrid from "./sections/CourseGrid";
import WebinarGrid from "./sections/WebinarGrid";
import RichText from "./sections/RichText";
import Cta from "./sections/Cta";

/**
 * Maps a page's section blocks to components.
 *
 * A block type that reaches here without a case — an older document referencing
 * a section that has since been removed — renders nothing rather than crashing
 * the page.
 */
export default function SectionRenderer({
  sections,
  settings,
}: {
  sections: Section[];
  settings: SiteSettings | null;
}) {
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case "heroSection":
            return <Hero key={section._key} section={section} settings={settings} />;
          case "introSection":
            return <Intro key={section._key} section={section} />;
          case "cardGrid":
            return <CardGrid key={section._key} section={section} settings={settings} />;
          case "plateGrid":
            return <PlateGrid key={section._key} section={section} settings={settings} />;
          case "statsSection":
            return <Stats key={section._key} section={section} />;
          case "stepsSection":
            return <Steps key={section._key} section={section} />;
          case "faqSection":
            return <Faq key={section._key} section={section} />;
          case "courseGrid":
            return <CourseGrid key={section._key} section={section} />;
          case "webinarGrid":
            return <WebinarGrid key={section._key} section={section} />;
          case "richSection":
            return <RichText key={section._key} section={section} />;
          case "ctaSection":
            return <Cta key={section._key} section={section} settings={settings} />;
          default:
            return null;
        }
      })}
    </>
  );
}
