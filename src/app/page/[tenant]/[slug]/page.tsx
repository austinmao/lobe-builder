/**
 * Tenant Landing Page Route
 *
 * Renders published pages fetched from Payload CMS API.
 * This route is the target for middleware URL rewrites:
 * - live.ceremoniacircle.org/ -> /page/ceremonia/home
 * - live.ceremoniacircle.org/lp/{slug} -> /page/ceremonia/{slug}
 *
 * @see src/proxy.ts for middleware routing logic
 * @see TASK-007 through TASK-012 for implementation details
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageRenderer } from '@/components/PageRenderer';
import type { PageData } from '@/components/PageRenderer/types';
import { payloadEnv } from '@/envs/payload';

interface PageProps {
  params: Promise<{
    slug: string;
    tenant: string;
  }>;
}

interface PayloadPageResponse {
  docs: PayloadPage[];
  totalDocs: number;
}

interface PayloadPage {
  _status?: 'draft' | 'published';
  designSystem?: 'untitledui' | 'shadcn';
  id: string;
  meta?: {
    description?: string;
    image?: {
      url?: string;
    };
    title?: string;
  };
  sections?: any[];
  slug: string;
  tenant?: {
    id: string;
    name?: string;
    slug?: string;
  };
  title: string;
}

interface PayloadTenantResponse {
  docs: {
    id: string;
    name: string;
    slug: string;
  }[];
}

/**
 * Fetch page data from Payload CMS API
 * Returns null if tenant or page not found, or page is not published
 */
async function getPageData(
  tenantSlug: string,
  pageSlug: string,
): Promise<{
  page: PayloadPage;
  tenant: { id: string; name: string; slug: string };
} | null> {
  const baseUrl = payloadEnv.PAYLOAD_API_URL;

  if (!baseUrl) {
    console.error('[page/[tenant]/[slug]] PAYLOAD_API_URL not configured');
    return null;
  }

  try {
    // Get tenant by slug
    const tenantRes = await fetch(
      `${baseUrl}/api/tenants?where[slug][equals]=${encodeURIComponent(tenantSlug)}&limit=1`,
      { next: { revalidate: 60 } },
    );

    if (!tenantRes.ok) {
      console.error('[page/[tenant]/[slug]] Failed to fetch tenant:', tenantRes.status);
      return null;
    }

    const tenantData: PayloadTenantResponse = await tenantRes.json();
    if (tenantData.docs.length === 0) {
      return null;
    }

    const tenant = tenantData.docs[0];

    // Get published page by slug and tenant
    const pageRes = await fetch(
      `${baseUrl}/api/pages?where[slug][equals]=${encodeURIComponent(pageSlug)}&where[tenant][equals]=${tenant.id}&where[_status][equals]=published&limit=1&depth=1`,
      { next: { revalidate: 60 } },
    );

    if (!pageRes.ok) {
      console.error('[page/[tenant]/[slug]] Failed to fetch page:', pageRes.status);
      return null;
    }

    const pageData: PayloadPageResponse = await pageRes.json();
    if (pageData.docs.length === 0) {
      return null;
    }

    return { page: pageData.docs[0], tenant };
  } catch (error) {
    console.error('[page/[tenant]/[slug]] Error fetching page data:', error);
    return null;
  }
}

/**
 * Generate SEO metadata for the page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const data = await getPageData(tenantSlug, slug);

  if (!data) {
    return {
      title: 'Page Not Found',
    };
  }

  const { page, tenant } = data;
  const pageTitle = page.meta?.title || page.title;
  const fullTitle = tenant.name ? `${pageTitle} | ${tenant.name}` : pageTitle;
  const description = page.meta?.description || undefined;
  const imageUrl = page.meta?.image?.url || undefined;

  return {
    description,
    openGraph: {
      description,
      title: fullTitle,
      type: 'website',
      ...(imageUrl && {
        images: [
          {
            alt: pageTitle,
            height: 630,
            url: imageUrl,
            width: 1200,
          },
        ],
      }),
    },
    title: fullTitle,
    twitter: {
      card: 'summary_large_image',
      description,
      title: fullTitle,
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
  const { tenant: tenantSlug, slug } = await params;
  const data = await getPageData(tenantSlug, slug);

  if (!data) {
    notFound();
  }

  // Transform Payload page to PageRenderer format
  const pageData: PageData = {
    designSystem: data.page.designSystem || 'untitledui',
    sections: data.page.sections || [],
    slug: data.page.slug,
    title: data.page.title,
  };

  return (
    <div className="min-h-screen">
      <PageRenderer page={pageData} />
    </div>
  );
}
