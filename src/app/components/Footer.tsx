"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity/types";
import { isSurveyPath } from "@/lib/surveys";
import CookieChoicesLink from "./CookieChoicesLink";

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname();

  // Survey pages end with the client's own footer line. A client component
  // only so it can ask which page it is on.
  if (isSurveyPath(pathname)) {
    return null;
  }

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
        {/* Meta checks that the privacy and terms URLs it was given actually
            load, and a policy nobody can reach from the site is not one
            anybody has been given. */}
        <span className="flex items-center gap-3.5">
          <Link href="/privacy" className="hover:text-paper">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-paper">
            Terms
          </Link>
          <CookieChoicesLink />
        </span>
      </div>
    </footer>
  );
}
