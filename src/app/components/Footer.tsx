import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/sanity/types";
import CookieChoicesLink from "./CookieChoicesLink";

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  return (
    <footer className="border-t border-footer-line bg-ink py-[30px] font-mono text-xs tracking-[0.03em] text-footer-ink">
      <div className="mx-auto flex w-full max-w-wrap flex-wrap items-center justify-between gap-3.5 px-6">
        <Link href="/" className="flex items-center" aria-label="DXI Marketing — home">
          {/* White variant, for the dark footer. See the note in Nav on sizing. */}
          <Image
            src="/images/dxilogo2.png"
            alt="DXI Marketing"
            width={48}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
        {settings?.footerTagline && <span>{settings.footerTagline}</span>}
        {settings?.footerContact && <span>{settings.footerContact}</span>}
        <CookieChoicesLink />
      </div>
    </footer>
  );
}
