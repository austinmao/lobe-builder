/**
 * Payload CMS Verification Tests
 *
 * Tests to verify:
 * 1. Payload CMS loads without hydration errors (FIXED)
 * 2. Payload CMS login functionality works
 * 3. Tenant data API is accessible
 */
import { expect, test } from '@playwright/test';

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3011';
const CEREMONIA_EMAIL = 'admin@ceremoniacircle.org';
const CEREMONIA_PASSWORD = 'ceremonia_secure_password_123';

test.describe('Payload CMS Verification', () => {
  test('1. should load Payload admin without hydration errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);

        // Check for hydration-specific errors
        if (
          text.toLowerCase().includes('hydration') ||
          text.toLowerCase().includes('did not match') ||
          text.toLowerCase().includes('cannot appear as a child')
        ) {
          hydrationErrors.push(text);
        }
      }
    });

    // Navigate to Payload admin
    console.log(`Navigating to ${PAYLOAD_URL}/admin`);
    await page.goto(`${PAYLOAD_URL}/admin`);

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    // Log all errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:', consoleErrors.length);
      consoleErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }

    if (hydrationErrors.length > 0) {
      console.log('Hydration errors detected:', hydrationErrors.length);
      hydrationErrors.forEach((err, idx) => {
        console.log(`  HYDRATION ${idx + 1}. ${err}`);
      });
    }

    // BLOCKING: Should have no hydration errors
    expect(hydrationErrors).toEqual([]);

    // Check if login form is visible (any label containing "email")
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailField).toBeVisible({ timeout: 10_000 });
  });

  test('2. should login to Payload CMS successfully', async ({ page }) => {
    console.log(`Logging into ${PAYLOAD_URL}/admin`);

    await page.goto(`${PAYLOAD_URL}/admin`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    // Find and fill email field
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.waitFor({ state: 'visible', timeout: 10_000 });
    await emailField.fill(CEREMONIA_EMAIL);

    // Find and fill password field
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    await passwordField.waitFor({ state: 'visible', timeout: 10_000 });
    await passwordField.fill(CEREMONIA_PASSWORD);

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for navigation after login
    await page.waitForURL(/admin/, { timeout: 15_000 });

    const currentUrl = page.url();
    console.log('Post-login URL:', currentUrl);

    // Should NOT show "Something went wrong" error
    const errorText = page.getByText(/something went wrong/i);
    const hasError = await errorText.isVisible().catch(() => false);

    expect(hasError).toBe(false);

    // URL should not be on login page anymore
    expect(currentUrl).not.toContain('/login');

    // Should see admin dashboard elements (e.g., navigation, collections)
    // Wait a bit for dashboard to load
    await page.waitForTimeout(2000);

    // Check for common Payload admin elements
    const hasAdminElements =
      (await page
        .locator('nav')
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator('[data-type="collections"]')
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/collections|tenants|users/i)
        .isVisible()
        .catch(() => false));

    expect(hasAdminElements).toBe(true);
  });

  test('3. should access tenant API data', async ({ request }) => {
    // Login via API to get auth token
    console.log('Logging in via API...');

    const loginResponse = await request.post(`${PAYLOAD_URL}/api/users/login`, {
      data: {
        email: CEREMONIA_EMAIL,
        password: CEREMONIA_PASSWORD,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    const loginData = await loginResponse.json();
    console.log('Login successful:', {
      email: loginData.user?.email,
      hasTenants: !!loginData.user?.tenants,
      tenantCount: loginData.user?.tenants?.length,
    });

    expect(loginData.token).toBeDefined();
    expect(loginData.user).toBeDefined();
    expect(loginData.user.email).toBe(CEREMONIA_EMAIL);

    // Fetch Ceremonia tenant
    console.log('Fetching Ceremonia tenant...');

    const tenantResponse = await request.get(
      `${PAYLOAD_URL}/api/tenants?where[slug][equals]=ceremonia`,
      {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
        },
      },
    );

    expect(tenantResponse.ok()).toBeTruthy();

    const tenantData = await tenantResponse.json();
    console.log('Tenant data:', {
      found: tenantData.docs?.length > 0,
      hasDomain: !!tenantData.docs?.[0]?.domain,
      name: tenantData.docs?.[0]?.name,
      slug: tenantData.docs?.[0]?.slug,
    });

    expect(tenantData.docs).toBeDefined();
    expect(tenantData.docs.length).toBeGreaterThan(0);

    const tenant = tenantData.docs[0];
    expect(tenant.slug).toBe('ceremonia');
    expect(tenant.name).toBeDefined();

    // Verify tenant has domain-related fields (even if null)
    expect(tenant).toHaveProperty('domain');
    expect(tenant).toHaveProperty('domainStatus');
    expect(tenant).toHaveProperty('domainVerificationRecords');
  });
});
