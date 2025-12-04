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
    neutral: 0,
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
              setReactions(data.reactionCounts);
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

      {/* Neutral - View Only */}
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_neutral_view)">
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
            <clipPath id="clip0_neutral_view">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-white text-sm font-medium">
          {reactions.neutral}
        </span>
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
    </div>
  );
}

