# TDD Test Plan: Payload CMS Multi-Tenant Page Builder with Multi-Design System Support

**Version:** 1.0.0
**Created:** 2025-11-29
**Status:** Ready for Implementation
**Priority:** TESTS FIRST - All tests must be written BEFORE implementation

---

## Executive Summary

This TDD test plan defines comprehensive test coverage for migrating from Builder.io to Payload CMS with support for **multiple design systems** (Untitled UI and Shadcn UI initially, with extensibility for future systems).

**Critical New Requirements:**

1. **Hello World First**: Simple MVP page rendering at `/preview/[tenantId]/[slug]`
2. **Multi-Design System Architecture**: Support both Untitled UI AND Shadcn UI from MVP
3. **Dual Route Structure**: `/preview/` for drafts, `/page/` for published
4. **Payload CMS Integration**: Replace Builder.io with self-hosted Payload CMS

**Test-First Development:**

- ✅ Write ALL tests FIRST (they will fail initially)
- ✅ Tests define the API contract
- ✅ Implementation makes tests pass
- ❌ NO implementation before tests exist

---

## Test Environment Configuration

### Vitest Configuration (Unit/Component Tests)

**File:** `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/vitest.config.mts`

Current configuration already supports:

- Happy DOM environment (browser simulation)
- PGLite for client-side database tests
- Coverage reporting with v8 provider
- Test setup at `tests/setup.ts`

**Command:**

```bash
bunx vitest run --silent='passed-only' '[file-path-pattern]'
```

### Playwright Configuration (E2E Tests)

**File:** `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/playwright.config.ts`

Current configuration:

- Test directory: `./tests/e2e`
- Base URL: `http://localhost:3010`
- Full parallel execution
- HTML, list, and JUnit reporters

**Command:**

```bash
npx playwright test
```

---

## Phase 1: Hello World E2E Test (WRITE FIRST)

### Objective

Create the FIRST E2E test that validates the simplest possible working page builder flow using Untitled UI Landing Page 17 as the reference.

**Reference Design:** <https://www.untitledui.com/react/marketing/landing-pages/landing-page-17>

### Test File: `tests/e2e/page-builder/hello-world.spec.ts`

```typescript
import { expect, test } from '@playwright/test';

/**
 * Hello World E2E Test for Payload CMS Page Builder
 *
 * This is the FIRST test to write - it defines the simplest possible working flow.
 * Test Reference: Untitled UI Landing Page 17
 *
 * Tests verify:
 * 1. Page creation via Payload API
 * 2. Preview route renders at /preview/[tenantId]/[slug]
 * 3. Untitled UI components render correctly
 * 4. Publishing moves page to /page/[tenantId]/[slug]
 */

test.describe('Hello World - Payload CMS Integration', () => {
  test('should create and preview a simple hello world page with Untitled UI', async ({
    page,
    request,
  }) => {
    // GIVEN: A tenant wants to create their first landing page
    const timestamp = Date.now();
    const tenantId = `hello-world-tenant-${timestamp}`;
    const slug = `hello-world-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Hello World Landing Page',
      designSystem: 'untitledui', // NEW FIELD - specifies which design system to use
      sections: [
        {
          type: 'hero',
          title: 'Grow your users. Smarter.',
          subtitle:
            'Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000 startups.',
          ctaLabel: 'Get Started',
          ctaHref: '#signup',
        },
      ],
    };

    // WHEN: The page is created via Payload API
    const createResponse = await request.post('/api/pages/create', {
      data: pageSpec,
    });

    // THEN: The API should return success
    expect(createResponse.ok()).toBeTruthy();
    expect(createResponse.status()).toBe(200);

    const createData = await createResponse.json();
    expect(createData).toHaveProperty('id');
    expect(createData).toHaveProperty('slug');
    expect(createData).toHaveProperty('tenantId');
    expect(createData.slug).toBe(slug);
    expect(createData.tenantId).toBe(tenantId);

    // WHEN: The preview URL is accessed
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: The page should render without 404
    const pageNotFound = await page.locator('text=Page Not Found').count();
    expect(pageNotFound).toBe(0);

    // THEN: The hero section should render with Untitled UI styling
    const heroTitle = page.getByRole('heading', { name: /grow your users/i });
    await expect(heroTitle).toBeVisible();

    const heroSubtitle = page.getByText(/powerful, self-serve product/i);
    await expect(heroSubtitle).toBeVisible();

    const ctaButton = page.getByRole('link', { name: /get started/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '#signup');

    // THEN: Untitled UI design tokens should be applied
    const heroSection = page.locator('section').first();
    const bgColor = await heroSection.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Untitled UI uses specific color schemes - verify it's not plain white
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
  });

  test('should publish page and move from /preview to /page route', async ({ page, request }) => {
    // GIVEN: A draft page exists
    const timestamp = Date.now();
    const tenantId = `publish-tenant-${timestamp}`;
    const slug = `publish-test-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Publish Test Page',
      designSystem: 'untitledui',
      sections: [
        {
          type: 'hero',
          title: 'Test Publishing',
          subtitle: 'This page will be published',
          ctaLabel: 'Learn More',
        },
      ],
    };

    const createResponse = await request.post('/api/pages/create', {
      data: pageSpec,
    });
    expect(createResponse.ok()).toBeTruthy();

    const { id } = await createResponse.json();

    // WHEN: The page is published via API
    const publishResponse = await request.patch(`/api/pages/${id}/publish`, {
      data: { _status: 'published' },
    });

    // THEN: Publishing should succeed
    expect(publishResponse.ok()).toBeTruthy();

    // THEN: The page should now be accessible at /page/ route
    await page.goto(`/page/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    const pageNotFound = await page.locator('text=Page Not Found').count();
    expect(pageNotFound).toBe(0);

    const heroTitle = page.getByRole('heading', { name: /test publishing/i });
    await expect(heroTitle).toBeVisible();

    // THEN: Draft preview should still work
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    const previewTitle = page.getByRole('heading', { name: /test publishing/i });
    await expect(previewTitle).toBeVisible();
  });

  test('should handle Payload CMS draft status correctly', async ({ page, request }) => {
    // GIVEN: A page is created as draft
    const timestamp = Date.now();
    const tenantId = `draft-tenant-${timestamp}`;
    const slug = `draft-test-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Draft Page',
      designSystem: 'untitledui',
      _status: 'draft', // Payload CMS draft field
      sections: [
        {
          type: 'hero',
          title: 'Draft Content',
          subtitle: 'This is a draft',
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageSpec });

    // WHEN: Accessing via /preview route
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Draft content should be visible
    const draftTitle = page.getByRole('heading', { name: /draft content/i });
    await expect(draftTitle).toBeVisible();

    // WHEN: Accessing via /page route (published only)
    await page.goto(`/page/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Should show 404 (not published)
    const pageNotFound = await page.locator('text=Page Not Found').count();
    expect(pageNotFound).toBeGreaterThan(0);
  });

  test('should render multiple sections in correct order', async ({ page, request }) => {
    // GIVEN: A page with multiple sections
    const timestamp = Date.now();
    const tenantId = `multi-section-tenant-${timestamp}`;
    const slug = `multi-section-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Multi-Section Page',
      designSystem: 'untitledui',
      sections: [
        {
          type: 'hero',
          title: 'Hero Section',
          subtitle: 'First section',
        },
        {
          type: 'features',
          heading: 'Features Section',
          items: [
            { icon: 'star', title: 'Feature 1', description: 'First feature' },
            { icon: 'heart', title: 'Feature 2', description: 'Second feature' },
          ],
        },
        {
          type: 'cta',
          heading: 'CTA Section',
          description: 'Ready to get started?',
          primaryButton: { label: 'Get Started', href: '/signup' },
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageSpec });

    // WHEN: The preview is accessed
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: All sections should render in order
    const sections = page.locator('section');
    await expect(sections).toHaveCount(3);

    // Hero section first
    const heroHeading = page.getByRole('heading', { name: /hero section/i });
    await expect(heroHeading).toBeVisible();

    // Features section second
    const featuresHeading = page.getByRole('heading', { name: /features section/i });
    await expect(featuresHeading).toBeVisible();

    const feature1 = page.getByText(/first feature/i);
    await expect(feature1).toBeVisible();

    // CTA section third
    const ctaHeading = page.getByRole('heading', { name: /cta section/i });
    await expect(ctaHeading).toBeVisible();

    const ctaButton = page.getByRole('link', { name: /get started/i });
    await expect(ctaButton).toBeVisible();
  });
});
```

---

## Phase 2: Multi-Design System Tests (WRITE SECOND)

### Test File: `tests/e2e/page-builder/multi-design-system.spec.ts`

```typescript
import { expect, test } from '@playwright/test';

/**
 * Multi-Design System E2E Tests
 *
 * Tests verify:
 * 1. Pages can specify designSystem field ('untitledui' | 'shadcn')
 * 2. Correct components render for each design system
 * 3. Fallback behavior when design system not specified
 * 4. Design systems are isolated (no style bleeding)
 */

test.describe('Multi-Design System Support', () => {
  test('should render page with Untitled UI design system', async ({ page, request }) => {
    // GIVEN: A page specifying Untitled UI
    const timestamp = Date.now();
    const tenantId = `untitledui-tenant-${timestamp}`;
    const slug = `untitledui-test-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Untitled UI Test',
      designSystem: 'untitledui',
      sections: [
        {
          type: 'hero',
          title: 'Untitled UI Hero',
          subtitle: 'Using Untitled UI components',
          ctaLabel: 'Get Started',
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageSpec });

    // WHEN: The page is rendered
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Untitled UI components should render
    const heroSection = page.locator('section').first();

    // Verify Untitled UI specific classes/attributes
    const hasUntitledUI = await heroSection.evaluate((el) => {
      const classes = el.className;
      const computedStyle = window.getComputedStyle(el);

      // Untitled UI uses specific design tokens
      return (
        classes.includes('untitled-ui') ||
        computedStyle.getPropertyValue('--color-brand-500') !== '' ||
        computedStyle.fontFamily.includes('Inter')
      );
    });

    expect(hasUntitledUI).toBeTruthy();
  });

  test('should render page with Shadcn UI design system', async ({ page, request }) => {
    // GIVEN: A page specifying Shadcn UI
    const timestamp = Date.now();
    const tenantId = `shadcn-tenant-${timestamp}`;
    const slug = `shadcn-test-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Shadcn UI Test',
      designSystem: 'shadcn',
      sections: [
        {
          type: 'hero',
          title: 'Shadcn UI Hero',
          subtitle: 'Using Shadcn UI components',
          ctaLabel: 'Get Started',
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageSpec });

    // WHEN: The page is rendered
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Shadcn UI components should render
    const ctaButton = page.getByRole('link', { name: /get started/i });
    await expect(ctaButton).toBeVisible();

    // Verify Shadcn UI specific styling
    const hasShadcn = await ctaButton.evaluate((el) => {
      const classes = el.className;

      // Shadcn uses specific Tailwind classes
      return (
        classes.includes('inline-flex') &&
        classes.includes('items-center') &&
        classes.includes('justify-center')
      );
    });

    expect(hasShadcn).toBeTruthy();
  });

  test('should use default design system when not specified', async ({ page, request }) => {
    // GIVEN: A page WITHOUT designSystem field
    const timestamp = Date.now();
    const tenantId = `default-ds-tenant-${timestamp}`;
    const slug = `default-ds-${timestamp}`;

    const pageSpec = {
      tenantId,
      slug,
      title: 'Default Design System',
      // designSystem field NOT specified
      sections: [
        {
          type: 'hero',
          title: 'Default Hero',
          subtitle: 'Using default design system',
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageSpec });

    // WHEN: The page is rendered
    await page.goto(`/preview/${tenantId}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Page should render without errors
    const pageNotFound = await page.locator('text=Page Not Found').count();
    expect(pageNotFound).toBe(0);

    const heroTitle = page.getByRole('heading', { name: /default hero/i });
    await expect(heroTitle).toBeVisible();

    // Default should be Untitled UI (as per PRD)
    const heroSection = page.locator('section').first();
    const defaultIsUntitledUI = await heroSection.evaluate((el) => {
      const classes = el.className;
      return classes.includes('untitled-ui') || !classes.includes('shadcn');
    });

    expect(defaultIsUntitledUI).toBeTruthy();
  });

  test('should isolate design systems (no style bleeding)', async ({ page, request }) => {
    // GIVEN: Two pages with different design systems
    const timestamp = Date.now();
    const tenantId = `isolation-tenant-${timestamp}`;

    const untitledUIPage = {
      tenantId,
      slug: `untitled-${timestamp}`,
      title: 'Untitled UI Page',
      designSystem: 'untitledui',
      sections: [{ type: 'hero', title: 'Untitled Hero' }],
    };

    const shadcnPage = {
      tenantId,
      slug: `shadcn-${timestamp}`,
      title: 'Shadcn UI Page',
      designSystem: 'shadcn',
      sections: [{ type: 'hero', title: 'Shadcn Hero' }],
    };

    await request.post('/api/pages/create', { data: untitledUIPage });
    await request.post('/api/pages/create', { data: shadcnPage });

    // WHEN: Navigating between pages
    await page.goto(`/preview/${tenantId}/${untitledUIPage.slug}`);
    await page.waitForLoadState('networkidle');

    const untitledUIHero = page.locator('section').first();
    const untitledUIClasses = await untitledUIHero.getAttribute('class');

    await page.goto(`/preview/${tenantId}/${shadcnPage.slug}`);
    await page.waitForLoadState('networkidle');

    const shadcnHero = page.locator('section').first();
    const shadcnClasses = await shadcnHero.getAttribute('class');

    // THEN: Classes should be different (no overlap)
    expect(untitledUIClasses).not.toBe(shadcnClasses);
  });

  test('should validate designSystem field in PageSpec', async ({ request }) => {
    // GIVEN: Invalid design system value
    const pageSpec = {
      tenantId: 'test-tenant',
      slug: 'invalid-ds',
      title: 'Invalid Design System',
      designSystem: 'invalid-system', // Invalid value
      sections: [{ type: 'hero', title: 'Test' }],
    };

    // WHEN: Creating the page
    const response = await request.post('/api/pages/create', {
      data: pageSpec,
    });

    // THEN: Should return 400 validation error
    expect(response.status()).toBe(400);

    const errorData = await response.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData.error).toContain('Invalid design system');
  });

  test('should support future design systems via extensible architecture', async ({ request }) => {
    // GIVEN: A hypothetical future design system
    // This test documents the expected behavior for adding new design systems

    const futurePageSpec = {
      tenantId: 'future-tenant',
      slug: 'future-design-system',
      title: 'Future Design System',
      designSystem: 'material-ui', // Not yet implemented
      sections: [{ type: 'hero', title: 'Future Hero' }],
    };

    // WHEN: Creating with unimplemented design system
    const response = await request.post('/api/pages/create', {
      data: futurePageSpec,
    });

    // THEN: Should fail gracefully with clear error message
    expect(response.status()).toBe(400);

    const errorData = await response.json();
    expect(errorData.error).toContain('Unsupported design system');
    expect(errorData.supportedDesignSystems).toEqual(['untitledui', 'shadcn']);
  });
});
```

---

## Phase 3: Tenant Isolation Tests (WRITE THIRD)

### Test File: `tests/e2e/page-builder/tenant-isolation.spec.ts`

```typescript
import { expect, test } from '@playwright/test';

/**
 * Tenant Isolation E2E Tests
 *
 * Tests verify:
 * 1. Tenant A cannot see tenant B's pages
 * 2. Preview URLs are scoped to tenant
 * 3. Published URLs are scoped to tenant
 * 4. API enforces tenant boundaries
 */

test.describe('Tenant Isolation', () => {
  test('should NOT allow cross-tenant access via preview route', async ({ page, request }) => {
    // GIVEN: Two tenants with pages
    const timestamp = Date.now();
    const tenantA = `tenant-a-${timestamp}`;
    const tenantB = `tenant-b-${timestamp}`;
    const slug = `isolation-test-${timestamp}`;

    const pageA = {
      tenantId: tenantA,
      slug,
      title: 'Tenant A Page',
      designSystem: 'untitledui',
      sections: [
        {
          type: 'hero',
          title: 'Secret Tenant A Content',
          subtitle: 'Only Tenant A should see this',
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageA });

    // WHEN: Tenant B tries to access Tenant A's page
    await page.goto(`/preview/${tenantB}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Should show 404
    const pageContent = await page.content();
    expect(pageContent).toContain('Page Not Found');

    // Verify Tenant A's content is NOT visible
    expect(pageContent).not.toContain('Secret Tenant A Content');
    expect(pageContent).not.toContain('Only Tenant A should see this');
  });

  test('should NOT allow cross-tenant access via published route', async ({ page, request }) => {
    // GIVEN: Tenant A has a published page
    const timestamp = Date.now();
    const tenantA = `tenant-a-pub-${timestamp}`;
    const tenantB = `tenant-b-pub-${timestamp}`;
    const slug = `published-isolation-${timestamp}`;

    const pageA = {
      tenantId: tenantA,
      slug,
      title: 'Published Page A',
      designSystem: 'shadcn',
      _status: 'published',
      sections: [
        {
          type: 'hero',
          title: 'Published Content A',
        },
      ],
    };

    const createResponse = await request.post('/api/pages/create', { data: pageA });
    const { id } = await createResponse.json();

    await request.patch(`/api/pages/${id}/publish`, {
      data: { _status: 'published' },
    });

    // WHEN: Tenant B tries to access via /page route
    await page.goto(`/page/${tenantB}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Should show 404
    const pageContent = await page.content();
    expect(pageContent).toContain('Page Not Found');
    expect(pageContent).not.toContain('Published Content A');

    // WHEN: Tenant A accesses their own page
    await page.goto(`/page/${tenantA}/${slug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Should work correctly
    const validContent = await page.content();
    expect(validContent).not.toContain('Page Not Found');
    const heroTitle = page.getByRole('heading', { name: /published content a/i });
    await expect(heroTitle).toBeVisible();
  });

  test('should allow same slug across different tenants', async ({ page, request }) => {
    // GIVEN: Two tenants with same slug
    const timestamp = Date.now();
    const tenantA = `tenant-x-${timestamp}`;
    const tenantB = `tenant-y-${timestamp}`;
    const sharedSlug = `shared-slug-${timestamp}`;

    const pageA = {
      tenantId: tenantA,
      slug: sharedSlug,
      title: 'Tenant X Page',
      designSystem: 'untitledui',
      sections: [
        {
          type: 'hero',
          title: 'Tenant X Hero',
        },
      ],
    };

    const pageB = {
      tenantId: tenantB,
      slug: sharedSlug,
      title: 'Tenant Y Page',
      designSystem: 'shadcn',
      sections: [
        {
          type: 'hero',
          title: 'Tenant Y Hero',
        },
      ],
    };

    await request.post('/api/pages/create', { data: pageA });
    await request.post('/api/pages/create', { data: pageB });

    // WHEN: Each tenant accesses their page
    await page.goto(`/preview/${tenantA}/${sharedSlug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Tenant A sees their content
    const heroA = page.getByRole('heading', { name: /tenant x hero/i });
    await expect(heroA).toBeVisible();

    await page.goto(`/preview/${tenantB}/${sharedSlug}`);
    await page.waitForLoadState('networkidle');

    // THEN: Tenant B sees their content
    const heroB = page.getByRole('heading', { name: /tenant y hero/i });
    await expect(heroB).toBeVisible();
  });

  test('should enforce tenant isolation at API level', async ({ request }) => {
    // GIVEN: A page created for tenant A
    const timestamp = Date.now();
    const tenantA = `api-tenant-a-${timestamp}`;
    const tenantB = `api-tenant-b-${timestamp}`;
    const slug = `api-isolation-${timestamp}`;

    const pageA = {
      tenantId: tenantA,
      slug,
      title: 'API Test Page',
      designSystem: 'untitledui',
      sections: [{ type: 'hero', title: 'Test' }],
    };

    const createResponse = await request.post('/api/pages/create', { data: pageA });
    const { id } = await createResponse.json();

    // WHEN: Tenant B tries to access via API (with tenant B context)
    // This would typically be done with authentication headers
    const getResponse = await request.get(`/api/pages/${id}`, {
      headers: {
        'X-Tenant-ID': tenantB, // Simulating tenant B authentication
      },
    });

    // THEN: Should return 403 Forbidden or 404 Not Found
    expect([403, 404]).toContain(getResponse.status());
  });
});
```

---

## Phase 4: Unit Tests for PageSpec Validation

### Test File: `src/libs/payload/__tests__/pageSpec.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

/**
 * Unit tests for PageSpec validation schema
 *
 * Tests verify:
 * 1. Valid PageSpec passes validation
 * 2. Missing required fields fail validation
 * 3. Invalid designSystem values fail validation
 * 4. Section type validation
 */

// Import the schema that will be created
import { pageSpecSchema } from '../schemas/pageSpec';

describe('PageSpec Validation', () => {
  describe('Valid PageSpec', () => {
    it('should validate complete PageSpec with Untitled UI', () => {
      const validPageSpec = {
        tenantId: 'tenant-123',
        slug: 'valid-page',
        title: 'Valid Page',
        designSystem: 'untitledui',
        sections: [
          {
            type: 'hero',
            title: 'Hero Title',
            subtitle: 'Hero Subtitle',
          },
        ],
      };

      const result = pageSpecSchema.safeParse(validPageSpec);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.designSystem).toBe('untitledui');
      }
    });

    it('should validate PageSpec with Shadcn UI', () => {
      const validPageSpec = {
        tenantId: 'tenant-456',
        slug: 'shadcn-page',
        title: 'Shadcn Page',
        designSystem: 'shadcn',
        sections: [
          {
            type: 'cta',
            heading: 'Call to Action',
          },
        ],
      };

      const result = pageSpecSchema.safeParse(validPageSpec);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.designSystem).toBe('shadcn');
      }
    });

    it('should default to untitledui when designSystem not specified', () => {
      const pageSpecWithoutDS = {
        tenantId: 'tenant-789',
        slug: 'default-page',
        title: 'Default Page',
        sections: [
          {
            type: 'hero',
            title: 'Test',
          },
        ],
      };

      const result = pageSpecSchema.safeParse(pageSpecWithoutDS);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.designSystem).toBe('untitledui');
      }
    });
  });

  describe('Invalid PageSpec', () => {
    it('should reject missing tenantId', () => {
      const invalidPageSpec = {
        slug: 'test-page',
        title: 'Test Page',
        sections: [],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['tenantId'],
          }),
        );
      }
    });

    it('should reject empty tenantId', () => {
      const invalidPageSpec = {
        tenantId: '',
        slug: 'test-page',
        title: 'Test Page',
        sections: [],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
    });

    it('should reject missing slug', () => {
      const invalidPageSpec = {
        tenantId: 'tenant-123',
        title: 'Test Page',
        sections: [],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['slug'],
          }),
        );
      }
    });

    it('should reject invalid slug format', () => {
      const invalidPageSpec = {
        tenantId: 'tenant-123',
        slug: 'Invalid Slug!',
        title: 'Test Page',
        sections: [],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
      if (!result.success) {
        const slugError = result.error.issues.find((issue) => issue.path[0] === 'slug');
        expect(slugError?.message).toContain('lowercase alphanumeric');
      }
    });

    it('should reject missing title', () => {
      const invalidPageSpec = {
        tenantId: 'tenant-123',
        slug: 'test-page',
        sections: [],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['title'],
          }),
        );
      }
    });

    it('should reject missing sections', () => {
      const invalidPageSpec = {
        tenantId: 'tenant-123',
        slug: 'test-page',
        title: 'Test Page',
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['sections'],
          }),
        );
      }
    });

    it('should reject invalid designSystem value', () => {
      const invalidPageSpec = {
        tenantId: 'tenant-123',
        slug: 'test-page',
        title: 'Test Page',
        designSystem: 'invalid-system',
        sections: [{ type: 'hero', title: 'Test' }],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
      if (!result.success) {
        const dsError = result.error.issues.find((issue) => issue.path[0] === 'designSystem');
        expect(dsError).toBeDefined();
      }
    });

    it('should reject unknown section type', () => {
      const invalidPageSpec = {
        tenantId: 'tenant-123',
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          {
            type: 'unknown-section',
            data: 'test',
          },
        ],
      };

      const result = pageSpecSchema.safeParse(invalidPageSpec);

      expect(result.success).toBe(false);
    });
  });

  describe('Section Type Validation', () => {
    it('should validate hero section', () => {
      const heroSection = {
        type: 'hero',
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        ctaLabel: 'Click Me',
        ctaHref: '#link',
      };

      const pageSpec = {
        tenantId: 'tenant-123',
        slug: 'hero-test',
        title: 'Hero Test',
        sections: [heroSection],
      };

      const result = pageSpecSchema.safeParse(pageSpec);
      expect(result.success).toBe(true);
    });

    it('should validate features section', () => {
      const featuresSection = {
        type: 'features',
        heading: 'Features',
        items: [
          { icon: 'star', title: 'Feature 1', description: 'Desc 1' },
          { icon: 'heart', title: 'Feature 2', description: 'Desc 2' },
        ],
      };

      const pageSpec = {
        tenantId: 'tenant-123',
        slug: 'features-test',
        title: 'Features Test',
        sections: [featuresSection],
      };

      const result = pageSpecSchema.safeParse(pageSpec);
      expect(result.success).toBe(true);
    });

    it('should validate cta section', () => {
      const ctaSection = {
        type: 'cta',
        heading: 'Ready to start?',
        description: 'Join us today',
        primaryButton: { label: 'Get Started', href: '/signup' },
        secondaryButton: { label: 'Learn More', href: '/about' },
      };

      const pageSpec = {
        tenantId: 'tenant-123',
        slug: 'cta-test',
        title: 'CTA Test',
        sections: [ctaSection],
      };

      const result = pageSpecSchema.safeParse(pageSpec);
      expect(result.success).toBe(true);
    });
  });
});
```

---

## Phase 5: Component Tests for PageRenderer

### Test File: `src/components/PageRenderer/__tests__/PageRenderer.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PageSpec } from '@lobechat/types';

/**
 * Component tests for PageRenderer
 *
 * Tests verify:
 * 1. PageRenderer renders sections correctly
 * 2. Design system selection works
 * 3. Section order is preserved
 * 4. Missing components fail gracefully
 */

// Import the component that will be created
import { PageRenderer } from '../index';

describe('<PageRenderer />', () => {
  describe('Untitled UI Design System', () => {
    it('should render hero section with Untitled UI components', () => {
      const page: PageSpec = {
        tenantId: 'tenant-123',
        slug: 'test-page',
        title: 'Test Page',
        designSystem: 'untitledui',
        sections: [
          {
            type: 'hero',
            title: 'Hero Title',
            subtitle: 'Hero Subtitle',
            ctaLabel: 'Click Me',
          },
        ],
      };

      render(<PageRenderer page={page} />);

      expect(screen.getByRole('heading', { name: /hero title/i })).toBeInTheDocument();
      expect(screen.getByText(/hero subtitle/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render features section with Untitled UI components', () => {
      const page: PageSpec = {
        tenantId: 'tenant-456',
        slug: 'features-page',
        title: 'Features Page',
        designSystem: 'untitledui',
        sections: [
          {
            type: 'features',
            heading: 'Our Features',
            items: [
              { icon: 'star', title: 'Feature 1', description: 'First feature' },
              { icon: 'heart', title: 'Feature 2', description: 'Second feature' },
            ],
          },
        ],
      };

      render(<PageRenderer page={page} />);

      expect(screen.getByRole('heading', { name: /our features/i })).toBeInTheDocument();
      expect(screen.getByText(/first feature/i)).toBeInTheDocument();
      expect(screen.getByText(/second feature/i)).toBeInTheDocument();
    });
  });

  describe('Shadcn UI Design System', () => {
    it('should render hero section with Shadcn UI components', () => {
      const page: PageSpec = {
        tenantId: 'tenant-789',
        slug: 'shadcn-page',
        title: 'Shadcn Page',
        designSystem: 'shadcn',
        sections: [
          {
            type: 'hero',
            title: 'Shadcn Hero',
            subtitle: 'Using Shadcn components',
            ctaLabel: 'Get Started',
          },
        ],
      };

      render(<PageRenderer page={page} />);

      expect(screen.getByRole('heading', { name: /shadcn hero/i })).toBeInTheDocument();
      expect(screen.getByText(/using shadcn components/i)).toBeInTheDocument();

      const ctaButton = screen.getByRole('link', { name: /get started/i });
      expect(ctaButton).toBeInTheDocument();

      // Shadcn buttons have specific classes
      expect(ctaButton.className).toContain('inline-flex');
    });

    it('should render CTA section with Shadcn UI components', () => {
      const page: PageSpec = {
        tenantId: 'tenant-abc',
        slug: 'cta-page',
        title: 'CTA Page',
        designSystem: 'shadcn',
        sections: [
          {
            type: 'cta',
            heading: 'Ready to start?',
            description: 'Join us today',
            primaryButton: { label: 'Sign Up', href: '/signup' },
          },
        ],
      };

      render(<PageRenderer page={page} />);

      expect(screen.getByRole('heading', { name: /ready to start/i })).toBeInTheDocument();
      expect(screen.getByText(/join us today/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Section Rendering', () => {
    it('should render multiple sections in correct order', () => {
      const page: PageSpec = {
        tenantId: 'tenant-multi',
        slug: 'multi-section',
        title: 'Multi Section',
        designSystem: 'untitledui',
        sections: [
          { type: 'hero', title: 'First Section' },
          { type: 'features', heading: 'Second Section', items: [] },
          { type: 'cta', heading: 'Third Section' },
        ],
      };

      render(<PageRenderer page={page} />);

      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(3);
    });

    it('should skip unknown section types gracefully', () => {
      const page: PageSpec = {
        tenantId: 'tenant-unknown',
        slug: 'unknown-section',
        title: 'Unknown Section',
        designSystem: 'untitledui',
        sections: [
          { type: 'hero', title: 'Valid Section' },
          { type: 'unknown' as any, data: 'invalid' }, // Invalid section type
          { type: 'cta', heading: 'Another Valid Section' },
        ],
      };

      render(<PageRenderer page={page} />);

      // Should render valid sections and skip unknown
      expect(screen.getByRole('heading', { name: /valid section/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /another valid section/i })).toBeInTheDocument();

      // Unknown section should not crash the app
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  describe('Design System Isolation', () => {
    it('should not mix Untitled UI and Shadcn components', () => {
      const untitledUIPage: PageSpec = {
        tenantId: 'tenant-ui',
        slug: 'ui-test',
        title: 'UI Test',
        designSystem: 'untitledui',
        sections: [{ type: 'hero', title: 'Untitled Hero' }],
      };

      const { container: untitledUIContainer } = render(<PageRenderer page={untitledUIPage} />);
      const untitledUIClasses = untitledUIContainer.querySelector('section')?.className;

      const shadcnPage: PageSpec = {
        tenantId: 'tenant-shadcn',
        slug: 'shadcn-test',
        title: 'Shadcn Test',
        designSystem: 'shadcn',
        sections: [{ type: 'hero', title: 'Shadcn Hero' }],
      };

      const { container: shadcnContainer } = render(<PageRenderer page={shadcnPage} />);
      const shadcnClasses = shadcnContainer.querySelector('section')?.className;

      // Classes should be different
      expect(untitledUIClasses).not.toBe(shadcnClasses);
    });
  });

  describe('Default Design System', () => {
    it('should use Untitled UI when designSystem not specified', () => {
      const page: PageSpec = {
        tenantId: 'tenant-default',
        slug: 'default-test',
        title: 'Default Test',
        // designSystem field omitted
        sections: [{ type: 'hero', title: 'Default Hero' }],
      } as any; // TypeScript will complain about missing designSystem

      render(<PageRenderer page={page} />);

      expect(screen.getByRole('heading', { name: /default hero/i })).toBeInTheDocument();
    });
  });
});
```

---

## PRD Update Recommendations

### 1. Add `designSystem` Field to PageSpec

**File:** `docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`

**Section 5.1 - Update PageSpec Interface:**

```typescript
interface PageSpec {
  tenantId: string; // Required for multi-tenant isolation
  userId: string; // User within organization
  slug: string; // URL-friendly identifier
  title: string; // Page title
  designSystem: 'untitledui' | 'shadcn'; // NEW FIELD - Design system selection
  sections: PageSpecSection[]; // Ordered list of blocks
}
```

Add new subsection **5.1.1 Design System Selection:**

````markdown
### 5.1.1 Design System Selection

**Supported Design Systems (MVP):**

- `untitledui`: Untitled UI React components (default)
- `shadcn`: Shadcn UI components

**Default Behavior:**

- If `designSystem` field is omitted, defaults to `untitledui`
- Invalid values return 400 validation error

**Future Extensibility:**

- Architecture supports adding new design systems
- Each design system maps to isolated component implementations
- No style bleeding between design systems

**Example:**

```typescript
{
  tenantId: "acme-corp",
  slug: "landing-page",
  title: "ACME Landing",
  designSystem: "shadcn", // Use Shadcn UI components
  sections: [...]
}
```
````

**Validation:**

- `designSystem` must be one of: `untitledui`, `shadcn`
- Case-sensitive
- Validated at API level before page creation

````

### 2. Add Published Route Documentation

**Section 5.4 - Update Preview Route Section:**

Add new subsection **5.4.1 Dual Route Structure:**

```markdown
### 5.4.1 Dual Route Structure

**Preview Route (Draft Pages):**
````

/preview/\[tenantId]/\[slug]

```
- Shows pages with `_status: 'draft'` or `_status: 'published'`
- Used during content creation and editing
- Payload CMS Preview button points here
- AI-generated artifact preview uses this route

**Published Route (Production Pages):**
```

/page/\[tenantId]/\[slug]

````
- Shows ONLY pages with `_status: 'published'`
- Public-facing production URL
- Returns 404 for draft pages
- Used for live customer-facing pages

**Future Routes:**
- Custom domains: `custom-domain.com/[slug]`
- Tenant subdomains: `[tenant].myxelium.app/[slug]`

**Implementation Example:**
```typescript
// src/app/preview/[tenantId]/[slug]/page.tsx
export default async function PreviewPage({ params }) {
  const { tenantId, slug } = await params
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: 'pages',
    where: {
      tenantId: { equals: tenantId },
      slug: { equals: slug },
    },
    draft: true,  // Include draft pages
  })

  if (!pages.docs.length) {
    return <PageNotFound />
  }

  return <PageRenderer page={pages.docs[0]} />
}

// src/app/page/[tenantId]/[slug]/page.tsx
export default async function PublishedPage({ params }) {
  const { tenantId, slug } = await params
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: 'pages',
    where: {
      tenantId: { equals: tenantId },
      slug: { equals: slug },
      _status: { equals: 'published' }, // ONLY published
    },
  })

  if (!pages.docs.length) {
    return <PageNotFound />
  }

  return <PageRenderer page={pages.docs[0]} />
}
````

````

### 3. Add Multi-Design System Architecture

Add new section **5.8 Design System Architecture:**

```markdown
## 5.8 Design System Architecture

### Component Mapping Strategy

```typescript
// src/components/PageRenderer/index.tsx
const DESIGN_SYSTEM_COMPONENTS = {
  untitledui: {
    hero: UntitledUIHeroSection,
    features: UntitledUIFeaturesSection,
    cta: UntitledUICTASection,
    text: UntitledUITextSection,
  },
  shadcn: {
    hero: ShadcnHeroSection,
    features: ShadcnFeaturesSection,
    cta: ShadcnCTASection,
    text: ShadcnTextSection,
  },
} as const

export function PageRenderer({ page }: { page: PayloadPage }) {
  const designSystem = page.designSystem || 'untitledui'
  const components = DESIGN_SYSTEM_COMPONENTS[designSystem]

  return (
    <main className="min-h-screen">
      {page.sections.map((section, index) => {
        const Component = components[section.blockType]
        if (!Component) {
          console.warn(`Unknown section type: ${section.blockType}`)
          return null
        }
        return <Component key={index} {...section} />
      })}
    </main>
  )
}
````

### Adding New Design Systems

To add a new design system (e.g., Material UI):

1. **Create component implementations:**

   ```
   src/components/PageRenderer/sections/material-ui/
   ├── HeroSection.tsx
   ├── FeaturesSection.tsx
   ├── CTASection.tsx
   └── index.ts
   ```

2. **Update DESIGN_SYSTEM_COMPONENTS mapping:**

   ```typescript
   const DESIGN_SYSTEM_COMPONENTS = {
     untitledui: { ... },
     shadcn: { ... },
     'material-ui': { // NEW
       hero: MaterialUIHeroSection,
       features: MaterialUIFeaturesSection,
       cta: MaterialUICTASection,
     },
   }
   ```

3. **Update PageSpec type:**

   ```typescript
   interface PageSpec {
     designSystem: 'untitledui' | 'shadcn' | 'material-ui'; // Add new option
     // ... other fields
   }
   ```

4. **Update validation schema:**
   ```typescript
   const pageSpecSchema = z.object({
     designSystem: z.enum(['untitledui', 'shadcn', 'material-ui']).default('untitledui'),
     // ... other fields
   });
   ```

### Design System Isolation

Each design system:

- Has isolated component implementations
- Uses its own CSS/Tailwind configuration
- No shared styles or classes between systems
- Prevents style bleeding across tenants

**Example Directory Structure:**

```
src/components/PageRenderer/
├── index.tsx                 # Main renderer with design system selection
└── sections/
    ├── untitled-ui/
    │   ├── HeroSection.tsx
    │   ├── FeaturesSection.tsx
    │   └── CTASection.tsx
    └── shadcn/
        ├── HeroSection.tsx
        ├── FeaturesSection.tsx
        └── CTASection.tsx
```

````

### 4. Update Success Criteria

**Section 11 - Add New Criteria:**

```markdown
## 11. Success Criteria

The system is successful when:

- [ ] AI can generate a complete landing page using Untitled UI components
- [ ] AI can generate a complete landing page using Shadcn UI components (NEW)
- [ ] Pages can specify design system via `designSystem` field (NEW)
- [ ] Preview route `/preview/[tenantId]/[slug]` works for draft pages (NEW)
- [ ] Published route `/page/[tenantId]/[slug]` works for published pages (NEW)
- [ ] Draft pages are NOT accessible via `/page/` route (NEW)
- [ ] Serialized PageSpec is stored in Payload
- [ ] Tenants can edit content using Payload admin
- [ ] Pages render identically inside the preview route and the published route
- [ ] No tenant can ever access another tenant's pages
- [ ] Design systems are isolated (no style bleeding) (NEW)
- [ ] LobeChat can show page previews reliably
- [ ] All unit tests pass (100% pass rate)
- [ ] All integration tests pass (100% pass rate)
- [ ] All E2E tests pass (100% pass rate)
````

---

## Gap Analysis: Current PRD vs New Requirements

### Gaps Identified

| Requirement                          | Current PRD Status | Gap                                                    |
| ------------------------------------ | ------------------ | ------------------------------------------------------ |
| **Multi-Design System Support**      | ❌ Not mentioned   | CRITICAL - PRD only specifies Untitled UI              |
| **`designSystem` Field in PageSpec** | ❌ Missing         | CRITICAL - No field for design system selection        |
| **Dual Route Structure**             | ⚠️ Partial         | Preview route exists, but no `/page/` route documented |
| **Payload CMS Draft Status**         | ✅ Mentioned       | OK - Payload drafts are mentioned                      |
| **Design System Extensibility**      | ❌ Not mentioned   | CRITICAL - No architecture for multiple systems        |
| **Component Isolation**              | ❌ Not mentioned   | CRITICAL - No guidance on preventing style bleeding    |
| **Hello World Test First**           | ❌ Not mentioned   | CRITICAL - No TDD workflow documented                  |

### Required PRD Updates

1. **Add `designSystem` field to PageSpec** (Section 5.1)
2. **Document dual route structure** (Section 5.4)
3. **Add design system architecture** (New Section 5.8)
4. **Update success criteria** (Section 11)
5. **Add extensibility guidelines** (Section 10 - Future Considerations)

---

## Test Execution Order (TDD Workflow)

### Step 1: Write All Tests (BEFORE Implementation)

```bash
# 1. Create test files (all tests will FAIL initially)
touch tests/e2e/page-builder/hello-world.spec.ts
touch tests/e2e/page-builder/multi-design-system.spec.ts
touch tests/e2e/page-builder/tenant-isolation.spec.ts
touch src/libs/payload/__tests__/pageSpec.test.ts
touch src/components/PageRenderer/__tests__/PageRenderer.test.tsx

# 2. Copy test code from this document into each file

# 3. Run tests to confirm they FAIL
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'
bunx vitest run --silent='passed-only' 'PageRenderer.test.tsx'
npx playwright test tests/e2e/page-builder/
```

**Expected Result:** ALL tests should FAIL (no implementation exists yet)

### Step 2: Implement Minimum Code to Pass Tests

```bash
# 1. Create PageSpec schema
touch src/libs/payload/schemas/pageSpec.ts

# 2. Create API routes
touch src/app/api/pages/create/route.ts
touch src/app/api/pages/[id]/publish/route.ts

# 3. Create preview routes
touch src/app/preview/[tenantId]/[slug]/page.tsx
touch src/app/page/[tenantId]/[slug]/page.tsx

# 4. Create PageRenderer component
touch src/components/PageRenderer/index.tsx
touch src/components/PageRenderer/sections/untitled-ui/HeroSection.tsx
touch src/components/PageRenderer/sections/shadcn/HeroSection.tsx

# 5. Run tests iteratively until ALL pass
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'
# ... fix implementation ...
# ... repeat until passing ...

npx playwright test tests/e2e/page-builder/hello-world.spec.ts
# ... fix implementation ...
# ... repeat until passing ...
```

**Expected Result:** ALL tests should PASS after implementation

### Step 3: Verify Complete Test Coverage

```bash
# Run all tests with coverage
bunx vitest run --silent='passed-only' --coverage

# Run all E2E tests
npx playwright test

# Verify coverage meets 70-80% threshold
# Check HTML coverage report
open coverage/app/index.html
```

---

## Test Command Reference

### Unit Tests (Vitest)

```bash
# Run specific test file
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'

# Run specific test by name
bunx vitest run --silent='passed-only' -t "should validate complete PageSpec"

# Run with coverage
bunx vitest run --silent='passed-only' --coverage 'PageRenderer.test.tsx'

# Watch mode (for development)
bunx vitest 'pageSpec.test.ts'
```

### E2E Tests (Playwright)

```bash
# Run all page-builder E2E tests
npx playwright test tests/e2e/page-builder/

# Run specific test file
npx playwright test tests/e2e/page-builder/hello-world.spec.ts

# Run specific test by name
npx playwright test tests/e2e/page-builder/ --grep "hello world"

# Run with UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

---

## Acceptance Criteria

### Phase 1 Complete When:

- ✅ Hello World E2E test passes
- ✅ `/preview/[tenantId]/[slug]` route works
- ✅ Untitled UI components render
- ✅ Publishing moves page to `/page/[tenantId]/[slug]`

### Phase 2 Complete When:

- ✅ Multi-design system tests pass
- ✅ Both Untitled UI and Shadcn UI render correctly
- ✅ `designSystem` field validation works
- ✅ Design systems are isolated (no style bleeding)

### Phase 3 Complete When:

- ✅ Tenant isolation tests pass
- ✅ Cross-tenant access blocked at preview route
- ✅ Cross-tenant access blocked at published route
- ✅ Same slug works across different tenants

### Phase 4 Complete When:

- ✅ PageSpec validation unit tests pass
- ✅ All required fields validated
- ✅ Invalid values rejected

### Phase 5 Complete When:

- ✅ PageRenderer component tests pass
- ✅ Both design systems render correctly
- ✅ Section order preserved
- ✅ Unknown sections handled gracefully

### Overall Success When:

- ✅ ALL tests pass (100% pass rate)
- ✅ Test coverage ≥ 70%
- ✅ TypeScript strict mode (no errors)
- ✅ ESLint + Prettier passing
- ✅ PRD updated with all new requirements

---

## Implementation Checklist

### Before Starting Implementation:

- [ ] All test files created and reviewed
- [ ] All tests run and FAIL (expected)
- [ ] Team understands TDD workflow
- [ ] PRD updates approved

### During Implementation:

- [ ] Implement minimal code to pass one test at a time
- [ ] Run tests frequently (after each small change)
- [ ] Never skip a failing test
- [ ] Refactor only when tests are passing

### After Implementation:

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Coverage report generated and reviewed
- [ ] TypeScript strict mode enabled and passing
- [ ] Linters passing
- [ ] PRD updated
- [ ] Documentation complete

---

## Appendix: Test File Locations

```
lobe-builder/
├── tests/
│   ├── e2e/
│   │   └── page-builder/
│   │       ├── hello-world.spec.ts          # Phase 1
│   │       ├── multi-design-system.spec.ts  # Phase 2
│   │       └── tenant-isolation.spec.ts     # Phase 3
│   └── setup.ts                             # Existing setup
├── src/
│   ├── libs/
│   │   └── payload/
│   │       ├── __tests__/
│   │       │   └── pageSpec.test.ts         # Phase 4
│   │       └── schemas/
│   │           └── pageSpec.ts              # To be created
│   └── components/
│       └── PageRenderer/
│           ├── __tests__/
│           │   └── PageRenderer.test.tsx    # Phase 5
│           └── index.tsx                    # To be created
└── vitest.config.mts                        # Existing config
```

---

## Next Steps

1. **Review this test plan** with the team
2. **Approve PRD updates** before implementation
3. **Create all test files** (copy code from this document)
4. **Run tests to confirm they FAIL** (expected behavior)
5. **Begin implementation** to make tests pass
6. **Iterate** until all tests pass
7. **Verify coverage** meets 70-80% threshold
8. **Update PRD** with final documentation

---

**Remember:** TESTS FIRST, IMPLEMENTATION SECOND. This is TDD.
