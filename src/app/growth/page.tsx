import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Free Business Growth Session | DXI Marketing",
  description:
    "Get a free business growth audit and readiness score from DXI Marketing. High-scoring businesses receive a one-on-one strategy consulting session.",
};

const outcomes = [
  {
    title: "Free Business Growth Audit",
    body: "Every business that completes the questionnaire receives a no-cost audit with practical growth observations.",
  },
  {
    title: "Business Growth Readiness Score",
    body: "You get a readiness score showing how prepared your business is to scale across branding, systems, and market execution.",
  },
  {
    title: "One-on-One Strategy Session",
    body: "Businesses that meet the score threshold receive a private booking link for a consulting session with the DXI strategy team.",
  },
];

const steps = [
  {
    title: "Complete the questionnaire",
    detail:
      "Fill out a short business profile so we can understand your current stage, goals, and growth blockers.",
  },
  {
    title: "Receive your audit + score",
    detail:
      "Our team reviews your responses and sends your free business growth audit and readiness score.",
  },
  {
    title: "Unlock strategy call (if selected)",
    detail:
      "High-scoring businesses get a direct link to book a one-on-one consulting session.",
  },
];

export default function GrowthPage() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <Nav isSticky />

      <section className="relative overflow-hidden bg-[#080808] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-[#EF1111]/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#ffffff]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#EF1111]/15 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 py-18 md:py-24">
          <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm tracking-wide">
            Limited Slots Available
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Get a FREE Business Growth Consulting Session from DXI Marketing
          </h1>

          <p className="mt-6 max-w-3xl text-base text-white/85 md:text-xl">
            To be selected, complete a short business questionnaire. Everyone who applies receives value,
            and top-scoring businesses unlock a one-on-one strategy session with our consulting team.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/business-profile"
              className="inline-flex items-center justify-center rounded-full bg-[#EF1111] px-8 py-3 font-medium text-white transition hover:bg-white hover:text-[#EF1111]"
            >
              Start the Questionnaire
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Speak to DXI
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/80">
            Visit dximarketing.com/growth to get started.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f7f7] py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-semibold text-[#111111] md:text-4xl">What You Get</h2>
            <p className="mt-3 text-base text-[#4b4b4b] md:text-lg">
              This is not a generic giveaway. It is a practical growth pathway designed to identify serious
              businesses and help them move faster.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {outcomes.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#e6e6e6] bg-white p-7 shadow-sm">
                <h3 className="text-xl font-semibold text-[#111111]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4b4b4b]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold md:text-4xl">How Selection Works</h2>
              <p className="mt-2 max-w-2xl text-[#4b4b4b]">
                We keep this process simple, transparent, and focused on business impact.
              </p>
            </div>
            <p className="text-sm font-medium text-[#EF1111]">Shortlisting is based on readiness score.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-[#111111] p-6 text-white">
                <p className="text-sm font-medium text-[#EF1111]">Step {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-white/85">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080808] py-16 text-white md:py-20">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-8 md:p-12">
            <h2 className="text-3xl font-semibold md:text-4xl">Ready to Find Your Next Growth Move?</h2>
            <p className="mt-4 max-w-3xl text-white/85 md:text-lg">
              Complete the business questionnaire now. Every completed application receives a free growth
              audit and readiness score. If your score qualifies, you will receive an invitation to book your
              one-on-one consulting session.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/business-profile"
                className="inline-flex items-center justify-center rounded-full bg-[#EF1111] px-8 py-3 font-medium text-white transition hover:bg-white hover:text-[#EF1111]"
              >
                Get Started Now
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}