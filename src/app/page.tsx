import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getSiteSettings } from "@/lib/data";
import PageView from "./components/PageView";

/** The front page is the content entry with the slug "home". */
const HOME_SLUG = "home";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(HOME_SLUG);
  if (!page?.seo) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
    openGraph: page.seo.imageUrl ? { images: [{ url: page.seo.imageUrl }] } : undefined,
  };
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage(HOME_SLUG), getSiteSettings()]);
  if (!page) notFound();
  return <PageView page={page} settings={settings} />;
}
