/**
 * Test fixture: Basic test page data
 * Used for Phase 1 infrastructure tests
 */

export const testPageData = {
  _status: 'draft' as const,
  designSystem: 'untitledui' as const,
  sections: [
    {
      blockType: 'hero',
      ctaHref: '#test',
      ctaLabel: 'Test CTA',
      subtitle: 'Test Subtitle',
      title: 'Test Hero',
    },
  ],
  slug: 'test-page',
  tenantId: 'ceremonia',
  title: 'Test Page',
  userId: 'user_ceremonia_admin',
};

export const publishedTestPageData = {
  ...testPageData,
  _status: 'published' as const,
};
