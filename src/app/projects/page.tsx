"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function Projects() {
  const [isSticky, setIsSticky] = useState(false);
  const landingRef = useRef(null);

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

  // sample projects - background image then centered logo overlay
  const projects = [
    {
      id: "erisco-1",
      title: "ERISCO FOODS",
      bg: "/images/eriscobg.jpg",
      logo: "/images/erisco2.png",
    },
    {
      id: "purch-1",
      title: "PURCHGADGETS",
      bg: "/images/purchbg.jpg",
      logo: "/images/purch2.png",
    },
    {
      id: "erisco-2",
      title: "ERISCO FOODS",
      bg: "/images/eriscobg.jpg",
      logo: "/images/erisco2.png",
    },
    {
      id: "purch-2",
      title: "PURCHGADGETS",
      bg: "/images/purchbg.jpg",
      logo: "/images/purch2.png",
    },
    {
      id: "erisco-3",
      title: "ERISCO FOODS",
      bg: "/images/eriscobg.jpg",
      logo: "/images/erisco2.png",
    },
    {
      id: "erisco-4",
      title: "ERISCO FOODS",
      bg: "/images/eriscobg.jpg",
      logo: "/images/erisco2.png",
    },
  ];

  return (
    <main className="min-h-screen font-sans">
      {/* Nav sticky */}
      <Nav isSticky={isSticky} />

      {/* Hero */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          Projects
        </h1>
      </section>

      {/* Clients grid (cards match screenshot) */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <h3 className="text-base text-gray-800 mb-8">Clients</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <div key={p.id} className="group overflow-hidden">
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  {/* image background */}
                  <div
                    className="relative w-full h-32 sm:h-48 lg:h-56 bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.bg})` }}
                  >
                    {/* centered white card with logo (white rectangle under logo) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="bg-white rounded-md px-6 py-4 shadow-sm flex items-center justify-center"
                        style={{ minWidth: 160 }}
                      >
                        <Image
                          src={p.logo}
                          alt={p.title}
                          width={160}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* title + view link (title sits below the image card, link on the right) */}
                <div className="px-4 py-5 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {p.title}
                  </h4>

                  <Link
                    href={`/projects/${p.id}`}
                    className="text-xs text-[#EF1111] underline whitespace-nowrap"
                    aria-label={`View ${p.title} project`}
                  >
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
