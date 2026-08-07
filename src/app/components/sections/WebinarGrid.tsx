import type { WebinarGridSection } from "@/lib/sanity/types";
import { formatSessionTime } from "@/lib/content";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import AccessPill from "../ui/AccessPill";
import Reveal from "../ui/Reveal";

export default function WebinarGrid({ section }: { section: WebinarGridSection }) {
  const webinars = section.webinars ?? [];
  // Placed on the page before the content exists — stay invisible until there is some.
  if (webinars.length === 0) return null;

  const onDark = section.background === "dark";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={onDark}
      />

      <div className="grid grid-cols-1 gap-5 wide:grid-cols-3">
        {webinars.map((webinar) => {
          const inner = (
            <>
              <AccessPill access={webinar.access} />
              <h3 className="mb-0.5 font-disp text-base uppercase">{webinar.title}</h3>
              <p className="mt-0.5 mb-2 font-mono text-xs text-signal">
                {formatSessionTime(webinar.startsAt)}
              </p>
              <p className={`text-[14.5px] ${onDark ? "text-mute" : "text-smoke"}`}>
                {webinar.description}
              </p>
            </>
          );

          return (
            <Reveal key={webinar._id}>
              {webinar.registrationUrl ? (
                <a
                  href={webinar.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block h-full border p-7 transition-colors ${
                    onDark
                      ? "border-coal-line bg-coal hover:border-signal"
                      : "border-line bg-paper hover:border-signal"
                  }`}
                >
                  {inner}
                </a>
              ) : (
                <div
                  className={`h-full border p-7 ${
                    onDark ? "border-coal-line bg-coal" : "border-line bg-paper"
                  }`}
                >
                  {inner}
                </div>
              )}
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
