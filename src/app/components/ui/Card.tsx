import type { CardItem, SiteSettings } from "@/lib/sanity/types";
import Button from "./Button";
import Eyebrow from "./Eyebrow";

/**
 * The plain bordered card. Tone is explicit rather than inherited so a dark
 * card works on any background — the design export's dark cards silently
 * rendered light wherever they sat outside a dark section.
 */
export default function Card({
  card,
  settings,
}: {
  card: CardItem;
  settings: SiteSettings | null;
}) {
  const isDark = card.tone === "dark";
  const border = card.emphasis
    ? isDark
      ? "border-2 border-ink"
      : "border-2 border-ink"
    : isDark
      ? "border border-coal-line"
      : "border border-line";
  const padding = card.emphasis ? "p-8" : "p-7";

  return (
    <div className={`${isDark ? "bg-ink text-white" : "bg-paper text-ink"} ${border} ${padding}`}>
      {card.eyebrow && <Eyebrow>{card.eyebrow}</Eyebrow>}

      {card.step && (
        <div className="font-mono text-[22px] font-bold leading-none text-signal">{card.step}</div>
      )}

      <h3
        className={`font-disp uppercase ${
          card.emphasis ? "text-2xl" : "text-base"
        } ${card.step ? "mt-1.5" : ""} mb-2.5`}
      >
        {card.showTick !== false && <span className="mr-2 text-signal">▸</span>}
        {card.title}
      </h3>

      {card.body && (
        <p className={`text-[14.5px] ${isDark ? "text-mute" : "text-smoke"}`}>{card.body}</p>
      )}

      {card.cta && (
        <div className="mt-[22px]">
          <Button cta={card.cta} settings={settings} />
        </div>
      )}
    </div>
  );
}
