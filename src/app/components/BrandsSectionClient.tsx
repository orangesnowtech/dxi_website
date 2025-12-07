"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { urlFor } from "@/lib/sanity/client";

interface Client {
  _id: string;
  title: string;
  slug: string;
  logo?: any;
}

interface BrandsSectionClientProps {
  clients: Client[];
}

const MAX_CLIENTS_TO_DISPLAY = 5;

export default function BrandsSectionClient({ clients }: BrandsSectionClientProps) {
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);
  
  // Limit to 5 clients for display
  const displayClients = clients.slice(0, MAX_CLIENTS_TO_DISPLAY);

  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto px-6">
        <p className="text-sm text-white/80 mb-6">Brands We Represent</p>

        <div className="flex items-start md:items-center justify-between gap-6">
          <h2 className="text-5xl font-semibold leading-tight">
            Here are some of the brands and organizations we proudly work
            with.
          </h2>

          <div className="hidden md:flex items-center justify-center w-24 h-24">
            <svg
              width="150"
              height="155"
              viewBox="0 0 150 155"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.25 108.712V44.2881L59.3311 76.5L16.25 108.712Z"
                stroke="#EF1111"
                strokeWidth="2"
              />
              <path
                d="M43.2881 138.75H107.712L75.5 95.6689L43.2881 138.75Z"
                stroke="#EF1111"
                strokeWidth="2"
              />
              <path
                d="M43.2881 16.25H107.712L75.5 59.3311L43.2881 16.25Z"
                stroke="#EF1111"
                strokeWidth="2"
              />
              <path
                d="M133.75 108.712V44.2881L90.6689 76.5L133.75 108.712Z"
                stroke="#EF1111"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center">
          {displayClients.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-white/60">No clients found.</p>
            </div>
          ) : (
            displayClients.map((client) => {
              const logoUrl = client.logo
                ? urlFor(client.logo).width(280).height(160).url()
                : null;

              return (
                <Link
                  key={client._id}
                  href={`/projects/${client.slug}`}
                  className="w-full max-w-[260px] bg-white rounded-lg shadow-md flex items-center justify-center relative group transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setHoveredClient(client._id)}
                  onMouseLeave={() => setHoveredClient(null)}
                >
                  {logoUrl ? (
                    <div className="p-4 md:p-8">
                      <Image
                        src={logoUrl}
                        alt={client.title}
                        width={140}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-4 md:p-8 text-center">
                      <p className="text-gray-600 text-sm">{client.title}</p>
                    </div>
                  )}
                  
                  {/* Tooltip */}
                  {hoveredClient === client._id && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap pointer-events-none z-20 shadow-lg">
                      View Client
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>
        
        <Link
          href="/projects?tab=projects"
          className="inline-block mt-8 bg-[#EF1111] text-white px-6 py-3 rounded-full text-base font-medium shadow-md hover:bg-[#d00f0f] transition-colors"
        >
          See all Projects
        </Link>
      </div>
    </section>
  );
}

