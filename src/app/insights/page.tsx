import { Suspense } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getInsights, getInsightCategories } from "@/lib/sanity/queries";
import InsightsClientWrapper from "./InsightsClientWrapper";
import InsightsContent from "./InsightsContent";
import Link from "next/link";

export default async function Insights() {
  let insights = [];
  let categories = [];

  try {
    insights = await getInsights();
  } catch (error) {
    console.error("Error fetching insights:", error);
    insights = [];
  }

  try {
    categories = await getInsightCategories();
  } catch (error) {
    console.error("Error fetching insight categories:", error);
    categories = [];
  }

  return (
    <main className="min-h-screen font-sans">
      <Nav isSticky={false} />
      <InsightsClientWrapper />

      {/* Breadcrumb Navigation - Fixed under nav */}
      <section className="sticky top-[85px] z-40 bg-[#EF1111] py-3">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-white text-sm font-medium">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <Link href="/insights" className="hover:underline">
              Insights
            </Link>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          Our Insights
        </h1>
      </section>

      <Suspense fallback={<div>Loading...</div>}>
        <InsightsContent insights={insights} categories={categories} />
      </Suspense>

      {/* Footer */}
      <Footer />
    </main>
  );
}
