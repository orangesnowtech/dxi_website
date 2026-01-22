"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import Nav from "./Nav";

interface LandingSectionProps {
  isSticky: boolean;
  setIsSticky: (value: boolean) => void;
  heroImage?: any;
  heading1?: string;
  heading2?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function LandingSection({
  isSticky,
  setIsSticky,
  heroImage,
  heading1 = "A Digital experience and",
  heading2 = "Integrated Marketing Agency",
  buttonText = "Send Us a Brief",
  buttonLink = "/contact-us",
}: LandingSectionProps) {
  const landingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (landingRef.current) observer.observe(landingRef.current);

    return () => observer.disconnect();
  }, [setIsSticky]);

  const imageUrl = heroImage
    ? urlFor(heroImage).width(1920).height(1080).url()
    : "/images/landinghero.jpg";

  return (
    <>
      {/* Landing Section */}
      <section
        ref={landingRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <Image
          src={imageUrl}
          alt="Landing Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {heading1}
          </h1>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-300">
            {heading2}
          </h1>

          <div className="mt-10">
            <Link
              href={buttonLink}
              className="inline-block bg-[#EF1111] text-white px-8 py-3 rounded-full text-sm font-semibold border border-transparent transition-colors hover:bg-white hover:text-[#EF1111] hover:border-[#EF1111]"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* Nav sticky */}
      <Nav isSticky={isSticky} />
    </>
  );
}

