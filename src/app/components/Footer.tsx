import type { SiteSettings } from "@/lib/sanity/types";

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  return (
    <footer className="border-t border-footer-line bg-ink py-[30px] font-mono text-xs tracking-[0.03em] text-footer-ink">
      <div className="mx-auto flex w-full max-w-wrap flex-wrap items-center justify-between gap-3.5 px-6">
        <span className="font-disp text-lg uppercase text-white">
          DX<span className="text-signal">I</span>
        </span>
        {settings?.footerTagline && <span>{settings.footerTagline}</span>}
        {settings?.footerContact && <span>{settings.footerContact}</span>}
      </div>
    </footer>
  );
}
