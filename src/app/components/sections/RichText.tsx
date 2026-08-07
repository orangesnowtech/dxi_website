import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { RichSection } from "@/lib/sanity/types";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Reveal from "../ui/Reveal";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 text-[16.5px] last:mb-0">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 list-disc pl-5">{children}</ul>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    link: ({ children, value }) => {
      const href = (value as { href?: string })?.href ?? "#";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          className="font-bold text-signal underline-offset-2 hover:underline"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default function RichText({ section }: { section: RichSection }) {
  const onDark = section.background === "dark";

  return (
    <Section background={section.background} id={section.sectionId}>
      <SectionHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        onDark={onDark}
        className={section.content?.length ? undefined : "mb-0"}
      />

      {section.content && section.content.length > 0 && (
        <Reveal className={`max-w-[720px] ${onDark ? "text-mute" : "text-smoke"}`}>
          <PortableText value={section.content as never} components={components} />
        </Reveal>
      )}
    </Section>
  );
}
