"use client";

import Image from "next/image";
import { useState } from "react";
import { urlFor } from "@/lib/sanity/client";
import ConceptCardHoverReactions from "./ConceptCardHoverReactions";

interface ConceptCardProps {
  concept: {
    _id: string;
    slug: string;
    title: string;
    team?: string;
    image?: any;
  };
}

export default function ConceptCard({ concept }: ConceptCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const imageUrl = concept.image
    ? urlFor(concept.image).width(600).height(400).url()
    : "";

  const handleCardClick = () => {
    window.location.href = `/concepts/${concept.slug}`;
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleCardClick}
    >
      {/* Image with dark overlay */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {imageUrl && (
          <>
            <Image
              src={imageUrl}
              alt={concept.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              className={`absolute inset-0 transition-colors duration-300 ${
                isHovering ? "bg-black/70" : "bg-black/40"
              }`}
            />
          </>
        )}
      </div>
      {/* Title and Team at bottom - hidden on hover */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-opacity duration-300 ${
          isHovering ? "opacity-0" : "opacity-100"
        }`}
      >
        <h3 className="text-lg font-semibold mb-1">{concept.title}</h3>
        <p className="text-sm text-white/90">{concept.team}</p>
      </div>
      {/* Reactions - shown on hover (view only) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10 pointer-events-none ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <ConceptCardHoverReactions
          conceptId={concept._id}
          conceptSlug={concept.slug}
        />
      </div>
    </div>
  );
}

