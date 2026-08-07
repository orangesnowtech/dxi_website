import type { Band, SiteSettings } from "@/lib/sanity/types";
import { withEmphasis } from "@/lib/content";
import Button from "./Button";
import Reveal from "./Reveal";

/** The black strip that closes out a grid. */
export default function BandStrip({
  band,
  settings,
}: {
  band: Band;
  settings: SiteSettings | null;
}) {
  return (
    <Reveal className="mt-10 flex flex-col items-start justify-between gap-[22px] bg-ink px-[38px] py-[34px] text-white wide:flex-row wide:items-center">
      <div className="font-disp text-[clamp(17px,2.3vw,23px)] uppercase leading-tight">
        {withEmphasis(band.text)}
      </div>
      {band.cta && <Button cta={band.cta} settings={settings} />}
    </Reveal>
  );
}
