import type { CtaSection, SiteSettings } from "@/lib/sanity/types";
import Button from "../ui/Button";

/** The closing black section with the angled red corner. Every page ends here. */
export default function Cta({
  section,
  settings,
}: {
  section: CtaSection;
  settings: SiteSettings | null;
}) {
  return (
    <section id={section.sectionId} className="relative overflow-hidden bg-ink text-white">
      <div
        className="absolute top-0 left-0 h-[170px] w-[170px] bg-signal"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        aria-hidden
      />
      <div className="relative z-2 mx-auto w-full max-w-wrap px-6 py-24">
        <h2 className="mb-4 font-disp text-[clamp(30px,5vw,58px)] uppercase leading-none">
          {section.heading}
        </h2>
        {section.body && (
          <p className="mb-[34px] max-w-[560px] text-lg text-mute">{section.body}</p>
        )}
        {section.ctas && section.ctas.length > 0 && (
          <div className="flex flex-wrap gap-3.5">
            {section.ctas.map((cta, i) => (
              <Button key={i} cta={cta} settings={settings} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
