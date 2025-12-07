"use client";

import { useState, useEffect } from "react";

interface ConceptCardHoverReactionsProps {
  conceptId: string;
  conceptSlug: string;
}

export default function ConceptCardHoverReactions({
  conceptId,
  conceptSlug,
}: ConceptCardHoverReactionsProps) {
  const [mounted, setMounted] = useState(false);
  const [reactions, setReactions] = useState({
    like: 0,
    share: 0,
    dislike: 0,
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Fetch reaction counts from API
      const fetchReactions = async () => {
        try {
          const response = await fetch(`/api/concepts/${conceptId}/reactions`);
          if (response.ok) {
            const data = await response.json();
            if (data.reactionCounts) {
              // Ensure all three counts are present, defaulting to 0 if missing
              setReactions({
                like: data.reactionCounts.like ?? 0,
                share: data.reactionCounts.share ?? 0,
                dislike: data.reactionCounts.dislike ?? 0,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching reactions:", error);
        }
      };

      fetchReactions();

      // Listen for custom events to sync updates across components
      const handleReactionUpdate = () => {
        fetchReactions();
      };

      window.addEventListener(`concept_reaction_update_${conceptId}`, handleReactionUpdate);

      return () => {
        window.removeEventListener(`concept_reaction_update_${conceptId}`, handleReactionUpdate);
      };
    }
  }, [conceptId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_693_13356)">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 10H9.01"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 10H15.01"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 15C9.82588 15.3326 10.2148 15.5968 10.6441 15.7772C11.0734 15.9576 11.5344 16.0505 12 16.0505C12.4656 16.0505 12.9266 15.9576 13.3559 15.7772C13.7852 15.5968 14.1741 15.3326 14.5 15"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_693_13356">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-white text-sm font-medium">0</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_693_13359)">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 10H9.01"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 10H15.01"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 16C11.2913 14.8786 13.3917 14.3535 15.5 14.5"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_693_13359">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-white text-sm font-medium">0</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_693_13362)">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 10H9.01"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 10H15.01"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 15.25C9.82588 14.9174 10.2148 14.6531 10.6441 14.4728C11.0734 14.2924 11.5344 14.1995 12 14.1995C12.4656 14.1995 12.9266 14.2924 13.3559 14.4728C13.7852 14.6531 14.1741 14.9174 14.5 15.25"
                stroke="#F9FAFB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_693_13362">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-white text-sm font-medium">0</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Like - View Only */}
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_like_view)">
            <path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 10H9.01"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 10H15.01"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 15C9.82588 15.3326 10.2148 15.5968 10.6441 15.7772C11.0734 15.9576 11.5344 16.0505 12 16.0505C12.4656 16.0505 12.9266 15.9576 13.3559 15.7772C13.7852 15.5968 14.1741 15.3326 14.5 15"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_like_view">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-white text-sm font-medium">{reactions.like}</span>
      </div>

      {/* Dislike - View Only */}
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_dislike_view)">
            <path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 10H9.01"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 10H15.01"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 15.25C9.82588 14.9174 10.2148 14.6531 10.6441 14.4728C11.0734 14.2924 11.5344 14.1995 12 14.1995C12.4656 14.1995 12.9266 14.2924 13.3559 14.4728C13.7852 14.6531 14.1741 14.9174 14.5 15.25"
              stroke="#F9FAFB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_dislike_view">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-white text-sm font-medium">
          {reactions.dislike}
        </span>
      </div>

      {/* Share - View Only */}
      <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}

