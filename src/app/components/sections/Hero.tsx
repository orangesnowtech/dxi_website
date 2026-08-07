import type { HeroSection, SiteSettings } from "@/lib/sanity/types";
import { headingLines } from "@/lib/content";
import Eyebrow from "../ui/Eyebrow";
import Button from "../ui/Button";

export default function Hero({
  section,
  settings,
}: {
  section: HeroSection;
  settings: SiteSettings | null;
}) {
  const isLight = section.tone === "light";
  const lines = headingLines(section.heading);

  return (
    <header
      className={`relative overflow-hidden ${isLight ? "bg-paper text-ink" : "bg-ink text-white"}`}
    >
      {/* Angled red block, top-right — the recurring mark across the site. */}
      <div
        className="absolute top-0 right-0 h-[min(34vw,420px)] w-[min(34vw,420px)] bg-signal"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        aria-hidden
      />
      {section.showLowerNotch && (
        <div
          className={`absolute bottom-0 left-0 h-[150px] w-[150px] ${isLight ? "bg-ash" : "bg-notch"}`}
          style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }}
          aria-hidden
        />
      )}

      <div className="relative z-2 mx-auto w-full max-w-wrap px-6 pt-24 pb-26">
        <Eyebrow>{section.eyebrow}</Eyebrow>

        <h1 className="mb-[22px] max-w-[12ch] font-disp text-[clamp(44px,7.2vw,96px)] uppercase leading-[0.95] tracking-[-0.01em]">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
              {i === lines.length - 1 && <span className="text-signal">.</span>}
            </span>
          ))}
        </h1>

        {section.sub && (
          <p
            className={`mb-[38px] max-w-[560px] text-[clamp(17px,2.2vw,21px)] ${
              isLight ? "text-smoke" : "text-mute-hi"
            }`}
          >
            {section.sub}
          </p>
        )}

        {section.ctas && section.ctas.length > 0 && (
          <div className="flex flex-wrap gap-3.5">
            {section.ctas.map((cta, i) => (
              <Button key={i} cta={cta} settings={settings} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
