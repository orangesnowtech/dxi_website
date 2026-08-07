import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Webhook endpoint for Sanity to trigger revalidation.
 * Configure in Sanity: Settings > API > Webhooks
 * URL: https://your-domain.com/api/revalidate?secret=SANITY_REVALIDATE_SECRET
 *
 * The webhook projection should include `_type` and `slug` so a page edit can
 * revalidate just that page:
 *   {_type, slug}
 */

/** Site settings, courses and webinars appear on pages we cannot name from the payload. */
function revalidateEverything() {
  revalidatePath('/', 'layout');
}

function pathForSlug(slug: string) {
  return slug === 'home' ? '/' : `/${slug}`;
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    const body = await request.json();
    const documentType: string | undefined = body._type;
    const slug: string | undefined = body.slug?.current ?? body.slug;

    console.log('Revalidating:', documentType, slug ?? '');

    switch (documentType) {
      case 'page':
        if (slug) {
          revalidatePath(pathForSlug(slug));
        } else {
          // No slug in the payload — we cannot tell which page changed.
          revalidateEverything();
        }
        break;

      // These feed the shared chrome or fan out across pages.
      case 'siteSettings':
      case 'course':
      case 'webinar':
        revalidateEverything();
        break;

      default:
        revalidateEverything();
    }

    return NextResponse.json({
      revalidated: true,
      type: documentType,
      slug: slug ?? null,
      now: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error revalidating:', error);
    return NextResponse.json({ message: 'Error revalidating', error: message }, { status: 500 });
  }
}

// Also support GET for manual testing.
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  revalidateEverything();

  return NextResponse.json({
    revalidated: true,
    message: 'All paths revalidated',
    now: Date.now(),
  });
}
