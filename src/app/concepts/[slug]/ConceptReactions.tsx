"use client";

import { useConceptReactions } from "./useConceptReactions";

interface ConceptReactionsProps {
  conceptId: string;
  initialCounts?: {
    like: number;
    neutral: number;
    dislike: number;
  };
}

export default function ConceptReactions({
  conceptId,
  initialCounts,
}: ConceptReactionsProps) {
  const { mounted, reactions, userReaction, handleReaction } =
    useConceptReactions({ conceptId, initialCounts });

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

      {/* Neutral - Straight face */}
      <button
        onClick={() => handleReaction("neutral")}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
          userReaction === "neutral"
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
          <g clipPath="url(#clip0_neutral_hero)">
            <path
              d="M50 87.5C70.7107 87.5 87.5 70.7107 87.5 50C87.5 29.2893 70.7107 12.5 50 12.5C29.2893 12.5 12.5 29.2893 12.5 50C12.5 70.7107 29.2893 87.5 50 87.5Z"
              stroke={userReaction === "neutral" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M37.5 41.667H37.5417"
              stroke={userReaction === "neutral" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M62.5 41.667H62.5417"
              stroke={userReaction === "neutral" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M39.583 66.6668C47.0466 61.9941 55.7986 59.8061 64.583 60.4168"
              stroke={userReaction === "neutral" ? "#EF1111" : "#F9FAFB"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_neutral_hero">
              <rect width="100" height="100" fill="white" />
            </clipPath>
          </defs>
        </svg>
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
    </div>
  );
}

