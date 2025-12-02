"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavProps = {
  isSticky?: boolean;
};

export default function Nav({ isSticky }: NavProps) {
  const pathname = usePathname() || "/";

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
        <div className="grid grid-cols-3 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-16 h-16 mr-3">
              <Image
                src="/images/dxilogo.png"
                alt="DXI Marketing Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Center Links */}
          <ul className="flex justify-center space-x-10 items-center">
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

          {/* Button */}
          <div className="flex justify-end">
            <Link
              href="/contact"
              className="hidden md:block bg-[#EF1111] text-white px-6 py-2 rounded-full text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
