import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";

/** Eyebrow + heading + intro paragraph, the opener on nearly every section. */
export default function SectionHeader({
  eyebrow,
  heading,
  body,
  onDark = false,
  className = "",
}: {
  eyebrow?: string;
  heading?: string;
  body?: string;
  onDark?: boolean;
  className?: string;
}) {
  if (!eyebrow && !heading && !body) return null;

  return (
    <Reveal className={`max-w-[720px] mb-[46px] ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      {heading && (
        <h2 className="font-disp uppercase leading-none tracking-[-0.01em] text-[clamp(28px,4vw,44px)] mb-[14px]">
          {heading}
        </h2>
      )}
      {body && (
        <p className={`text-[16.5px] ${onDark ? "text-mute" : "text-smoke"}`}>{body}</p>
      )}
    </Reveal>
  );
}
