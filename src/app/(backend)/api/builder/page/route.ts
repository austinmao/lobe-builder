import type { PageSpec } from '@lobechat/types';
import { NextResponse } from 'next/server';

import { pageSpecToBuilderContent } from '@/server/services/builder/pageSpecToBuilderContent';

const BUILDER_API_URL = 'https://builder.io/api/v1/write/page';

/**
 * POST /api/builder/page
 * Creates a Builder.io page from a PageSpec JSON object
 */
export async function POST(request: Request): Promise<Response> {
  // 1. Parse and validate PageSpec schema
  const pageSpec: PageSpec = await request.json();

  if (!pageSpec.slug || !pageSpec.title || !pageSpec.sections) {
    return NextResponse.json({ error: 'Invalid PageSpec' }, { status: 400 });
  }

  // 2. Convert PageSpec to Builder blocks
  const builderContent = pageSpecToBuilderContent(pageSpec);

  // 3. Write to Builder via Content API
  const response = await fetch(BUILDER_API_URL, {
    body: JSON.stringify({
      data: {
        blocks: builderContent,
        url: `/${pageSpec.slug}`,
      },
      name: pageSpec.title,
      published: 'draft',
    }),
    headers: {
      'Authorization': `Bearer ${process.env.BUILDER_PRIVATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }

  return NextResponse.json({ slug: pageSpec.slug });
}
