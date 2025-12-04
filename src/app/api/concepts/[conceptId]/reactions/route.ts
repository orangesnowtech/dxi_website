import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/writeClient';

type ReactionType = "like" | "neutral" | "dislike";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conceptId: string }> }
) {
  try {
    const { conceptId } = await params;
    const body = await request.json();
    const { reaction, action, userIdentifier } = body; // action: 'add' or 'remove', userIdentifier for tracking

    if (!reaction || !['like', 'neutral', 'dislike'].includes(reaction)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    // Get current concept - use writeClient to avoid CDN cache (useCdn: false)
    const currentConcept = await writeClient.fetch(
      `*[_type == "concept" && _id == $conceptId][0] {
        _id,
        reactionCounts
      }`,
      { conceptId }
    );

    if (!currentConcept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    // Get current counts from Sanity or default to zero
    const currentCounts = {
      like: currentConcept.reactionCounts?.like || 0,
      neutral: currentConcept.reactionCounts?.neutral || 0,
      dislike: currentConcept.reactionCounts?.dislike || 0,
    };

    // Calculate new counts
    const newCounts = { ...currentCounts };
    
    if (action === 'add') {
      // User is adding a reaction
      // First, check if they had a previous reaction - if so, remove it
      if (body.previousReaction && body.previousReaction !== reaction) {
        // Switching reactions - remove old one, add new one
        newCounts[body.previousReaction as ReactionType] = Math.max(
          0,
          currentCounts[body.previousReaction as ReactionType] - 1
        );
        newCounts[reaction as ReactionType] = currentCounts[reaction as ReactionType] + 1;
      } else {
        // Adding a new reaction (no previous reaction)
        newCounts[reaction as ReactionType] = currentCounts[reaction as ReactionType] + 1;
      }
    } else if (action === 'remove') {
      // User is removing their reaction
      newCounts[reaction as ReactionType] = Math.max(
        0,
        currentCounts[reaction as ReactionType] - 1
      );
    }

    // Always update Sanity with new counts (this is the source of truth)
    try {
      const token = process.env.SANITY_API_WRITE_TOKEN;
      if (!token) {
        return NextResponse.json(
          { error: 'SANITY_API_WRITE_TOKEN not configured' },
          { status: 500 }
        );
      }

      // Update Sanity with the new counts
      await writeClient
        .patch(conceptId)
        .set({ reactionCounts: newCounts })
        .commit();

      console.log(`Updated ${conceptId} reactions:`, newCounts);
    } catch (writeError) {
      console.error('Error writing to Sanity:', writeError);
      return NextResponse.json(
        { error: 'Failed to save reaction to database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      reactionCounts: newCounts,
    });
  } catch (error) {
    console.error('Error updating reaction:', error);
    return NextResponse.json(
      { error: 'Failed to update reaction' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conceptId: string }> }
) {
  try {
    const { conceptId } = await params;

    // Use writeClient to avoid CDN cache for fresh data (useCdn: false)
    const concept = await writeClient.fetch(
      `*[_type == "concept" && _id == $conceptId][0] {
        reactionCounts
      }`,
      { conceptId }
    );

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    const reactionCounts = concept.reactionCounts || {
      like: 0,
      neutral: 0,
      dislike: 0,
    };

    return NextResponse.json({ reactionCounts });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

