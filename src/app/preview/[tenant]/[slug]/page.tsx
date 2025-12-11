/**
 * Tenant Landing Page Preview Route
 *
 * Renders draft/unpublished pages fetched from Payload CMS API.
 * Used for previewing pages before publishing.
 *
 * Unlike the published route (/page/[tenant]/[slug]), this route:
 * - Shows pages regardless of _status (draft or published)
 * - Should be protected by authentication in production
 *
 * @see src/app/page/[tenant]/[slug]/page.tsx for published pages
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
 * Fetch page data from Payload CMS API (draft mode - no status filter)
 * Returns null if tenant or page not found
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
    console.error('[preview/[tenant]/[slug]] PAYLOAD_API_URL not configured');
    return null;
  }

  try {
    // Get tenant by slug
    const tenantRes = await fetch(
      `${baseUrl}/api/tenants?where[slug][equals]=${encodeURIComponent(tenantSlug)}&limit=1`,
      { next: { revalidate: 10 } }, // Shorter cache for preview
    );

    if (!tenantRes.ok) {
      console.error('[preview/[tenant]/[slug]] Failed to fetch tenant:', tenantRes.status);
      return null;
    }

    const tenantData: PayloadTenantResponse = await tenantRes.json();
    if (tenantData.docs.length === 0) {
      return null;
    }

    const tenant = tenantData.docs[0];

    // Get page by slug and tenant (no status filter for preview)
    const pageRes = await fetch(
      `${baseUrl}/api/pages?where[slug][equals]=${encodeURIComponent(pageSlug)}&where[tenant][equals]=${tenant.id}&limit=1&depth=1&draft=true`,
      { next: { revalidate: 10 } }, // Shorter cache for preview
    );

    if (!pageRes.ok) {
      console.error('[preview/[tenant]/[slug]] Failed to fetch page:', pageRes.status);
      return null;
    }

    const pageData: PayloadPageResponse = await pageRes.json();
    if (pageData.docs.length === 0) {
      return null;
    }

    return { page: pageData.docs[0], tenant };
  } catch (error) {
    console.error('[preview/[tenant]/[slug]] Error fetching page data:', error);
    return null;
  }
}

/**
 * Generate SEO metadata for the preview page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const data = await getPageData(tenantSlug, slug);

  if (!data) {
    return {
      title: 'Preview - Page Not Found',
    };
  }

  const { page, tenant } = data;
  const pageTitle = page.meta?.title || page.title;
  const fullTitle = `[PREVIEW] ${tenant.name ? `${pageTitle} | ${tenant.name}` : pageTitle}`;

  return {
    robots: {
      // Don't index preview pages
follow: false, 
      index: false,
    },
    title: fullTitle,
  };
}

/**
 * Preview page route - shows all pages regardless of status
 * Includes a preview banner to indicate draft mode
 */
export default async function PreviewPage({ params }: PageProps) {
  const { tenant: tenantSlug, slug } = await params;
  const data = await getPageData(tenantSlug, slug);

  if (!data) {
    notFound();
  }

  const isDraft = data.page._status !== 'published';

  // Transform Payload page to PageRenderer format
  const pageData: PageData = {
    designSystem: data.page.designSystem || 'untitledui',
    sections: data.page.sections || [],
    slug: data.page.slug,
    title: data.page.title,
  };

  return (
    <div className="min-h-screen">
      {/* Preview Banner */}
      <div
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md"
        style={{ backgroundColor: isDraft ? '#f59e0b' : '#22c55e' }}
      >
        <span>{isDraft ? 'DRAFT PREVIEW' : 'PUBLISHED'}</span>
        <span className="opacity-75">|</span>
        <span className="opacity-75">{data.page.title}</span>
      </div>

      {/* Add padding to account for fixed banner */}
      <div className="pt-10">
        <PageRenderer page={pageData} />
      </div>
    </div>
  );
}
