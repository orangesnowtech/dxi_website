import type { Band, SiteSettings } from "@/lib/sanity/types";
import { withEmphasis } from "@/lib/content";
import Button from "./Button";
import Reveal from "./Reveal";

/**
 * The black strip that closes out a grid.
 *
 * Spacing is a prop because the strip does not always close something — on the
 * Sales Engine breakdown it leads instead, naming the three tiers just before
 * the reader meets three columns with those names.
 */
export default function BandStrip({
  band,
  settings,
  className = "mt-10",
}: {
  band: Band;
  settings: SiteSettings | null;
  className?: string;
}) {
  return (
    <Reveal className={`${className} flex flex-col items-start justify-between gap-[22px] bg-ink px-[38px] py-[34px] text-white wide:flex-row wide:items-center`}>
      <div className="font-disp text-[clamp(17px,2.3vw,23px)] uppercase leading-tight">
        {withEmphasis(band.text)}
      </div>
      {band.cta && <Button cta={band.cta} settings={settings} />}
    </Reveal>
  );
}
