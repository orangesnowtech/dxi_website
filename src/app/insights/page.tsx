"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function Insights() {
    const [isSticky, setIsSticky] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const landingRef = useRef(null);
    const cardsPerPage = 10;

    // Generate 15 cards for demonstration (you can replace this with actual data)
    const totalCards = 15;
    const totalPages = Math.ceil(totalCards / cardsPerPage);

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

    // Calculate which cards to display
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const currentCards = Array.from({ length: totalCards }, (_, i) => i + 1).slice(startIndex, endIndex);

  return (
    <main className="min-h-screen font-sans">
      <Nav isSticky={false} />

      {/* Hero */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          Our Insights
        </h1>
      </section>

      {/* Topics Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
            Topics
          </h2>
          
          {/* Cards Container */}
          <div className="space-y-6 mb-8">
            {currentCards.map((cardIndex) => (
              <article
                key={cardIndex}
                className="bg-white rounded-lg overflow-hidden flex flex-col md:flex-row transition-shadow duration-300 hover:shadow-md cursor-pointer p-4"
              >
                {/* Image Section */}
                <div className="relative w-full md:w-80 h-64 md:h-48 flex-shrink-0">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src="/images/mtn.jpg"
                      alt="MTN Article"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg" />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    <span className="text-sm font-medium text-[#EF1111] border-t-2 border-[#EF1111] pt-1">
                      Industry
                    </span>
                    <span className="text-sm font-medium text-[#EF1111] border-t-2 border-[#EF1111] pt-1">
                      Brand
                    </span>
                    <span className="text-sm font-medium text-[#EF1111] border-t-2 border-[#EF1111] pt-1">
                      Marketing
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    The truth behind MTN&apos;s growth
                  </h3>
                  
                  {/* Author and Meta */}
                  <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Chris Woghiren</span>
                    <div className="flex text-gray-900 items-center gap-2">
                      <span>5 mins read</span>
                      <span className="text-gray-900 font-bold">•</span>
                      <span>Thursday, 2nd, May 2025</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-[#EF1111] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
