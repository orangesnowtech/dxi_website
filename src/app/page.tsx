"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import BrandsSection from "./components/BrandsSection";
import InsightsSection from "./components/InsightsSection";
import WhoWeAreSection from "./components/WhoWeAreSection";
import ServicesSection from "./components/ServicesSection";
import TestimonialsSection from "./components/TestimonialsSection";

export default function Home() {
  const [isSticky, setIsSticky] = useState(false);
  const landingRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (landingRef.current) observer.observe(landingRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen font-sans">
      {/* Landing Section */}
      <section
        ref={landingRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <Image
          src="/images/landinghero.jpg"
          alt="Landing Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            A Digital experience and
          </h1>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-300">
            Integrated Marketing Agency
          </h1>

          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block bg-[#EF1111] text-white px-8 py-3 rounded-full text-sm font-semibold"
            >
              Send Us a Brief
            </Link>
          </div>
        </div>
      </section>

      {/* Nav sticky */}
      <Nav isSticky={isSticky} />

      {/* WHO WE ARE */}
      <WhoWeAreSection />

      {/* Services */}
      <ServicesSection />

      {/* Brands We Represent */}
      <BrandsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Our Insights */}
      <InsightsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
