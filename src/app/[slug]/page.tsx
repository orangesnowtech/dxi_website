import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getAllPageSlugs, getSiteSettings } from "@/lib/data";
import PageView from "../components/PageView";

/**
 * Slugs owned by real routes in the app rather than by the content layer.
 * Next.js already gives static segments priority, but excluding them here keeps
 * a stray content entry from being pre-rendered at a path it is never served from.
 */
const RESERVED = new Set([
  "home",
  "admin",
  "business-profile",
  "events",
  "api",
  "privacy",
  "terms",
  "data-deletion",
]);

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.filter((slug) => !RESERVED.has(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description,
    openGraph: page.seo?.imageUrl ? { images: [{ url: page.seo.imageUrl }] } : undefined,
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()]);
  if (!page) notFound();

  return <PageView page={page} settings={settings} />;
}
