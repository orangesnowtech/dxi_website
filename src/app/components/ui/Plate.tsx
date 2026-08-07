import Link from "next/link";
import type { PlateItem, SiteSettings } from "@/lib/sanity/types";
import { resolveCtaHref, withEmphasis } from "@/lib/content";

/**
 * The site's signature card. One shape does four jobs — engine cards, pricing
 * tiers, studio departments and campaign packages — by leaving unused fields
 * empty rather than by branching on a variant.
 *
 * Tone is passed explicitly rather than inherited from a dark ancestor. The
 * design export relied on a `.dark .card` descendant selector that silently
 * failed wherever the markup used `.card.dark`; props make that unrepresentable.
 */
export default function Plate({
  plate,
  settings,
}: {
  plate: PlateItem;
  settings: SiteSettings | null;
}) {
  const tone = plate.tone ?? "default";
  const isDark = tone === "dark";
  const isLead = tone === "lead";

  const shell = [
    "group flex flex-col border-2 transition-[transform,box-shadow] duration-[180ms]",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    isDark ? "bg-ink text-white border-ink" : "bg-paper text-ink border-ink",
    isLead ? "shadow-[6px_6px_0_var(--color-signal)]" : "",
    "hover:-translate-y-1.5",
    isLead
      ? "hover:shadow-[10px_10px_0_var(--color-ink)]"
      : "hover:shadow-[8px_8px_0_var(--color-signal)]",
  ].join(" ");

  const headBorder = isLead ? "border-signal" : isDark ? "border-seam" : "border-ink";
  const footBorder = isDark || isLead ? "border-seam" : "border-ink";
  const specBorder = isDark || isLead ? "border-seam" : "border-line";

  const body = (
    <>
      {(plate.kicker || plate.kickerRight) && (
        <div
          className={`flex items-center justify-between border-b-2 px-[22px] py-[14px] font-mono text-xs tracking-[0.14em] ${headBorder} ${
            isLead ? "bg-signal text-white" : ""
          }`}
        >
          <span className={isLead ? "text-white" : "text-signal"}>{plate.kicker}</span>
          <span>{plate.kickerRight}</span>
        </div>
      )}

      <div className="flex-1 px-[22px] py-[26px]">
        <h3 className="mb-[10px] font-disp text-[22px] uppercase leading-tight">{plate.title}</h3>

        {plate.role && (
          <p className="mb-[14px] font-mono text-[12.5px] tracking-[0.05em] text-signal">
            {plate.role}
          </p>
        )}

        {plate.description && (
          <p className={`text-[14.5px] ${isDark ? "text-mute" : "text-smoke"}`}>
            {plate.description}
          </p>
        )}

        {plate.price?.amount && (
          <div className="font-mono">
            <span className="text-[30px] font-bold">{plate.price.amount}</span>
            {plate.price.unit && (
              <>
                {" "}
                <span className={`text-[12.5px] ${isDark ? "text-mute-lo" : "text-smoke"}`}>
                  {plate.price.unit}
                </span>
              </>
            )}
            {plate.price.recurringAmount && (
              <>
                <br />
                <span className={`text-[12.5px] ${isDark ? "text-mute-lo" : "text-smoke"}`}>
                  THEN
                </span>{" "}
                <span className="text-[19px] font-bold">{plate.price.recurringAmount}</span>
              </>
            )}
          </div>
        )}

        {plate.specs && plate.specs.length > 0 && (
          <div
            className={`mt-[18px] grid gap-[7px] border-t pt-[14px] font-mono text-[12.5px] ${specBorder} ${
              isDark ? "text-[#eee]" : "text-ink"
            }`}
          >
            {plate.specs.map((spec, i) => (
              <span key={i}>{withEmphasis(spec)}</span>
            ))}
          </div>
        )}
      </div>

      {plate.footLabel && (
        <div
          className={`flex items-center justify-between border-t-2 px-[22px] py-[15px] font-mono text-[13px] tracking-[0.06em] ${footBorder}`}
        >
          <span>{plate.footLabel}</span>
          <span className="text-[17px] text-signal transition-transform duration-[180ms] group-hover:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
            ▸
          </span>
        </div>
      )}
    </>
  );

  const href = plate.link ? resolveCtaHref(plate.link, settings) : null;
  if (!href) return <div className={shell}>{body}</div>;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={shell}>
        {body}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={shell}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  );
}
