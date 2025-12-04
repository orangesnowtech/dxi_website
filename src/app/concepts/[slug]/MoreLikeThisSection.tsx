"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/client";
import ConceptCardHoverReactions from "../../concepts/ConceptCardHoverReactions";

interface MoreLikeThisSectionProps {
  concepts: Array<{
    _id: string;
    slug: string;
    title: string;
    team: string;
    image: any;
  }>;
}

export default function MoreLikeThisSection({
  concepts,
}: MoreLikeThisSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      return () => container.removeEventListener("scroll", checkScrollability);
    }
  }, [concepts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (concepts.length === 0) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <p className="text-sm text-gray-600 mb-2">Other Concepts</p>
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">
            More Like This
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500">None yet</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Other Concepts</p>
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              More Like This
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-opacity ${
                canScrollLeft
                  ? "border-gray-300 hover:border-gray-400 text-gray-600"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-opacity ${
                canScrollRight
                  ? "border-black hover:border-gray-800 text-black"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex gap-6 pb-4" style={{ width: "max-content" }}>
            {concepts.map((concept: any) => {
              const imageUrl = concept.image
                ? urlFor(concept.image).width(600).height(400).url()
                : "";
              return (
                <div
                  key={concept._id}
                  className="flex-shrink-0 w-[300px] md:w-[350px]"
                >
                  <Link
                    href={`/concepts/${concept.slug}`}
                    className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer group block"
                  >
                    {/* Image with dark overlay */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      {imageUrl && (
                        <>
                          <Image
                            src={imageUrl}
                            alt={concept.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-colors duration-300" />
                        </>
                      )}
                    </div>
                    {/* Title and Team at bottom - hidden on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="text-lg font-semibold mb-1">
                        {concept.title}
                      </h3>
                      <p className="text-sm text-white/90">{concept.team}</p>
                    </div>
                    {/* Reactions - shown on hover (view only) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <ConceptCardHoverReactions
                        conceptId={concept._id}
                        conceptSlug={concept.slug}
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

