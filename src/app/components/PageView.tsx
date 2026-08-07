import Link from "next/link";
import type { Page, SiteSettings } from "@/lib/sanity/types";
import SectionRenderer from "./SectionRenderer";
import { Wrap } from "./ui/Section";

/** Renders a page document: optional breadcrumb trail, then its sections. */
export default function PageView({
  page,
  settings,
}: {
  page: Page;
  settings: SiteSettings | null;
}) {
  return (
    <>
      {page.breadcrumb && (
        <Wrap className="pt-[18px] font-mono text-xs tracking-[0.08em] text-smoke">
          <Link href="/" className="hover:text-signal">
            DXI
          </Link>{" "}
          / <span className="text-signal">{page.breadcrumb}</span>
        </Wrap>
      )}
      <SectionRenderer sections={page.sections ?? []} settings={settings} />
    </>
  );
}
