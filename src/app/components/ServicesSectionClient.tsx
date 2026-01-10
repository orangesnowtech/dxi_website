"use client";

import { useState, useEffect } from "react";
import { getServicesSection } from "@/lib/sanity/queries";
import { getServiceIcon } from "@/lib/icons/serviceIcons";

interface Service {
  title: string;
  description: string;
  backgroundColor: "white" | "black";
  iconName?: string;
  order: number;
}

interface ServicesData {
  services?: Service[];
}

export default function ServicesSectionClient() {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getServicesSection();
        setData(data || null);
      } catch (error) {
        console.error("Error fetching Services data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Hardcoded label and heading
  const label = "Services We Render";
  const heading = "Our Expertise";
  const services = data?.services || [];

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
      <div
        className="absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full pointer-events-none glow-float-1"
        style={{
          background: "radial-gradient(circle, #FF69B4 0%, transparent 70%)",
          opacity: 0.25,
          filter: "blur(60px)",
        }}
      />

      <div
        className="absolute right-[-150px] bottom-1/3 w-[400px] h-[400px] rounded-full pointer-events-none glow-float-2"
        style={{
          background: "radial-gradient(circle, #FF1493 0%, transparent 70%)",
          opacity: 0.22,
          filter: "blur(50px)",
        }}
      />

      <div
        className="absolute left-1/4 top-[-100px] w-[300px] h-[300px] rounded-full pointer-events-none glow-float-3"
        style={{
          background: "radial-gradient(circle, #FFB6C1 0%, transparent 70%)",
          opacity: 0.28,
          filter: "blur(40px)",
        }}
      />

      <div
        className="absolute right-1/3 bottom-[-150px] w-[350px] h-[350px] rounded-full pointer-events-none glow-float-4"
        style={{
          background: "radial-gradient(circle, #C71585 0%, transparent 70%)",
          opacity: 0.2,
          filter: "blur(45px)",
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
              const bgColor =
                service.backgroundColor === "black"
                  ? "bg-black text-white"
                  : "bg-white text-black";
              const borderColor =
                service.backgroundColor === "black"
                  ? "border-gray-800"
                  : "border-gray-200";
              const IconComponent = service.iconName ? getServiceIcon(service.iconName) : null;

              return (
                <div
                  key={service.order}
                  className={`${bgColor} rounded-xl shadow-lg p-6 border ${borderColor} transition-shadow duration-300`}
                >
                  {/* Icon */}
                  {IconComponent && (
                    <div className="mb-4">
                      <IconComponent 
                        size={32} 
                        stroke="#EF1111" 
                        strokeWidth={2}
                        className="w-8 h-8"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h4
                    className={`text-xl font-bold mb-4 ${service.backgroundColor === "black" ? "text-white" : "text-black"}`}
                  >
                    {service.title}
                  </h4>

                  {/* Description */}
                  <p
                    className={`text-base leading-relaxed ${service.backgroundColor === "black" ? "text-white" : "text-black"}`}
                  >
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
