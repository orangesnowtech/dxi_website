"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getHomepage } from "@/lib/sanity/queries";

interface Service {
  title: string;
  description: string;
  backgroundColor: 'white' | 'black';
  iconSvg?: string;
  order: number;
}

interface ServicesData {
  label?: string;
  heading?: string;
  services?: Service[];
}

export default function ServicesSectionClient() {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const homepage = await getHomepage();
        setData(homepage?.services || null);
      } catch (error) {
        console.error('Error fetching Services data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const label = data?.label || "Services We Render";
  const heading = data?.heading || "Our Expertise";
  const services = data?.services || [];

  // Default SVG icons (fallback if not provided in Sanity)
  const defaultIcons: Record<string, string> = {
    "Digital Marketing": `<svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <path d="M43.535 8.49042L24.1311 17.8048C22.6377 18.5216 21.0421 18.7012 19.4155 18.3368C18.351 18.0983 17.8187 17.9791 17.39 17.9302C12.0675 17.3223 8.75 21.5349 8.75 26.379V29.0375C8.75 33.8817 12.0675 38.0942 17.39 37.4864C17.8187 37.4374 18.351 37.3181 19.4155 37.0798C21.0421 36.7152 22.6377 36.8949 24.1311 37.6118L43.535 46.9262C47.9891 49.0644 50.2162 50.1333 52.6995 49.3C55.1825 48.4668 56.0347 46.6785 57.7395 43.1024C62.4202 33.2826 62.4202 22.1341 57.7395 12.314C56.0347 8.73784 55.1825 6.94978 52.6995 6.11646C50.2162 5.28317 47.9891 6.35224 43.535 8.49042Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M33.4195 60.5819L29.0697 64.1667C19.265 56.3906 20.4628 52.6824 20.4628 37.9167H23.7698C25.1119 46.261 28.2774 50.2134 32.6454 53.0747C35.336 54.8369 35.8908 58.5449 33.4195 60.5819Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.875 36.4583V18.9583" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>`,
  };

  if (loading) {
    return (
      <section className="relative bg-white py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <p className="text-white/60">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white py-24 overflow-hidden">
      {/* pink blurred circles - keeping existing animations */}
      <motion.div
        className="absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #FF69B4 0%, transparent 70%)",
          opacity: 0.25,
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-[-150px] bottom-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #FF1493 0%, transparent 70%)",
          opacity: 0.22,
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      <motion.div
        className="absolute left-1/4 top-[-100px] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #FFB6C1 0%, transparent 70%)",
          opacity: 0.28,
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 25, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute right-1/3 bottom-[-150px] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #C71585 0%, transparent 70%)",
          opacity: 0.2,
          filter: "blur(45px)",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, -15, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      <div className="relative container mx-auto px-6 z-10">
        <div className="mb-16">
          <p className="text-sm text-black font-semibold mb-4 uppercase tracking-wider">
            {label}
          </p>
          <h3 className="text-4xl md:text-5xl font-bold text-black mb-10">
            {heading}
          </h3>
        </div>

        {/* Services Cards */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service) => {
              const bgColor = service.backgroundColor === 'black' ? 'bg-black text-white' : 'bg-white text-black';
              const borderColor = service.backgroundColor === 'black' ? 'border-gray-800' : 'border-gray-200';
              const iconSvg = service.iconSvg || defaultIcons[service.title] || '';

              return (
                <div
                  key={service.order}
                  className={`${bgColor} rounded-xl shadow-lg p-6 border ${borderColor} transition-shadow duration-300`}
                >
                  {/* Icon */}
                  {iconSvg && (
                    <div className="mb-4" dangerouslySetInnerHTML={{ __html: iconSvg }} />
                  )}

                  {/* Title */}
                  <h4 className={`text-xl font-bold mb-4 ${service.backgroundColor === 'black' ? 'text-white' : 'text-black'}`}>
                    {service.title}
                  </h4>

                  {/* Description */}
                  <p className={`text-base leading-relaxed ${service.backgroundColor === 'black' ? 'text-white' : 'text-black'}`}>
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No services available.</p>
          </div>
        )}
      </div>
    </section>
  );
}

