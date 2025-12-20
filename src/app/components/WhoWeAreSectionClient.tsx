"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getServicesSection } from "@/lib/sanity/queries";

interface WhoWeAreData {
  label?: string;
  heading?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function WhoWeAreSectionClient() {
  const [data, setData] = useState<WhoWeAreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getServicesSection();
        setData(data?.whoWeAre || null);
      } catch (error) {
        console.error('Error fetching Who We Are data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Default values if no data
  const label = data?.label || "Who We Are";
  const heading = data?.heading || "DXI Marketing is a leading agency crafting impactful digital experiences and insights. With over a decade of expertise, we blend creativity and strategy to engage audiences. {highlight}Our goal{/highlight} is to help brands grow, connect, and thrive in the modern marketplace.";
  const buttonText = data?.buttonText || "Work with Us";
  const buttonLink = data?.buttonLink || "/contact-us";

  // Parse heading to handle {highlight} tags
  const parseHeading = (text: string) => {
    const parts = text.split(/{highlight}(.*?){\/highlight}/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is highlighted text
        return (
          <span key={index} className="inline-block bg-[#FF8A33] text-black rounded-sm px-3 py-1 ml-2">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center bg-black text-white py-4">
        <div className="container mx-auto px-6">
          <p className="text-white/60">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center bg-black text-white py-4 md:py-4">
      <div className="container mx-auto px-6 mb-22 md:pt-0">
        <p className="text-sm text-white/80 mb-4 md:mb-6">{label}</p>

        <h2
          className="font-semibold mb-6 md:mb-10 
            text-3xl md:text-[46px] 
            leading-[1.1] tracking-tight"
        >
          {parseHeading(heading)}
        </h2>

        <Link
          href={buttonLink}
          className="inline-block bg-[#EF1111] text-white px-6 py-3 rounded-full text-base font-medium shadow-md"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

