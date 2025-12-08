"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import BrandsSection from "./components/BrandsSection";
import InsightsSection from "./components/InsightsSection";

export default function Home() {
  const [isSticky, setIsSticky] = useState(false);
  const landingRef = useRef(null);

  // Testimonials horizontal scroller ref  controls
  const testimonialsRef = useRef<HTMLDivElement | null>(null);
  const scrollTestimonials = useCallback((dir: "left" | "right") => {
    const el = testimonialsRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8) || 800;
    el.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }, []);

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
      {/* Landing Section */}
      <section
        ref={landingRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <Image
          src="/images/landinghero.jpg"
          alt="Landing Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            A Digital experience and
          </h1>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-300">
            Integrated Marketing Agency
          </h1>

          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block bg-[#EF1111] text-white px-8 py-3 rounded-full text-sm font-semibold"
            >
              Send Us a Brief
            </Link>
          </div>
        </div>
      </section>

      {/* Nav sticky */}
      <Nav isSticky={isSticky} />

      {/* WHO WE ARE */}
      <section className="min-h-screen flex items-center bg-black text-white py-4">
        <div className="container mx-auto px-6">
          <p className="text-sm text-white/80 mb-6">Who We Are</p>

          <h2
            className="font-semibold mb-10 
              text-[46px] 
              leading-[1.1] tracking-tight"
          >
            DXI Marketing is a leading agency crafting impactful digital
            experiences and insights. With over a decade of expertise, we blend
            creativity and strategy to engage audiences.{" "}
            <span className="inline-block bg-[#FF8A33] text-black rounded-sm px-3 py-1 ml-2">
              {" "}
              Our goal{" "}
            </span>{" "}
            is to help brands grow, connect, and thrive in the modern
            marketplace.
          </h2>

          <Link
            href="/contact"
            className="inline-block bg-[#EF1111] text-white px-6 py-3 rounded-full text-base font-medium shadow-md"
          >
            Work with Us
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="relative bg-white py-24 overflow-hidden">
        {/* pink blurred circles */}
        {/* Large Pink Circle 1 */}
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

        {/* Medium Pink Circle 2 */}
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

        {/* Small Pink Circle 3 */}
        <motion.div
          className="absolute left-1/4 top-[-100px] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, #FFB6C1 0%, transparent 70%)",
            opacity: 0.28, // Increased from 0.18
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
            opacity: 0.2, // Increased from 0.1
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
              Services We Render
            </p>
            <h3 className="text-4xl md:text-5xl font-bold text-black mb-10">
              Our Expertise
            </h3>
          </div>

          {/* Services Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1 - Digital Marketing */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M43.535 8.49042L24.1311 17.8048C22.6377 18.5216 21.0421 18.7012 19.4155 18.3368C18.351 18.0983 17.8187 17.9791 17.39 17.9302C12.0675 17.3223 8.75 21.5349 8.75 26.379V29.0375C8.75 33.8817 12.0675 38.0942 17.39 37.4864C17.8187 37.4374 18.351 37.3181 19.4155 37.0798C21.0421 36.7152 22.6377 36.8949 24.1311 37.6118L43.535 46.9262C47.9891 49.0644 50.2162 50.1333 52.6995 49.3C55.1825 48.4668 56.0347 46.6785 57.7395 43.1024C62.4202 33.2826 62.4202 22.1341 57.7395 12.314C56.0347 8.73784 55.1825 6.94978 52.6995 6.11646C50.2162 5.28317 47.9891 6.35224 43.535 8.49042Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M33.4195 60.5819L29.0697 64.1667C19.265 56.3906 20.4628 52.6824 20.4628 37.9167H23.7698C25.1119 46.261 28.2774 50.2134 32.6454 53.0747C35.336 54.8369 35.8908 58.5449 33.4195 60.5819Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.875 36.4583V18.9583" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Digital Marketing
              </h4>

              {/* Description */}
              <p className="text-black text-base leading-relaxed">
                Strategic planning and execution of multi-channel digital campaigns that enhance online presence and engagement, including web and mobile development, UX/UI design, and interactive digital experiences.
              </p>
            </div>

            {/* Card 2 - Brand Management */}
            <div className="bg-black text-white rounded-xl shadow-lg p-6 border border-gray-800 transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M58.3334 64.1667V49.5834C58.3334 44.0837 58.3334 41.3339 56.6248 39.6253C54.9162 37.9167 52.1664 37.9167 46.6667 37.9167L35 64.1667L23.3334 37.9167C17.8336 37.9167 15.0838 37.9167 13.3752 39.6253C11.6667 41.3339 11.6667 44.0837 11.6667 49.5834V64.1667" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M35 43.7501L33.5416 55.4167L35 59.7917L36.4583 55.4167L35 43.7501ZM35 43.7501L32.0833 37.9167H37.9166L35 43.7501Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M45.2084 18.9583V16.0416C45.2084 10.4037 40.6379 5.83325 35 5.83325C29.3621 5.83325 24.7917 10.4037 24.7917 16.0416V18.9583C24.7917 24.5962 29.3621 29.1665 35 29.1665C40.6379 29.1665 45.2084 24.5962 45.2084 18.9583Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-white mb-4">
                Brand Management
              </h4>

              {/* Description */}
              <p className="text-white text-base leading-relaxed">
                Defining, protecting, and evolving the brand's identity, values, and reputation through clear positioning, visual identity guidelines, and organizational alignment that sustain long-term brand equity.
              </p>
            </div>

            {/* Card 3 - Brand Strategy */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z" stroke="#EF1111" strokeWidth="3"/>
                  <path d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667" stroke="#EF1111" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Brand Strategy
              </h4>

              {/* Description */}
              <p className="text-black text-base leading-relaxed">
                Developing a strategic communications blueprint that outlines what the brand says, to whom, and why—ensuring all content, media, and activations remain aligned with business goals.
              </p>
            </div>

            {/* Card 4 - Public Relations */}
            <div className="bg-black text-white rounded-xl shadow-lg p-6 border border-gray-800 transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <rect x="8.75" y="17.5" width="52.5" height="35" rx="4" stroke="#EF1111" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M26.25 8.75L35 17.5L46.6667 5.83325" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-white mb-4">
                Public Relations
              </h4>

              {/* Description */}
              <p className="text-white text-base leading-relaxed">
                Building strong bonds with media, influencers, and the public to manage reputation, secure coverage, and execute media pitching, thought leadership, stakeholder relations, and crisis communication.
              </p>
            </div>

            {/* Card 5 - Brand Activation */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M8.75 43.7499C8.75 35.5573 8.75 31.4608 10.7162 28.5183C11.5674 27.2444 12.6611 26.1506 13.935 25.2994C16.8776 23.3333 20.974 23.3333 29.1667 23.3333H40.8333C49.026 23.3333 53.1224 23.3333 56.065 25.2994C57.3388 26.1506 58.4325 27.2444 59.2839 28.5183C61.25 31.4608 61.25 35.5573 61.25 43.7499C61.25 51.9425 61.25 56.039 59.2839 58.9816C58.4325 60.2553 57.3388 61.3491 56.065 62.2005C53.1224 64.1666 49.026 64.1666 40.8333 64.1666H29.1667C20.974 64.1666 16.8776 64.1666 13.935 62.2005C12.6611 61.3491 11.5674 60.2553 10.7162 58.9816C8.75 56.039 8.75 51.9425 8.75 43.7499Z" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M36.4583 48.1251C36.4583 50.5412 34.4995 52.5001 32.0833 52.5001C29.6671 52.5001 27.7083 50.5412 27.7083 48.1251C27.7083 45.7089 29.6671 43.7501 32.0833 43.7501C34.4995 43.7501 36.4583 45.7089 36.4583 48.1251ZM36.4583 48.1251V33.5417C36.4583 33.5417 37.625 38.5972 42.2916 39.3751" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M55.4166 23.3333C55.3644 19.7172 55.0958 17.6671 53.7197 16.2918C52.0103 14.5833 49.259 14.5833 43.7564 14.5833H26.2437C20.7409 14.5833 17.9896 14.5833 16.2801 16.2918C14.904 17.6671 14.6356 19.7172 14.5833 23.3333" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M49.5834 14.5833C49.5834 11.8653 49.5834 10.5063 49.1394 9.43426C48.5474 8.00494 47.4116 6.86934 45.9824 6.27729C44.9103 5.83325 43.5514 5.83325 40.8334 5.83325H29.1667C26.4487 5.83325 25.0897 5.83325 24.0177 6.27729C22.5884 6.86934 21.4528 8.00494 20.8607 9.43426C20.4167 10.5063 20.4167 11.8653 20.4167 14.5833" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Brand Activation
              </h4>

              {/* Description */}
              <p className="text-black text-base leading-relaxed">
                Designing and executing impactful real-world or virtual experiences that drive trial, engagement, and emotional connection—seamlessly linking live activations with supporting digital touchpoints.
              </p>
            </div>

            {/* Card 6 - Photo & Video Production */}
            <div className="bg-black text-white rounded-xl shadow-lg p-6 border border-gray-800 transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M55.4166 28.0603C55.4166 35.583 51.713 41.3734 46.0783 45.184C44.7658 46.0716 44.1096 46.5155 43.7855 47.0201C43.4618 47.5247 43.3513 48.1873 43.1305 49.5124L42.9587 50.5423C42.5708 52.8703 42.3768 54.0341 41.5607 54.7253C40.7449 55.4166 39.5648 55.4166 37.2047 55.4166H29.5878C27.2279 55.4166 26.0478 55.4166 25.2319 54.7253C24.416 54.0341 24.222 52.8703 23.834 50.5423L23.6623 49.5124C23.4422 48.1917 23.3322 47.5314 23.0115 47.0291C22.6909 46.5269 22.0333 46.0774 20.718 45.1782C15.143 41.3676 11.6666 35.5792 11.6666 28.0603C11.6666 15.7846 21.4604 5.83325 33.5416 5.83325C35.0399 5.83325 36.5029 5.98632 37.9166 6.27787" stroke="#EF1111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M48.125 5.83325L48.8772 7.86626C49.8636 10.5321 50.3568 11.865 51.3292 12.8373C52.3016 13.8097 53.6345 14.3029 56.3004 15.2893L58.3333 16.0416L56.3004 16.7939C53.6345 17.7803 52.3016 18.2735 51.3292 19.2459C50.3568 20.2182 49.8636 21.5511 48.8772 24.2169L48.125 26.2499L47.3727 24.2169C46.3863 21.5511 45.8931 20.2182 44.9207 19.2459C43.9483 18.2735 42.6154 17.7803 39.9495 16.7939L37.9166 16.0416L39.9495 15.2893C42.6154 14.3029 43.9483 13.8097 44.9207 12.8373C45.8931 11.865 46.3863 10.5321 47.3727 7.86626L48.125 5.83325Z" stroke="#EF1111" strokeWidth="3" strokeLinejoin="round"/>
                  <path d="M39.375 55.4167V58.3334C39.375 61.0832 39.375 62.4582 38.5207 63.3125C37.6665 64.1667 36.2915 64.1667 33.5417 64.1667C30.7919 64.1667 29.417 64.1667 28.5626 63.3125C27.7084 62.4582 27.7084 61.0832 27.7084 58.3334V55.4167" stroke="#EF1111" strokeWidth="3" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-white mb-4">
                Photo & Video Production
              </h4>

              {/* Description */}
              <p className="text-white text-base leading-relaxed">
                Providing full-service photo and video coverage for activations, producing quality content for campaigns, and developing engaging content for digital and social media channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands We Represent */}
      <BrandsSection />

      {/* Testimonials */}
      <section className="relative h-[520px] overflow-hidden">
        {/* background image dark overlay */}
        <Image
          src="/images/landinghero.jpg"
          alt="Testimonials Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 container mx-auto px-6 h-full">
          <div className="flex items-start justify-between pt-8">
            <p className="text-lg text-white/90">Testimonials</p>
            <div className="flex gap-3 items-center">
              <button
                aria-label="Prev testimonial"
                onClick={() => scrollTestimonials("left")}
                className="w-12 h-12 rounded-full border-2 border-white/25 flex items-center justify-center bg-white/6 hover:bg-white/10 transition"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFD6D6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                aria-label="Next testimonial"
                onClick={() => scrollTestimonials("right")}
                className="w-12 h-12 rounded-full border-2 border-white/25 flex items-center justify-center bg-transparent hover:bg-white/5 transition"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFD6D6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          {/* horizontal scroller - HIDDEN SCROLLBAR */}
          <div
            ref={testimonialsRef}
            className="mt-10 h-[380px] flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Card */}
            <article className="snap-start min-w-[660px] max-w-[900px] bg-white rounded-3xl p-12 shadow-2xl">
              <p className="text-lg text-gray-900 leading-relaxed mb-8">
                Dano Milk is a leading dairy brand providing nutritious products
                to families across Nigeria. DXI created a digital campaign that
                elevated their online presence through storytelling, influencer
                partnerships, and consumer engagement, increasing interaction by
                70%.
              </p>

              <div className="flex items-center gap-3 mt-8">
                {/* Smaller red badge svg */}
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 82 82"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M37.856 25.2091C33.1151 1.37952 48.879 1.37952 44.1382 25.2091C48.879 1.37952 63.4435 7.41099 49.9446 27.6137C63.4435 7.41099 74.589 18.5565 54.3863 32.0554C74.589 18.5565 80.6205 33.121 56.7909 37.859C80.6205 33.1181 80.6205 48.882 56.7909 44.1412C80.6205 48.882 74.5862 63.4436 54.3863 49.9447C74.5862 63.4436 63.4406 74.5891 49.9446 54.3864C63.4435 74.5863 48.879 80.6178 44.141 56.791C48.8819 80.6206 33.118 80.6206 37.8588 56.791C33.118 80.6206 18.5564 74.5863 32.0553 54.3864C18.5564 74.5863 7.41086 63.4407 27.6136 49.9447C7.41371 63.4436 1.38223 48.8792 25.209 44.1412C1.37939 48.882 1.37939 33.1181 25.209 37.859C1.37939 33.1181 7.41371 18.5565 27.6136 32.0554C7.41371 18.5565 18.5593 7.41099 32.0553 27.6137C18.5564 7.41384 33.1208 1.38236 37.8588 25.2091H37.856Z"
                      fill="#EF1111"
                    />
                  </svg>
                </div>

                {/* Text centered vertically */}
                <h4 className="text-base font-semibold text-gray-900">
                  Social Media Growth Campaign
                </h4>
              </div>
            </article>

            {/* Card 2 */}
            <article className="snap-start min-w-[660px] max-w-[900px] bg-white rounded-3xl p-12 shadow-2xl">
              <p className="text-lg text-gray-900 leading-relaxed mb-8">
                Dano Milk is a leading dairy brand providing nutritious products
                to families across Nigeria. DXI created a digital campaign that
                elevated their online presence through storytelling, influencer
                partnerships, and consumer engagement, increasing interaction by
                70%.
              </p>

              <div className="flex items-center gap-3 mt-8">
                {/* Smaller red badge svg */}
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 82 82"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M37.856 25.2091C33.1151 1.37952 48.879 1.37952 44.1382 25.2091C48.879 1.37952 63.4435 7.41099 49.9446 27.6137C63.4435 7.41099 74.589 18.5565 54.3863 32.0554C74.589 18.5565 80.6205 33.121 56.7909 37.859C80.6205 33.1181 80.6205 48.882 56.7909 44.1412C80.6205 48.882 74.5862 63.4436 54.3863 49.9447C74.5862 63.4436 63.4406 74.5891 49.9446 54.3864C63.4435 74.5863 48.879 80.6178 44.141 56.791C48.8819 80.6206 33.118 80.6206 37.8588 56.791C33.118 80.6206 18.5564 74.5863 32.0553 54.3864C18.5564 74.5863 7.41086 63.4407 27.6136 49.9447C7.41371 63.4436 1.38223 48.8792 25.209 44.1412C1.37939 48.882 1.37939 33.1181 25.209 37.859C1.37939 33.1181 7.41371 18.5565 27.6136 32.0554C7.41371 18.5565 18.5593 7.41099 32.0553 27.6137C18.5564 7.41384 33.1208 1.38236 37.8588 25.2091H37.856Z"
                      fill="#EF1111"
                    />
                  </svg>
                </div>

                {/* Text centered vertically */}
                <h4 className="text-base font-semibold text-gray-900">
                  Social Media Growth Campaign
                </h4>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Our Insights */}
      <InsightsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
