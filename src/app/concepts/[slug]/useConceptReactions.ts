"use client";

import { useState, useEffect } from "react";

type ReactionType = "like" | "neutral" | "dislike" | null;

interface UseConceptReactionsOptions {
  conceptId: string;
  initialCounts?: {
    like: number;
    neutral: number;
    dislike: number;
  };
}

export function useConceptReactions({
  conceptId,
  initialCounts,
}: UseConceptReactionsOptions) {
  const [mounted, setMounted] = useState(false);
  const [reactions, setReactions] = useState({
    like: initialCounts?.like || 0,
    neutral: initialCounts?.neutral || 0,
    dislike: initialCounts?.dislike || 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Load user's reaction from localStorage (client-side only)
      const storedReaction = localStorage.getItem(`concept_reaction_${conceptId}`);
      if (storedReaction) {
        setUserReaction(storedReaction as ReactionType);
      }

      // Fetch latest reaction counts from API (server is source of truth)
      const fetchReactions = async () => {
        try {
          const response = await fetch(`/api/concepts/${conceptId}/reactions`);
          if (response.ok) {
            const data = await response.json();
            if (data.reactionCounts) {
              setReactions(data.reactionCounts);
            }
          } else {
            // Fallback to initial counts if API fails
            if (initialCounts) {
              setReactions(initialCounts);
            }
          }
        } catch (error) {
          console.error("Error fetching reactions:", error);
          // Fallback to initial counts if API fails
          if (initialCounts) {
            setReactions(initialCounts);
          }
        }
      };

      // Always fetch from server first (source of truth)
      fetchReactions();

      // Listen for custom events to sync updates across components
      const handleReactionUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        // Update user reaction from event detail or localStorage
        if (customEvent.detail?.userReaction !== undefined) {
          setUserReaction(customEvent.detail.userReaction);
        } else {
          // Fallback to reading from localStorage
          const storedReaction = localStorage.getItem(`concept_reaction_${conceptId}`);
          if (storedReaction) {
            setUserReaction(storedReaction as ReactionType);
          } else {
            setUserReaction(null);
          }
        }
        
        // Update counts from event detail or fetch from server
        if (customEvent.detail?.reactionCounts) {
          setReactions(customEvent.detail.reactionCounts);
        } else {
          // Fetch latest counts from server
          fetchReactions();
        }
      };

      // Also listen for storage events (for cross-tab sync)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === `concept_reaction_${conceptId}`) {
          const storedReaction = e.newValue as ReactionType | null;
          setUserReaction(storedReaction);
          fetchReactions();
        }
      };

      window.addEventListener(`concept_reaction_update_${conceptId}`, handleReactionUpdate);
      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener(`concept_reaction_update_${conceptId}`, handleReactionUpdate);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [conceptId, initialCounts]);

  const handleReaction = async (type: ReactionType) => {
    if (type === null || typeof window === "undefined" || isUpdating) return;

    // Prevent rapid clicking
    setIsUpdating(true);

    try {
      // Always read from localStorage directly (source of truth for user's reaction)
      // This ensures both header and footer components use the same value
      const currentUserReaction = localStorage.getItem(`concept_reaction_${conceptId}`) as ReactionType;

      // Determine action:
      // - If clicking the same reaction they already have → remove it
      // - If clicking a different reaction → switch (remove old, add new)
      // - If they have no reaction → add it
      const isRemoving = currentUserReaction === type;
      
      // Update via API (server-side)
      const response = await fetch(`/api/concepts/${conceptId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reaction: type,
          action: isRemoving ? "remove" : "add",
          previousReaction: currentUserReaction || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update reaction");
      }

      const data = await response.json();
      
      if (!data.reactionCounts) {
        throw new Error("Invalid response from server");
      }
      
      // Update local state with server response (always use server data as source of truth)
      setReactions(data.reactionCounts);
      
      // Update user's reaction in localStorage and state
      if (isRemoving) {
        // User removed their reaction
        localStorage.removeItem(`concept_reaction_${conceptId}`);
        setUserReaction(null);
      } else {
        // User added/switched to a reaction
        localStorage.setItem(`concept_reaction_${conceptId}`, type);
        setUserReaction(type);
      }

      // Dispatch custom event to sync other components in same window
      // Use setTimeout to ensure localStorage update is complete
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(`concept_reaction_update_${conceptId}`, {
            detail: { userReaction: isRemoving ? null : type, reactionCounts: data.reactionCounts }
          })
        );
      }, 0);
    } catch (error) {
      console.error("Error updating reaction:", error);
      // Optionally show error to user
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    mounted,
    reactions,
    userReaction,
    handleReaction,
    isUpdating,
  };
}

