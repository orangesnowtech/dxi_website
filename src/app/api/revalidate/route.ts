import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Webhook endpoint for Sanity to trigger revalidation
 * Configure in Sanity: Settings > API > Webhooks
 * URL: https://your-domain.com/api/revalidate
 * 
 * Add a secret token to validate requests
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Sanity (optional but recommended)
    const secret = request.nextUrl.searchParams.get('secret');
    
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    const body = await request.json();
    
    // Get the document type from the webhook payload
    const documentType = body._type;
    
    console.log('Revalidating:', documentType);

    // Revalidate based on document type
    switch (documentType) {
      case 'homepage':
        revalidatePath('/');
        break;
      case 'client':
      case 'project':
        revalidatePath('/projects');
        break;
      case 'insight':
      case 'insightCategory':
        revalidatePath('/insights');
        break;
      case 'concept':
      case 'tag':
        revalidatePath('/concepts');
        break;
      case 'whoWeAreSection':
      case 'servicesSection':
      case 'testimonialsSection':
      case 'footerSettings':
        revalidatePath('/');
        break;
      default:
        // Revalidate all paths for unknown types
        revalidatePath('/');
        revalidatePath('/projects');
        revalidatePath('/insights');
        revalidatePath('/concepts');
    }

    return NextResponse.json({ 
      revalidated: true, 
      type: documentType,
      now: Date.now() 
    });
  } catch (error: any) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error.message },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  // Revalidate all main paths
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/insights');
  revalidatePath('/concepts');

  return NextResponse.json({ 
    revalidated: true, 
    message: 'All paths revalidated',
    now: Date.now() 
  });
}
