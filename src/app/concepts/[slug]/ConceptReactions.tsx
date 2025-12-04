"use client";

import { useState, useEffect } from "react";

type ReactionType = "like" | "neutral" | "dislike" | null;

interface ConceptReactionsProps {
  conceptId: string;
}

export default function ConceptReactions({ conceptId }: ConceptReactionsProps) {
  const [mounted, setMounted] = useState(false);
  const [reactions, setReactions] = useState({
    like: 0,
    neutral: 0,
    dislike: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType>(null);

  useEffect(() => {
    // Only access localStorage after component has mounted on client
    setMounted(true);
    
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      // Load reactions from localStorage or API
      const storedReaction = localStorage.getItem(`concept_reaction_${conceptId}`);
      if (storedReaction) {
        setUserReaction(storedReaction as ReactionType);
      }

      // Load reaction counts (in a real app, this would come from an API)
      const storedCounts = localStorage.getItem(`concept_counts_${conceptId}`);
      if (storedCounts) {
        try {
          setReactions(JSON.parse(storedCounts));
        } catch (e) {
          console.error('Error parsing reaction counts:', e);
        }
      }
    }
  }, [conceptId]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        {/* Like - Smiling face */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border-2 border-transparent">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
              <circle cx="15" cy="10" r="1.5" fill="currentColor" />
              <path
                d="M8 14c1 1 3 1 4 0s3 1 4 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-white text-sm font-medium">0</span>
        </div>

        {/* Neutral - Straight face */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border-2 border-transparent">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
              <circle cx="15" cy="10" r="1.5" fill="currentColor" />
              <path
                d="M8 14h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-white text-sm font-medium">0</span>
        </div>

        {/* Dislike - Frowning face */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border-2 border-transparent">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
              <circle cx="15" cy="10" r="1.5" fill="currentColor" />
              <path
                d="M8 16c1-1 3-1 4 0s3 1 4 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-white text-sm font-medium">0</span>
        </div>
      </div>
    );
  }

  const handleReaction = (type: ReactionType) => {
    if (type === null || typeof window === 'undefined') return;

    // If user already reacted with this type, remove it
    if (userReaction === type) {
      setUserReaction(null);
      setReactions((prev) => {
        const newReactions = {
          ...prev,
          [type]: Math.max(0, prev[type] - 1),
        };
        localStorage.setItem(`concept_counts_${conceptId}`, JSON.stringify(newReactions));
        return newReactions;
      });
      localStorage.removeItem(`concept_reaction_${conceptId}`);
    } else {
      // Remove previous reaction count
      const newReactions = {
        ...reactions,
        [type]: reactions[type] + 1,
      };
      if (userReaction) {
        newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1);
      }

      // Add new reaction
      setUserReaction(type);
      setReactions(newReactions);
      localStorage.setItem(`concept_reaction_${conceptId}`, type);
      localStorage.setItem(`concept_counts_${conceptId}`, JSON.stringify(newReactions));
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Like - Smiling face */}
      <button
        onClick={() => handleReaction("like")}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
          userReaction === "like"
            ? "bg-[#EF1111]/20 border-2 border-[#EF1111]"
            : "bg-white/10 hover:bg-white/20 border-2 border-transparent"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <path
              d="M8 14c1 1 3 1 4 0s3 1 4 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-white text-sm font-medium">{reactions.like}</span>
      </button>

      {/* Neutral - Straight face */}
      <button
        onClick={() => handleReaction("neutral")}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
          userReaction === "neutral"
            ? "bg-[#EF1111]/20 border-2 border-[#EF1111]"
            : "bg-white/10 hover:bg-white/20 border-2 border-transparent"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <path
              d="M8 14h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-white text-sm font-medium">
          {reactions.neutral}
        </span>
      </button>

      {/* Dislike - Frowning face */}
      <button
        onClick={() => handleReaction("dislike")}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
          userReaction === "dislike"
            ? "bg-[#EF1111]/20 border-2 border-[#EF1111]"
            : "bg-white/10 hover:bg-white/20 border-2 border-transparent"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <path
              d="M8 16c1-1 3-1 4 0s3 1 4 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-white text-sm font-medium">
          {reactions.dislike}
        </span>
      </button>
    </div>
  );
}

