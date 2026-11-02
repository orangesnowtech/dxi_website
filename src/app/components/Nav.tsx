"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavGroup, NavLink, SiteSettings } from "@/lib/sanity/types";
import { pagePath } from "@/lib/content";
import { isSurveyPath } from "@/lib/surveys";
import Button from "./ui/Button";

const linkText = "py-1 font-mono text-[13px] tracking-[0.03em] transition-colors";

export default function Nav({ settings }: { settings: SiteSettings | null }) {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const links = settings?.navLinks ?? [];

  // A dropdown left open shouldn't follow the visitor to the next page.
  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  // Clicking anywhere else, or pressing Escape, closes an open dropdown.
  useEffect(() => {
    if (!openGroup) return;
    const onClick = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  // A client questionnaire carries the client's name, not our navigation.
  if (isSurveyPath(pathname)) {
    return null;
  }

  const closeAll = () => {
    setOpen(false);
    setOpenGroup(null);
  };

  const renderLink = (link: NavLink, inGroup = false) => {
    const href = pagePath(link.slug);
    const active = pathname === href;
    return (
      <Link
        key={link._key}
        href={href}
        onClick={closeAll}
        aria-current={active ? "page" : undefined}
        className={
          inGroup
            ? `block whitespace-nowrap ${linkText} wide:px-4 wide:py-2 ${
                active ? "text-signal" : "hover:text-signal"
              }`
            : `border-b-2 ${linkText} ${
                active ? "border-signal text-signal" : "border-transparent hover:border-signal"
              }`
        }
      >
        {link.label}
      </Link>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const expanded = openGroup === group._key;
    const active = group.links.some((link) => pathname === pagePath(link.slug));
    return (
      <div key={group._key} className="group relative">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setOpenGroup(expanded ? null : group._key)}
          className={`flex cursor-pointer items-center gap-1.5 border-0 border-b-2 bg-transparent ${linkText} ${
            active ? "border-signal text-signal" : "border-transparent text-ink hover:border-signal"
          }`}
        >
          {group.label}
          <span
            aria-hidden
            className={`text-[9px] transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {/*
          On a phone the links open beneath the label, indented. On a wide
          screen they float below the bar, and hovering opens them as well as
          clicking — the transparent top padding bridges the gap so the
          pointer can travel from label to panel without it closing.
        */}
        <div
          className={`${
            expanded ? "flex" : "hidden"
          } flex-col gap-3 pt-3 pl-4 wide:absolute wide:top-full wide:left-[-16px] wide:z-10 wide:gap-0 wide:pl-0 wide:group-hover:flex`}
        >
          <div className="flex flex-col gap-3 wide:min-w-[180px] wide:gap-0 wide:border wide:border-line wide:bg-paper wide:py-2">
            {group.links.map((link) => renderLink(link, true))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-100 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 w-full max-w-wrap items-center justify-between px-6">
        <Link href="/" className="flex items-center" aria-label="DXI Marketing — home">
          {/*
            Square stacked lockup (mark over wordmark). width/height are the
            rendered size, not the source's 1500px — passing the source size
            makes Next request a 3840px variant for a 48px logo.
          */}
          <Image
            src="/images/dxilogo.png"
            alt="DXI Marketing"
            width={48}
            height={48}
            priority
            className="h-12 w-auto"
          />
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
          ref={barRef}
          className={`${
            open ? "flex" : "hidden"
          } absolute top-16 right-0 left-0 flex-col gap-[18px] border-b border-line bg-paper p-[22px] wide:static wide:flex wide:flex-row wide:items-center wide:gap-[26px] wide:border-0 wide:p-0`}
        >
          {links.map((item) => ("links" in item ? renderGroup(item) : renderLink(item)))}

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
