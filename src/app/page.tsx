"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

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
            A Digital experiences and
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
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 transition-shadow duration-300">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white border border-gray-300">
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <path
                    d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z"
                    stroke="#EF1111"
                    strokeWidth="2"
                  />
                  <path
                    d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Digital Marketing
              </h4>

              {/* Description */}
              <p className="text-black text-lg leading-relaxed">
                We drive visibility, engagement, and
                <br />
                growth through data-led campaigns.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-black text-white rounded-xl shadow-lg p-4 border border-gray-800 transition-shadow duration-300">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-black border border-gray-700">
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <path
                    d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499"
                    stroke="#FF69B4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z"
                    stroke="#FF69B4"
                    strokeWidth="2"
                  />
                  <path
                    d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667"
                    stroke="#FF69B4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-white mb-4">
                Experiential Marketing
              </h4>

              {/* Description */}
              <p className="text-white text-lg leading-relaxed">
                We create immersive brand
                <br />
                moments that inspire connection.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 transition-shadow duration-300">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white border border-gray-300">
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <path
                    d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z"
                    stroke="#EF1111"
                    strokeWidth="2"
                  />
                  <path
                    d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Integrated Marketing
              </h4>

              {/* Description */}
              <p className="text-black text-lg leading-relaxed">
                We unify strategy and creativity for
                <br />
                consistent brand impact.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 transition-shadow duration-300">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white border border-gray-300">
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <path
                    d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z"
                    stroke="#EF1111"
                    strokeWidth="2"
                  />
                  <path
                    d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Digital Marketing
              </h4>

              {/* Description */}
              <p className="text-black text-lg leading-relaxed">
                We drive visibility, engagement, and
                <br />
                growth through data-led campaigns.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-black text-white rounded-xl shadow-lg p-4 border border-gray-800 transition-shadow duration-300">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-black border border-gray-700">
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <path
                    d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499"
                    stroke="#FF69B4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z"
                    stroke="#FF69B4"
                    strokeWidth="2"
                  />
                  <path
                    d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667"
                    stroke="#FF69B4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-white mb-4">
                Experiential Marketing
              </h4>

              {/* Description */}
              <p className="text-white text-lg leading-relaxed">
                We create immersive brand
                <br />
                moments that inspire connection.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 transition-shadow duration-300">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white border border-gray-300">
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <path
                    d="M52.5 32.0833L59.3419 25.8081C60.6139 24.6415 61.25 24.0581 61.25 23.3333M61.25 23.3333C61.25 22.6084 60.6139 22.025 59.3419 20.8584L52.5 14.5833M61.25 23.3333C8.75 23.3333 8.75 61.2499 8.75 61.2499"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0417 23.3333C20.0687 23.3333 23.3333 20.0687 23.3333 16.0417C23.3333 12.0146 20.0687 8.75 16.0417 8.75C12.0146 8.75 8.75 12.0146 8.75 16.0417C8.75 20.0687 12.0146 23.3333 16.0417 23.3333Z"
                    stroke="#EF1111"
                    strokeWidth="2"
                  />
                  <path
                    d="M37.9167 61.2501L52.5001 46.6667M52.5001 61.2501L37.9167 46.6667"
                    stroke="#EF1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-black mb-4">
                Integrated Marketing
              </h4>

              {/* Description */}
              <p className="text-black text-lg leading-relaxed">
                We unify strategy and creativity for
                <br />
                consistent brand impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands We Represent */}
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
            <div className="w-full max-w-[260px] bg-white rounded-lg shadow-md flex items-center justify-center">
              <Image
                src="/images/purch.png"
                alt="Purch"
                width={140}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div className="w-full max-w-[260px] bg-white rounded-lg p-8 shadow-md flex items-center justify-center">
              <Image
                src="/images/erisco.png"
                alt="Erisco"
                width={140}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div className="w-full max-w-[260px] bg-white rounded-lg shadow-md flex items-center justify-center">
              <Image
                src="/images/purch.png"
                alt="Purch"
                width={140}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div className="w-full max-w-[260px] bg-white rounded-lg shadow-md flex items-center justify-center">
              <Image
                src="/images/purch.png"
                alt="Purch"
                width={140}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div className="w-full max-w-[260px] bg-white rounded-lg shadow-md flex items-center justify-center">
              <Image
                src="/images/purch.png"
                alt="Purch"
                width={140}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <Footer />
    </main>
  );
}
