import type { CourseGridSection } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import AccessPill from "../ui/AccessPill";
import Reveal from "../ui/Reveal";

export default function CourseGrid({ section }: { section: CourseGridSection }) {
  const courses = section.courses ?? [];
  // Placed on the page before the content exists — stay invisible until there is some.
  if (courses.length === 0) return null;

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
        {courses.map((course) => {
          const inner = (
            <>
              <AccessPill access={course.access} />
              <h3 className="mb-2.5 font-disp text-base uppercase">{course.title}</h3>
              <p className={`text-[14.5px] ${onDark ? "text-mute" : "text-smoke"}`}>
                {course.description}
              </p>
            </>
          );

          return (
            <Reveal key={course._id}>
              {course.url ? (
                <a
                  href={course.url}
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
