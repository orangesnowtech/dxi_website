"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavProps = {
  isSticky?: boolean;
};

export default function Nav({ isSticky }: NavProps) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `${
      pathname === path || (path !== "/" && pathname.startsWith(path))
        ? "text-black font-semibold"
        : "text-gray-400 hover:text-black"
    } text-sm`;

  return (
    <nav
      className={`z-50 transition-all duration-300
        ${
          isSticky
            ? "sticky top-0 bg-white/95 shadow-md backdrop-blur"
            : "relative bg-white"
        }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-14 h-14 mr-3">
              <Image
                src="/images/dxilogo.png"
                alt="DXI Marketing Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex justify-center space-x-10 items-center">
            <li>
              <Link href="/" className={linkClass("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/projects" className={linkClass("/projects")}>
                Projects
              </Link>
            </li>
            <li>
              <Link href="/concepts" className={linkClass("/concepts")}>
                Concepts
              </Link>
            </li>
          </ul>

          {/* Desktop Contact Btn */}
          <div className="hidden md:flex justify-end">
            <Link
              href="/contact"
              className="bg-[#EF1111] text-white px-6 py-2 rounded-full text-sm"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col space-y-1"
            onClick={() => setOpen(!open)}
          >
            <span
              className={`w-6 h-0.5 bg-black transition-all ${
                open ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-black transition-all ${
                open ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-black transition-all ${
                open ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white shadow-lg ${
          open ? "max-h-60 py-4" : "max-h-0 py-0"
        }`}
      >
        <div className="px-6 space-y-4">
          <Link
            href="/"
            className={`block ${linkClass("/")}`}
            onClick={() => setOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/projects"
            className={`block ${linkClass("/projects")}`}
            onClick={() => setOpen(false)}
          >
            Projects
          </Link>

          <Link
            href="/concepts"
            className={`block ${linkClass("/concepts")}`}
            onClick={() => setOpen(false)}
          >
            Concepts
          </Link>

          <Link
            href="/contact"
            className="block bg-[#EF1111] text-white px-4 py-2 rounded-full text-sm mt-3"
            onClick={() => setOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
}
