/**
 * Phase 1: Infrastructure Setup Tests
 *
 * Tests Payload CMS tenant infrastructure and existing route structure
 * for Ceremonia multi-page landing system.
 *
 * SUCCESS CRITERIA (BLOCKING):
 * - All tests passing
 * - Ceremonia tenant created in Payload
 * - Test page accessible at /preview/ceremonia/test-page
 * - Published page accessible at /page/ceremonia/test-page
 * - Cross-tenant isolation verified
 */
import { expect, test } from '@playwright/test';

import { testPageData } from './fixtures/test-page';
import { ceremoniaUser, otherTenantUser } from './fixtures/user';

test.describe('Phase 1: Infrastructure Setup', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  test('1.1: should create Ceremonia tenant in Payload CMS', async ({ request }) => {
    // RED: This will fail initially - tenant doesn't exist
    const response = await request.post('/api/payload/users', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
        role: ceremoniaUser.role,
        tenantId: ceremoniaUser.tenantId,
      },
    });

    // Expect 201 Created or 200 OK if user already exists
    expect([200, 201]).toContain(response.status());

    const user = await response.json();
    expect(user.tenantId).toBe('ceremonia');
    expect(user.email).toBe('admin@ceremoniacircle.org');
  });

  test('1.2: should create test page for Ceremonia tenant', async ({ request }) => {
    // RED: This will fail initially - Payload pages collection may not be configured

    // Login as Ceremonia user
    const loginResponse = await request.post('/api/payload/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    // Create test page
    const response = await request.post('/api/payload/pages', {
      data: testPageData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(201);
    const page = await response.json();
    expect(page.tenantId).toBe('ceremonia');
    expect(page.slug).toBe('test-page');
    expect(page.designSystem).toBe('untitledui');
  });

  test('1.3: should render draft page at preview route', async ({ page }) => {
    // RED: This will fail initially - preview route may not exist

    // Navigate to preview route
    const response = await page.goto('/preview/ceremonia/test-page');

    // Verify page renders
    expect(response?.status()).toBe(200);

    await expect(page.locator('h1')).toContainText('Test Hero');
    await expect(page.locator('text=Test Subtitle')).toBeVisible();
    await expect(page.locator('text=Test CTA')).toBeVisible();
  });

  test('1.4: should return 404 for draft page on published route', async ({ page }) => {
    // RED: This will fail if published route doesn't filter by _status

    // Navigate to published route (page is still draft)
    const response = await page.goto('/page/ceremonia/test-page', {
      waitUntil: 'domcontentloaded',
    });

    // Verify 404
    expect(response?.status()).toBe(404);
  });

  test('1.5: should render published page after publishing', async ({ request, page }) => {
    // RED: This will fail initially - publish workflow may not be configured

    // Login and get page
    const loginResponse = await request.post('/api/payload/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    const { token } = await loginResponse.json();

    // Find page by slug
    const pagesResponse = await request.get(
      '/api/payload/pages?where[slug][equals]=test-page&where[tenantId][equals]=ceremonia',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(pagesResponse.ok()).toBeTruthy();
    const { docs } = await pagesResponse.json();
    expect(docs).toBeDefined();
    expect(docs.length).toBeGreaterThan(0);

    const pageId = docs[0].id;

    // Publish page
    const publishResponse = await request.patch(`/api/payload/pages/${pageId}`, {
      data: { _status: 'published' },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(publishResponse.ok()).toBeTruthy();

    // Verify published route now works
    const response = await page.goto('/page/ceremonia/test-page');
    expect(response?.status()).toBe(200);

    await expect(page.locator('h1')).toContainText('Test Hero');
    await expect(page.locator('text=Test Subtitle')).toBeVisible();
  });

  test('1.6: should enforce cross-tenant isolation', async ({ request }) => {
    // RED: This will fail if access control is not enforced

    // Create other tenant user (if not exists)
    await request.post('/api/payload/users', {
      data: {
        email: otherTenantUser.email,
        password: otherTenantUser.password,
        role: otherTenantUser.role,
        tenantId: otherTenantUser.tenantId,
      },
    });

    // Login as other tenant
    const otherLoginResponse = await request.post('/api/payload/login', {
      data: {
        email: otherTenantUser.email,
        password: otherTenantUser.password,
      },
    });

    const { token: otherToken } = await otherLoginResponse.json();

    // Create page for other tenant
    const otherPageResponse = await request.post('/api/payload/pages', {
      data: {
        _status: 'published',
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'hero',
            title: 'Other Tenant Content',
          },
        ],
        slug: 'other-page',
        tenantId: 'other-tenant',
        title: 'Other Tenant Page',
        userId: 'user_other_admin',
      },
      headers: { Authorization: `Bearer ${otherToken}` },
    });

    expect(otherPageResponse.ok()).toBeTruthy();

    // Try to access other tenant's page with Ceremonia token
    const ceremoniaLoginResponse = await request.post('/api/payload/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    const { token } = await ceremoniaLoginResponse.json();

    const crossTenantResponse = await request.get(
      '/api/payload/pages?where[slug][equals]=other-page',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(crossTenantResponse.ok()).toBeTruthy();
    const { docs } = await crossTenantResponse.json();

    // Should not see other tenant's pages
    expect(docs).toHaveLength(0);
  });
});

/**
 * PHASE 1 EXIT CRITERIA:
 *
 * ALL tests in this suite MUST pass before proceeding to Phase 2.
 *
 * Verifies:
 * ✓ Ceremonia tenant created in Payload CMS
 * ✓ Pages collection configured with multi-tenancy
 * ✓ Preview route renders draft pages
 * ✓ Published route filters by _status
 * ✓ Publish workflow functional
 * ✓ Cross-tenant isolation enforced
 */
