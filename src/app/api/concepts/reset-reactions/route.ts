import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/writeClient';

export async function POST(request: NextRequest) {
  try {
    // Get all concepts
    const concepts = await client.fetch(`*[_type == "concept"] { _id }`);
    
    const token = process.env.SANITY_API_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'SANITY_API_WRITE_TOKEN not configured. Please set it in .env.local' },
        { status: 500 }
      );
    }

    // Reset all concept reactions to zero
    const resetCounts = {
      like: 0,
      neutral: 0,
      dislike: 0,
    };

    const updatePromises = concepts.map((concept: any) =>
      writeClient
        .patch(concept._id)
        .set({ reactionCounts: resetCounts })
        .commit()
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Reset reactions for ${concepts.length} concepts`,
    });
  } catch (error) {
    console.error('Error resetting reactions:', error);
    return NextResponse.json(
      { error: 'Failed to reset reactions' },
      { status: 500 }
    );
  }
}

