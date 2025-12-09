"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import { getInsights } from "@/lib/sanity/queries";

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

export default function InsightsSectionClient() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const fetchedInsights = await getInsights();
        // Limit to 3 insights for homepage
        setInsights(fetchedInsights.slice(0, 3));
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInsights();
  }, []);
  return (
    <section className="bg-[#080808] py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-white text-3xl md:text-4xl font-semibold mb-6">
            Our Insights
          </h2>
          <p className="text-white text-left text-2xl md:text-3xl font-medium max-w-4xl">
            Here are some of the stories, insights, and ideas we share to keep you informed.
          </p>
        </div>

        {/* Insights Cards */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading insights...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {insights.map((insight) => {
              const imageUrl = insight.featuredImage
                ? urlFor(insight.featuredImage).width(800).height(600).url()
                : "/images/mtn.jpg";

              return (
                <Link
                  key={insight._id}
                  href={`/insights/${insight.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white"
                >
                  {/* Image with Overlay and Content */}
                  <div className="relative w-full min-h-[400px]">
                    <Image
                      src={imageUrl}
                      alt={insight.title}
                      fill
                      className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient Overlay - darker at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black rounded-lg" />
                    
                    {/* Content Section - positioned at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
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
                    <h3 className="text-xl font-bold text-white mb-4">
                      {insight.title}
                    </h3>

                    {/* Author and Meta */}
                    <div className="flex items-center justify-between text-sm text-white">
                      <span className="font-medium">{insight.author}</span>
                      <span>{insight.readingTime} mins read</span>
                    </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No insights available.</p>
          </div>
        )}

        {/* View All Button */}
        <Link
          href="/insights"
          className="inline-block bg-[#EF1111] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d00f0f] transition-colors"
        >
          View all
        </Link>
      </div>
    </section>
  );
}

