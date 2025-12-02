"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function Concepts() {
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

  return (
    <main className="min-h-screen font-sans">
      {/* Nav sticky */}
      <Nav isSticky={isSticky} />

      {/* Hero */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          Concepts
        </h1>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
