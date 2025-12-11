import config from '@payload-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import type { Media, Page as PageType, Tenant } from '../../../../payload-types';
import { PageRenderer } from '../../../../src/components/PageRenderer';

interface PageProps {
  params: Promise<{
    tenantId: string;
    slug: string;
  }>;
}

async function getPageData(tenantId: string, slug: string) {
  const payload = await getPayload({ config });

  // Get tenant
  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: tenantId } },
    limit: 1,
  });

  if (tenants.docs.length === 0) return null;

  const tenant = tenants.docs[0];

  // Get published page
  const pages = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { slug: { equals: slug } },
        { tenant: { equals: tenant.id } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
  });

  if (pages.docs.length === 0) return null;

  return { page: pages.docs[0] as PageType, tenant };
}

/**
 * Generate SEO metadata for the page
 * According to Next.js 16 documentation: generateMetadata is called server-side
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantId, slug } = await params;
  const data = await getPageData(tenantId, slug);

  if (!data) {
    return {
      title: 'Page Not Found',
    };
  }

  const { page, tenant } = data;
  const tenantName = (tenant as Tenant).name || '';
  const pageTitle = page.title;
  const fullTitle = tenantName ? `${pageTitle} | ${tenantName}` : pageTitle;

  // Get meta description
  const description = page.meta?.description || undefined;

  // Get social sharing image
  let imageUrl: string | undefined;
  if (page.meta?.image && typeof page.meta.image === 'object') {
    const media = page.meta.image as Media;
    imageUrl = media.url || undefined;
  }

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: pageTitle,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(imageUrl && {
        images: [imageUrl],
      }),
    },
  };
}

/**
 * Published page route - only shows pages where _status === 'published'
 * Draft pages will return 404
 */
export default async function PublishedPage({ params }: PageProps) {
  const { tenantId, slug } = await params;
  const data = await getPageData(tenantId, slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <PageRenderer page={data.page} />
    </div>
  );
}
