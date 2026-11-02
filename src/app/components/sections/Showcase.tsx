import Image from "next/image";
import type { ShowcaseSection, SiteSettings } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";

export default function Showcase({
  section,
  settings,
}: {
  section: ShowcaseSection;
  settings: SiteSettings | null;
}) {
  const shots = section.shots ?? [];
  const onDark = section.background === "dark";

  return (
    <Section background={section.background} id={section.sectionId}>
      {section.logo && (
        <Reveal className="mb-8">
          <Image
            src={section.logo.src}
            alt={section.logo.alt}
            width={section.logo.width}
            height={section.logo.height}
            className="h-10 w-auto"
          />
        </Reveal>
      )}

      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={onDark}
        className={section.cta ? "mb-7" : undefined}
      />

      {section.cta && (
        <Reveal className="mb-14">
          <Button cta={section.cta} settings={settings} />
        </Reveal>
      )}

      {shots.length > 0 && (
        <div className="grid grid-cols-1 gap-8 wide:grid-cols-3 wide:gap-5">
          {shots.map((shot) => (
            <Reveal key={shot._key}>
              <figure className="mx-auto max-w-[300px]">
                {/* Phone screens: a thin ink frame stands in for the device. */}
                <div className="overflow-hidden rounded-[28px] border-[6px] border-ink bg-white">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    sizes="(min-width: 940px) 300px, 90vw"
                    className="block h-auto w-full"
                  />
                </div>
                {shot.caption && (
                  <figcaption
                    className={`mt-3.5 text-center font-mono text-[12px] tracking-[0.05em] uppercase ${
                      onDark ? "text-mute" : "text-smoke"
                    }`}
                  >
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
