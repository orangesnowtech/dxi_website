"use client";

import { useState } from "react";
import ConceptCard from "./ConceptCard";

interface Tag {
  _id: string;
  title: string;
  slug: string;
}

interface Concept {
  _id: string;
  title: string;
  image?: any;
  team?: string;
  reactionCounts?: any;
  slug: string;
  tags?: Tag[];
}

interface ConceptsContentProps {
  concepts: Concept[];
  tags: Tag[];
}

export default function ConceptsContent({ concepts, tags }: ConceptsContentProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Filter concepts based on selected tags
  const filteredConcepts =
    selectedTags.length === 0
      ? concepts
      : concepts.filter((concept) =>
          concept.tags?.some((tag) => selectedTags.includes(tag._id))
        );

  return (
    <>
      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag._id);
            return (
              <button
                key={tag._id}
                onClick={() => toggleTag(tag._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {tag.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Concepts Grid */}
      {filteredConcepts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcepts.map((concept) => (
            <ConceptCard key={concept._id} concept={concept} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 py-12">
          <p>
            {selectedTags.length > 0
              ? "No concepts found with the selected tags."
              : "No concepts available yet."}
          </p>
        </div>
      )}
    </>
  );
}

