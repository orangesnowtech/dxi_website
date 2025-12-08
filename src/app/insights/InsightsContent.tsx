"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/client";

interface Insight {
  _id: string;
  title: string;
  featuredImage: any;
  author: string;
  readingTime: number;
  publishedDate: string;
  slug: string;
  categories?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface InsightsContentProps {
  insights: Insight[];
  categories: Category[];
}

export default function InsightsContent({ insights, categories }: InsightsContentProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1);
    }
  }, [categoryParam]);

  // Filter insights by category
  const filteredInsights = selectedCategory
    ? insights.filter((insight) =>
        insight.categories?.some((cat) => cat._id === selectedCategory)
      )
    : insights;

  const totalPages = Math.ceil(filteredInsights.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentInsights = filteredInsights.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Get ordinal suffix
    const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? "st" :
                   dayNum === 2 || dayNum === 22 ? "nd" :
                   dayNum === 3 || dayNum === 23 ? "rd" : "th";
    
    return `${day}, ${dayNum}${suffix}, ${month} ${year}`;
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when filtering
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (categoryId) {
      url.searchParams.set('category', categoryId);
    } else {
      url.searchParams.delete('category');
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <>
      {/* Topics Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Topics
            </h2>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-[#EF1111] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category._id
                      ? "bg-[#EF1111] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
          
          {/* Cards Container */}
          <div className="space-y-6 mb-8">
            {currentInsights.map((insight) => {
              const imageUrl = insight.featuredImage
                ? urlFor(insight.featuredImage).width(800).height(600).url()
                : "/images/mtn.jpg";

              return (
                <Link key={insight._id} href={`/insights/${insight.slug}`}>
                  <article className="bg-white rounded-lg overflow-hidden flex flex-col md:flex-row transition-shadow duration-300 hover:shadow-md cursor-pointer p-4">
                    {/* Image Section */}
                    <div className="relative w-full md:w-80 h-64 md:h-48 flex-shrink-0">
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={insight.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg" />
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                      {/* Categories */}
                      {insight.categories && insight.categories.length > 0 && (
                        <div className="flex flex-wrap gap-4 mb-3">
                          {insight.categories.map((category) => (
                            <span
                              key={category._id}
                              className="text-sm font-medium text-[#EF1111] border-t-2 border-[#EF1111] pt-1"
                            >
                              {category.title}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {insight.title}
                      </h3>
                      
                      {/* Author and Meta */}
                      <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{insight.author}</span>
                        <div className="flex text-gray-900 items-center gap-2">
                          <span>{insight.readingTime} mins read</span>
                          <span className="text-gray-900 font-bold">•</span>
                          <span>{formatDate(insight.publishedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
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
    </>
  );
}

