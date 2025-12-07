"use client";

import { useState, useRef } from "react";
import { useConceptReactions } from "./useConceptReactions";
import SharePopup from "./SharePopup";

interface ConceptReactionsProps {
  conceptId: string;
  initialCounts?: {
    like: number;
    share: number;
    dislike: number;
  };
  conceptTitle?: string;
  conceptSlug?: string;
}

export default function ConceptReactions({
  conceptId,
  initialCounts,
  conceptTitle = "",
  conceptSlug = "",
}: ConceptReactionsProps) {
  const { mounted, reactions, userReaction, handleReaction } =
    useConceptReactions({ conceptId, initialCounts });
  const [showSharePopup, setShowSharePopup] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleShareClick = () => {
    setShowSharePopup(true);
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    
    // Check if user has already shared this concept
    const hasShared = localStorage.getItem(`concept_shared_${conceptId}`);
    
    if (!hasShared) {
      // First time sharing - increment count
      try {
        await fetch(`/api/concepts/${conceptId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reaction: "share",
            action: "add",
            previousReaction: null,
          }),
        });
        
        // Mark as shared in localStorage
        localStorage.setItem(`concept_shared_${conceptId}`, "true");
        
        // Refresh reactions
        const response = await fetch(`/api/concepts/${conceptId}/reactions`);
        if (response.ok) {
          const data = await response.json();
          if (data.reactionCounts) {
            window.dispatchEvent(
              new CustomEvent(`concept_reaction_update_${conceptId}`, {
                detail: { reactionCounts: data.reactionCounts },
              })
            );
          }
        }
      } catch (error) {
        console.error("Error updating share count:", error);
      }
    }
    // If user has already shared, just copy the link without incrementing
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border-2 border-transparent">
          <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
          <span className="text-white text-sm font-medium">0</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border-2 border-transparent">
          <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
          <span className="text-white text-sm font-medium">0</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border-2 border-transparent">
          <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
          <span className="text-white text-sm font-medium">0</span>
        </div>
      </div>
    );
  }

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
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_like_hero)">
            <path
              d="M50.001 87.5C70.7117 87.5 87.501 70.7107 87.501 50C87.501 29.2893 70.7117 12.5 50.001 12.5C29.2903 12.5 12.501 29.2893 12.501 50C12.501 70.7107 29.2903 87.5 50.001 87.5Z"
              stroke={userReaction === "like" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M37.5 41.667H37.5417"
              stroke={userReaction === "like" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M62.499 41.667H62.5407"
              stroke={userReaction === "like" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M39.583 62.5C40.9408 63.8858 42.5615 64.9868 44.3502 65.7384C46.1389 66.49 48.0595 66.8771 49.9997 66.8771C51.9398 66.8771 53.8605 66.49 55.6491 65.7384C57.4378 64.9868 59.0585 63.8858 60.4163 62.5"
              stroke={userReaction === "like" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_like_hero">
              <rect width="100" height="100" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-white text-sm font-medium">{reactions.like}</span>
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
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_dislike_hero)">
            <path
              d="M50 87.5C70.7107 87.5 87.5 70.7107 87.5 50C87.5 29.2893 70.7107 12.5 50 12.5C29.2893 12.5 12.5 29.2893 12.5 50C12.5 70.7107 29.2893 87.5 50 87.5Z"
              stroke={userReaction === "dislike" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M37.5 41.667H37.5417"
              stroke={userReaction === "dislike" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M62.5 41.667H62.5417"
              stroke={userReaction === "dislike" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M39.583 63.5412C40.9408 62.1554 42.5615 61.0544 44.3502 60.3028C46.1389 59.5512 48.0595 59.1641 49.9997 59.1641C51.9398 59.1641 53.8605 59.5512 55.6491 60.3028C57.4378 61.0544 59.0585 62.1554 60.4163 63.5412"
              stroke={userReaction === "dislike" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_dislike_hero">
              <rect width="100" height="100" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-white text-sm font-medium">
          {reactions.dislike}
        </span>
      </button>

      {/* Share */}
      <div className="relative">
        <button
          ref={shareButtonRef}
          onClick={handleShareClick}
          className="flex items-center gap-2 px-3 py-2 rounded-full transition bg-white/10 hover:bg-white/20 border-2 border-transparent"
        >
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M39.1495 18.75H34.8092C22.5331 18.75 16.395 18.75 12.5813 22.4112C8.76758 26.0723 8.76758 31.9649 8.76758 43.75V60.4167C8.76758 72.2017 8.76758 78.0942 12.5813 81.7554C16.395 85.4167 22.5331 85.4167 34.8092 85.4167H52.3369C64.6131 85.4167 70.751 85.4167 74.5648 81.7554C77.0356 79.3833 77.9056 76.0746 78.2119 70.8333"
            stroke="#F9FAFB"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M67.3613 29.1663V16.0561C67.3613 15.2425 68.0483 14.583 68.8958 14.583C69.3025 14.583 69.6929 14.7382 69.9808 15.0145L89.6979 33.9432C90.6808 34.8864 91.2325 36.1658 91.2325 37.4997C91.2325 38.8336 90.6808 40.1129 89.6979 41.0561L69.9808 59.9847C69.6929 60.2613 69.3025 60.4163 68.8958 60.4163C68.0483 60.4163 67.3613 59.7568 67.3613 58.943V45.833H54.6487C36.9792 45.833 30.4688 60.4163 30.4688 60.4163V49.9997C30.4688 38.4938 40.1848 29.1663 52.17 29.1663H67.3613Z"
            stroke="#F9FAFB"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white text-sm font-medium">
          {reactions.share}
        </span>
      </button>

      {/* Share Popup */}
      {showSharePopup && (
        <SharePopup
          url={typeof window !== "undefined" ? window.location.href : ""}
          onClose={() => setShowSharePopup(false)}
          onCopy={handleCopyLink}
          buttonRef={shareButtonRef}
        />
      )}
      </div>
    </div>
  );
}

