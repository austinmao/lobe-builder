import config from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import { PageRenderer } from '@/components/PageRenderer';

import type { Page } from '../../../../payload-types';

interface PreviewPageProps {
  params: Promise<{
    tenantId: string;
    slug: string;
  }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { tenantId, slug } = await params;

  // Initialize Payload
  const payload = await getPayload({
    config,
  });

  // Fetch the page by tenantId and slug
  // Note: We don't filter by _status to show draft pages
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          'tenant.slug': {
            equals: tenantId,
          },
        },
        {
          slug: {
            equals: slug,
          },
        },
      ],
    },
    limit: 1,
    // Disable access control to bypass tenant filtering for preview
    overrideAccess: true,
  });

  // If no page found, return 404
  if (result.docs.length === 0) {
    notFound();
  }

  const page = result.docs[0] as Page;

  return (
    <div className="min-h-screen">
      <PageRenderer page={page} />
    </div>
  );
}
