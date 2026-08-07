import Link from "next/link";
import type { Cta, SiteSettings } from "@/lib/sanity/types";
import { resolveCtaHref } from "@/lib/content";

const STYLES: Record<string, string> = {
  signal: "bg-signal text-white hover:bg-signal-hover hover:-translate-y-0.5",
  ink: "bg-ink text-white hover:bg-ink-hover hover:-translate-y-0.5",
  line: "bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-ink)] hover:bg-ink hover:text-white hover:-translate-y-0.5",
  lineInverse:
    "bg-transparent text-white shadow-[inset_0_0_0_2px_#fff] hover:bg-white hover:text-ink hover:-translate-y-0.5",
};

const BASE =
  "inline-block font-mono text-sm tracking-[0.04em] px-[30px] py-4 transition-[transform,background-color,color] duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export default function Button({
  cta,
  settings,
  className = "",
}: {
  cta: Cta;
  settings: SiteSettings | null;
  className?: string;
}) {
  const href = resolveCtaHref(cta, settings);
  const style = STYLES[cta.style ?? "signal"] ?? STYLES.signal;
  const classes = `${BASE} ${style} ${className}`;

  // Deliberately non-clickable CTAs render as inert text at reduced opacity.
  if (!href) {
    return <span className={`${classes} opacity-70 cursor-default`}>{cta.label}</span>;
  }

  // Internal routes go through next/link; WhatsApp, tel: and anchors do not.
  const isInternal = href.startsWith("/");
  if (isInternal) {
    return (
      <Link href={href} className={classes}>
        {cta.label}
      </Link>
    );
  }

  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      className={classes}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {cta.label}
    </a>
  );
}
