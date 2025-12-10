import config from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import type { Page as PageType } from '../../../../payload-types';

interface PageProps {
  params: Promise<{
    tenantId: string;
    slug: string;
  }>;
}

/**
 * Published page route - only shows pages where _status === 'published'
 * Draft pages will return 404
 */
export default async function PublishedPage({ params }: PageProps) {
  const { tenantId, slug } = await params;

  // Initialize Payload
  const payload = await getPayload({
    config,
  });

  // First, get the tenant by slug
  const tenants = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: tenantId,
      },
    },
    limit: 1,
  });

  if (tenants.docs.length === 0) {
    notFound();
  }

  const tenant = tenants.docs[0];

  // Find the page by slug and tenant, filtering by _status='published'
  // IMPORTANT: This filters out draft pages
  const pages = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          tenant: {
            equals: tenant.id,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    limit: 1,
  });

  // Return 404 if page not found or is in draft status
  if (pages.docs.length === 0) {
    notFound();
  }

  const page = pages.docs[0] as PageType;

  return (
    <div className="min-h-screen">
      <PageRenderer page={page} />
    </div>
  );
}

/**
 * PageRenderer component - renders page sections based on design system
 */
function PageRenderer({ page }: { page: PageType }) {
  return (
    <div>
      {/* Page Header */}
      <header className="bg-gray-900 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <div className="text-sm text-gray-400 mt-1">Design System: {page.designSystem}</div>
      </header>

      {/* Page Sections */}
      <main>
        {page.sections.map((section, index) => {
          switch (section.blockType) {
            case 'hero':
              return (
                <section
                  key={section.id || index}
                  className="relative bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20 px-6"
                >
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">{section.title}</h2>
                    {section.subtitle && (
                      <p className="text-xl md:text-2xl mb-8 text-blue-100">{section.subtitle}</p>
                    )}
                    {section.ctaLabel && section.ctaHref && (
                      <a
                        href={section.ctaHref}
                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                      >
                        {section.ctaLabel}
                      </a>
                    )}
                  </div>
                </section>
              );

            case 'text':
              return (
                <section key={section.id || index} className="py-16 px-6 bg-white">
                  <div className="max-w-3xl mx-auto">
                    {section.heading && (
                      <h2 className="text-3xl font-bold mb-6 text-gray-900">{section.heading}</h2>
                    )}
                    <div className="prose prose-lg max-w-none">
                      {/* Note: In production, you'd use a proper Lexical renderer */}
                      <div className="text-gray-700">{JSON.stringify(section.body, null, 2)}</div>
                    </div>
                  </div>
                </section>
              );

            case 'cta':
              return (
                <section
                  key={section.id || index}
                  className="py-16 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.heading}</h2>
                    {section.description && (
                      <p className="text-xl mb-8 text-purple-100">{section.description}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={section.primaryButton.href}
                        className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                      >
                        {section.primaryButton.label}
                      </a>
                      {section.secondaryButton?.label && section.secondaryButton?.href && (
                        <a
                          href={section.secondaryButton.href}
                          className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                        >
                          {section.secondaryButton.label}
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'features':
              return (
                <section key={section.id || index} className="py-16 px-6 bg-gray-50">
                  <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold mb-4 text-gray-900">
                        {(section as any).heading || 'Features'}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {(section as any).items?.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="bg-white p-6 rounded-lg shadow-sm">
                          <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Page Footer */}
      <footer className="bg-gray-900 text-white py-6 px-6 text-center">
        <p className="text-gray-400 text-sm">
          Powered by LobeChat CMS • Page ID: {page.id} • Slug: {page.slug}
        </p>
      </footer>
    </div>
  );
}
