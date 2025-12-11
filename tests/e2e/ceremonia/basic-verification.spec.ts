/**
 * Basic Verification Tests
 *
 * Tests to verify:
 * 1. Tenant settings route redirects to Clerk login when unauthenticated
 * 2. Payload CMS login works without hydration errors
 * 3. Payload API is accessible
 *
 * NOTE: Full E2E tests with UI interactions require a Clerk test user.
 * These tests verify infrastructure is properly set up.
 */
import { expect, test } from '@playwright/test';

test.describe('Basic Functionality Verification', () => {
  test('1. should redirect to Clerk login when accessing tenant settings unauthenticated', async ({
    page,
  }) => {
    // Navigate to tenant settings without auth
    await page.goto('/settings/tenant');

    // Wait for redirect (don't use networkidle as Clerk keeps making requests)
    await page.waitForLoadState('domcontentloaded');

    // Should see Clerk login UI
    // Wait for the sign-in heading to appear
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });

    // Verify Clerk login form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('2. should have Payload API accessible for tenant queries', async ({ request }) => {
    // Test direct Payload API access (no auth required for tenant read)
    const response = await request.get('http://localhost:3011/api/tenants');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('docs');
    expect(data.docs).toBeInstanceOf(Array);

    // Find Ceremonia tenant
    const ceremoniaTenant = data.docs.find((t: any) => t.slug === 'ceremonia');
    expect(ceremoniaTenant).toBeDefined();
    expect(ceremoniaTenant.name).toBe('Ceremonia');

    // Verify domain-related fields exist in schema
    expect(ceremoniaTenant).toHaveProperty('domain');
    expect(ceremoniaTenant).toHaveProperty('domainStatus');
    expect(ceremoniaTenant).toHaveProperty('domainVerificationRecords');
  });
});

test.describe('Payload CMS Verification', () => {
  test('3. should load Payload admin without hydration errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to Payload admin
    await page.goto('http://localhost:3011/admin');
    await page.waitForLoadState('networkidle');

    // Check for hydration errors
    const hydrationErrors = consoleErrors.filter(
      (err) => err.includes('hydration') || err.includes('Hydration'),
    );

    console.log('Console errors:', consoleErrors);
    console.log('Hydration errors:', hydrationErrors);

    // Should have no hydration errors
    expect(hydrationErrors.length).toBe(0);

    // Check if login form is visible
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
  });

  test('4. should login to Payload CMS successfully via API', async ({ request }) => {
    // Test Payload login via API directly (more reliable than UI form)
    const response = await request.post('http://localhost:3011/api/users/login', {
      data: {
        email: 'admin@ceremoniacircle.org',
        password: 'ceremonia_secure_password_123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify login was successful
    expect(data.message).toBe('Authentication Passed');
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('admin@ceremoniacircle.org');

    // Verify user has tenants (Ceremonia)
    expect(data.user.tenants).toBeDefined();
    expect(data.user.tenants.length).toBeGreaterThan(0);
  });
});

test.describe('tRPC API Verification', () => {
  test('5. should have tRPC healthcheck endpoint working', async ({ request }) => {
    const response = await request.get('http://localhost:3010/trpc/lambda/healthcheck');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.result.data.json).toBe("i'm live!");
  });

  test('6. should have domain.getTenant endpoint return tenant data', async ({ request }) => {
    // This endpoint uses publicProcedure so it should return tenant data without auth
    const response = await request.get(
      'http://localhost:3010/trpc/lambda/domain.getTenant?batch=1&input={"0":{"json":{"slug":"ceremonia"}}}',
    );

    // Should get a JSON response (not HTML 404 page)
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');

    const data = await response.json();

    // tRPC returns an array when using batch mode
    expect(Array.isArray(data)).toBe(true);

    // Should have result with tenant data
    const result = data[0]?.result?.data?.json;
    expect(result).toBeDefined();
    expect(result.tenant).toBeDefined();
    expect(result.tenant.slug).toBe('ceremonia');
    expect(result.tenant.name).toBe('Ceremonia');

    console.log('tRPC getTenant response:', JSON.stringify(result, null, 2));
  });
});
