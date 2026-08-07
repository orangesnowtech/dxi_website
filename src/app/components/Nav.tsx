"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity/types";
import { pagePath } from "@/lib/content";
import Button from "./ui/Button";

export default function Nav({ settings }: { settings: SiteSettings | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = settings?.navLinks ?? [];

  return (
    <nav className="sticky top-0 z-100 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 w-full max-w-wrap items-center justify-between px-6">
        <Link href="/" className="font-disp text-[22px] uppercase tracking-[0.02em]">
          DX<span className="text-signal">I</span>
        </Link>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer border-none bg-transparent text-[26px] leading-none text-ink wide:hidden"
        >
          ☰
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute top-16 right-0 left-0 flex-col gap-[18px] border-b border-line bg-paper p-[22px] wide:static wide:flex wide:flex-row wide:items-center wide:gap-[26px] wide:border-0 wide:p-0`}
        >
          {links.map((link) => {
            const href = pagePath(link.slug);
            const active = pathname === href;
            return (
              <Link
                key={link._key}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 py-1 font-mono text-[13px] tracking-[0.03em] transition-colors ${
                  active
                    ? "border-signal text-signal"
                    : "border-transparent hover:border-signal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {settings?.navCta && (
            <Button
              cta={settings.navCta}
              settings={settings}
              className="!px-[18px] !py-2.5 !text-xs"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
