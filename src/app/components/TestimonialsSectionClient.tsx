"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { getTestimonialsSection } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";

interface Testimonial {
  quote: string;
  designation?: string;
  name?: string;
  company?: string;
  order: number;
}

interface TestimonialsData {
  label?: string;
  backgroundImage?: any;
  testimonials?: Testimonial[];
}

export default function TestimonialsSectionClient() {
  const [data, setData] = useState<TestimonialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const testimonialsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTestimonialsSection();
        setData(data || null);
      } catch (error) {
        console.error("Error fetching Testimonials data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const scrollTestimonials = useCallback((dir: "left" | "right") => {
    const el = testimonialsRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8) || 800;
    el.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }, []);

  const label = data?.label || "Testimonials";
  const backgroundImage = data?.backgroundImage;
  const testimonials = data?.testimonials || [];
  const backgroundImageUrl = backgroundImage
    ? urlFor(backgroundImage).width(1920).height(1080).url()
    : "/images/landinghero.jpg";

  if (loading) {
    return (
      <section className="relative h-[400px] md:h-[520px] overflow-hidden">
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center justify-center">
          <p className="text-white/60">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[400px] md:h-[520px] overflow-hidden">
      {/* background image dark overlay */}
      <Image
        src={backgroundImageUrl}
        alt="Testimonials Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative z-10 container mx-auto px-6 h-full">
        <div className="flex items-start justify-between pt-8">
          <p className="text-sm text-white/90">{label}</p>
          <div className="flex gap-3 items-center">
            <button
              aria-label="Prev testimonial"
              onClick={() => scrollTestimonials("left")}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/6 border border-transparent transition-colors hover:bg-white hover:text-[#EF1111] hover:border-[#EF1111]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFD6D6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              aria-label="Next testimonial"
              onClick={() => scrollTestimonials("right")}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-transparent border border-transparent transition-colors hover:bg-white hover:text-[#EF1111] hover:border-[#EF1111]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFD6D6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
        {/* horizontal scroller - HIDDEN SCROLLBAR */}
        <div
          ref={testimonialsRef}
          className="mt-6 md:mt-10 h-[300px] md:h-[380px] flex gap-4 md:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {testimonials.length > 0 ? (
            testimonials.map((testimonial, idx) => (
              <article
                key={`testimonial-${testimonial.order}-${idx}`}
                className="snap-start min-w-[280px] md:min-w-[660px] max-w-[900px] h-full bg-white rounded-3xl p-6 md:p-12 shadow-2xl flex flex-col"
              >
                <div className="flex-1 overflow-hidden">
                  <p className="testimonial-quote-clamp text-sm md:text-lg text-gray-900 leading-tight md:leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>

                <div className="mt-auto pt-6 md:pt-8">
                  <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 82 82"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <path
                        d="M37.856 25.2091C33.1151 1.37952 48.879 1.37952 44.1382 25.2091C48.879 1.37952 63.4435 7.41099 49.9446 27.6137C63.4435 7.41099 74.589 18.5565 54.3863 32.0554C74.589 18.5565 80.6205 33.121 56.7909 37.859C80.6205 33.1181 80.6205 48.882 56.7909 44.1412C80.6205 48.882 74.5862 63.4436 54.3863 49.9447C74.5862 63.4436 63.4406 74.5891 49.9446 54.3864C63.4435 74.5863 48.879 80.6178 44.141 56.791C48.8819 80.6206 33.118 80.6206 37.8588 56.791C33.118 80.6206 18.5564 74.5863 32.0553 54.3864C18.5564 74.5863 7.41086 63.4407 27.6136 49.9447C7.41371 63.4436 1.38223 48.8792 25.209 44.1412C1.37939 48.882 1.37939 33.1181 25.209 37.859C1.37939 33.1181 7.41371 18.5565 27.6136 32.0554C7.41371 18.5565 18.5593 7.41099 32.0553 27.6137C18.5564 7.41384 33.1208 1.38236 37.8588 25.2091H37.856Z"
                        fill="#EF1111"
                      />
                    </svg>
                  </div>
                  {/* Designation */}
                  {testimonial.designation && (
                    <h4 className="text-xs md:text-base font-semibold text-gray-900 mb-1">
                      {testimonial.designation}
                    </h4>
                  )}
                  {/* Name */}
                  {testimonial.name && (
                    <h4 className="text-xs md:text-base font-semibold text-gray-900 mb-1">
                      {testimonial.name}
                    </h4>
                  )}
                  {/* Company */}
                  {testimonial.company && (
                    <p className="text-xs md:text-sm text-gray-600">
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="snap-start min-w-[280px] md:min-w-[660px] max-w-[900px] bg-white rounded-3xl p-6 md:p-12 shadow-2xl flex items-center justify-center">
              <p className="text-gray-500 text-sm md:text-base">
                No testimonials available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
