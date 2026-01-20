"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";

interface Client {
  _id: string;
  title: string;
  slug: string;
  backgroundImage?: any;
  logo?: any;
}

interface ClientsContentProps {
  clients: Client[];
}

export default function ClientsContent({ clients }: ClientsContentProps) {
  // Directly use clients without filtering
  const filteredClients = clients;

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-6">
        {/* Optional: Add page header */}
        <div className="mb-10">
          <h1 className="text-base text-gray-800 mb-4">
            Our Clients
          </h1>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No clients found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClients.map((p: Client) => {
              const bgImageUrl = p.backgroundImage
                ? urlFor(p.backgroundImage).width(800).height(600).url()
                : null;
              const logoUrl = p.logo
                ? urlFor(p.logo).width(300).height(150).url()
                : null;

              return (
                <div key={p._id} className="group overflow-hidden">
                  <div className="group bg-white rounded-2xl shadow-md overflow-hidden">
                    {/* Client card background */}
                    <Link 
                      href={`/projects/${p.slug}`}  // Keep your original href
                      className="block"
                    >
                      {bgImageUrl && (
                        <div className="relative w-full h-32 sm:h-48 lg:h-56 group-hover:scale-105 transition-transform duration-300">
                          <Image
                            src={bgImageUrl}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/55" />
                          {/* centered white card with logo */}
                          {logoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-white rounded-md px-6 py-4 shadow-sm flex items-center justify-center min-w-[160px]">
                                <Image
                                  src={logoUrl}
                                  alt={p.title}
                                  width={160}
                                  height={64}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Client title */}
                  <div className="px-4 py-5">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {p.title}
                    </h4>
                    
                    {/* Link */}
                    {/* <div className="mt-2">
                      <Link
                        href={`/projects/${p.slug}`}  // Keep your original href
                        className="text-xs text-[#EF1111] underline whitespace-nowrap"
                        aria-label={`View ${p.title} client`}
                      >
                        View Client
                      </Link>
                    </div> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}