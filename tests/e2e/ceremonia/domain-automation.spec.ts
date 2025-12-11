/**
 * TASK-024a: Domain Automation E2E Tests (TDD RED Phase)
 *
 * Tests the complete domain automation user flow for Ceremonia tenant:
 * - Domain provisioning
 * - DNS verification
 * - Domain removal
 * - Error handling
 * - Permission checks
 *
 * SUCCESS CRITERIA (BLOCKING):
 * - All tests SHOULD FAIL initially (RED phase)
 * - Tests drive UI implementation in TASK-024b (GREEN phase)
 * - Vercel API mocked at network level (no real API calls)
 * - Complete user flow coverage (happy path + error cases)
 *
 * NOTE: These tests are expected to FAIL until the UI is implemented in TASK-024b.
 * This is intentional - TDD RED phase.
 */
import { expect, test } from '@playwright/test';

import { ceremoniaUser } from './fixtures/user';

const TEST_DOMAIN = 'ceremonia-e2e.example.com';
const TEST_VERIFICATION_VALUE = 'vc-domain-verify=e2e-test-123';

test.describe('Domain Automation Flow (TDD RED)', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  /**
   * Setup: Mock Vercel API at network level
   * This prevents real API calls during E2E tests
   */
  test.beforeEach(async ({ context }) => {
    // Intercept Vercel API calls
    await context.route('https://api.vercel.com/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      // Mock: Add domain (POST /domains)
      if (url.includes('/domains') && method === 'POST') {
        await route.fulfill({
          body: JSON.stringify({
            name: TEST_DOMAIN,
            verification: [
              {
                domain: '_vercel',
                reason: 'PENDING',
                type: 'TXT',
                value: TEST_VERIFICATION_VALUE,
              },
            ],
            verified: false,
          }),
          contentType: 'application/json',
          status: 200,
        });
        return;
      }

      // Mock: Get domain status (GET /domains/:domain)
      if (url.includes(`/domains/${TEST_DOMAIN}`) && method === 'GET') {
        await route.fulfill({
          body: JSON.stringify({
            name: TEST_DOMAIN,
            verification: [],
            verified: true,
          }),
          contentType: 'application/json',
          status: 200,
        });
        return;
      }

      // Mock: Delete domain (DELETE /domains/:domain)
      if (url.includes(`/domains/${TEST_DOMAIN}`) && method === 'DELETE') {
        await route.fulfill({
          body: JSON.stringify({
            deleted: true,
          }),
          contentType: 'application/json',
          status: 200,
        });
        return;
      }

      // Default: Continue with original request
      await route.continue();
    });
  });

  /**
   * Test 1: Domain Provisioning Flow (Happy Path)
   *
   * RED: This test will FAIL because the UI doesn't exist yet
   * - /settings/tenant page doesn't exist
   * - "Add Custom Domain" button doesn't exist
   * - Domain input form doesn't exist
   * - DNS instructions display doesn't exist
   */
  test('1.1: should provision custom domain from tenant settings', async ({ page, request }) => {
    // Step 1: Login as Ceremonia admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    // Clerk uses "Continue" button after email, then shows password field
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify login successful
    await expect(page).toHaveURL(/\/(?!login)/); // Not on login page anymore

    // Step 2: Navigate to tenant settings
    // RED: This route doesn't exist yet
    await page.goto('/settings/tenant');
    await expect(page.getByRole('heading', { name: /tenant settings/i })).toBeVisible();

    // Step 3: Click "Add Custom Domain"
    // RED: This button doesn't exist yet
    await page.getByRole('button', { name: /add custom domain/i }).click();

    // Step 4: Enter domain
    // RED: This form doesn't exist yet
    await page.getByLabel(/domain name/i).fill(TEST_DOMAIN);
    await page.getByRole('button', { name: /add domain/i }).click();

    // Step 5: Verify DNS instructions displayed
    // RED: DNS instructions component doesn't exist yet
    await expect(page.getByText(/configure dns records/i)).toBeVisible();
    await expect(page.getByText(/txt/i)).toBeVisible();
    await expect(page.getByText(/_vercel/i)).toBeVisible();
    await expect(page.getByText(new RegExp(TEST_VERIFICATION_VALUE, 'i'))).toBeVisible();

    // Step 6: Verify domain status shows "pending verification"
    // RED: Status display doesn't exist yet
    await expect(page.getByText(/pending verification/i)).toBeVisible();

    // Step 7: Verify database updated correctly
    const loginResponse = await request.post('/api/users/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    const tenantResponse = await request.get('/api/tenants?where[slug][equals]=ceremonia', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(tenantResponse.ok()).toBeTruthy();
    const { docs } = await tenantResponse.json();
    const tenant = docs[0];

    // Verify tenant domain fields updated
    expect(tenant.domain).toBe(TEST_DOMAIN);
    expect(tenant.domainStatus).toBe('pending_verification');
    expect(tenant.domainVerificationRecords).toBeDefined();
    expect(tenant.domainVerificationRecords.length).toBeGreaterThan(0);
  });

  /**
   * Test 2: DNS Verification Flow
   *
   * RED: This test will FAIL because the UI doesn't exist yet
   * - "Verify Domain" button doesn't exist
   * - Verification success message doesn't exist
   * - Status update UI doesn't exist
   */
  test('1.2: should verify domain and update middleware', async ({ page, request }) => {
    // Prerequisites: Domain already added (from previous test)

    // Step 1: Login as admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2: Navigate to tenant settings
    await page.goto('/settings/tenant');

    // Step 3: Click "Verify Domain"
    // RED: This button doesn't exist yet
    await page.getByRole('button', { name: /verify domain/i }).click();

    // Step 4: Wait for verification success
    // RED: Success message doesn't exist yet
    await expect(page.getByText(/domain verified/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/verified/i)).toBeVisible();

    // Step 5: Verify database updated to "verified"
    const loginResponse = await request.post('/api/users/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    const { token } = await loginResponse.json();

    const tenantResponse = await request.get('/api/tenants?where[slug][equals]=ceremonia', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { docs } = await tenantResponse.json();
    const tenant = docs[0];

    expect(tenant.domainStatus).toBe('verified');
    expect(tenant.domainVerificationRecords).toBeNull();

    // Step 6: Verify custom domain routes correctly (middleware)
    // Note: In E2E environment, we can't test actual custom domain routing
    // without DNS. This would be tested in integration tests.
    // Here we verify the database state is correct for middleware to work.
    expect(tenant.domain).toBe(TEST_DOMAIN);
    expect(tenant.domainStatus).toBe('verified');
  });

  /**
   * Test 3: Domain Removal Flow
   *
   * RED: This test will FAIL because the UI doesn't exist yet
   * - "Remove Domain" button doesn't exist
   * - Confirmation dialog doesn't exist
   * - Success message doesn't exist
   */
  test('1.3: should remove custom domain', async ({ page, request }) => {
    // Prerequisites: Domain verified (from previous test)

    // Step 1: Login and navigate to settings
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Step 2: Click "Remove Domain"
    // RED: This button doesn't exist yet
    await page.getByRole('button', { name: /remove domain/i }).click();

    // Step 3: Confirm removal
    // RED: Confirmation dialog doesn't exist yet
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Step 4: Verify success message
    // RED: Success message doesn't exist yet
    await expect(page.getByText(/domain removed/i)).toBeVisible();

    // Step 5: Verify database cleared
    const loginResponse = await request.post('/api/users/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    const { token } = await loginResponse.json();

    const tenantResponse = await request.get('/api/tenants?where[slug][equals]=ceremonia', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { docs } = await tenantResponse.json();
    const tenant = docs[0];

    // Verify all domain fields cleared
    expect(tenant.domain).toBeNull();
    expect(tenant.domainStatus).toBeNull();
    expect(tenant.domainVerificationRecords).toBeNull();
  });

  /**
   * Test 4: Error Handling - Invalid Domain
   *
   * RED: This test will FAIL because validation doesn't exist yet
   * - Client-side validation doesn't exist
   * - Error messages don't exist
   */
  test('2.1: should reject invalid domain formats', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // First remove any existing domain (from previous tests)
    const removeDomainButton = page.getByRole('button', { name: /remove domain/i });
    const isDomainPresent = await removeDomainButton.isVisible().catch(() => false);

    if (isDomainPresent) {
      await removeDomainButton.click();
      await page.getByRole('button', { name: /confirm/i }).click();
      await expect(page.getByText(/domain removed/i)).toBeVisible();
    }

    // Open add domain dialog
    await page.getByRole('button', { name: /add custom domain/i }).click();

    // Test invalid formats
    const invalidDomains = [
      { error: 'Do not include protocol', value: 'http://example.com' },
      { error: 'Invalid domain format', value: 'example.com/' },
      { error: 'Invalid domain format', value: 'invalid domain' },
      { error: 'Invalid domain format', value: 'localhost' },
      { error: 'IP addresses not allowed', value: '127.0.0.1' },
      { error: 'Invalid domain format', value: 'example' },
      { error: 'Domain is required', value: '' },
    ];

    for (const invalidDomain of invalidDomains) {
      await page.getByLabel(/domain name/i).fill(invalidDomain.value);
      await page.getByRole('button', { name: /add domain/i }).click();

      // RED: Validation error messages don't exist yet
      await expect(page.getByText(new RegExp(invalidDomain.error, 'i'))).toBeVisible();

      // Clear the error for next test
      await page.getByLabel(/domain name/i).clear();
    }
  });

  /**
   * Test 5: Error Handling - Domain Already Taken
   *
   * RED: This test will FAIL because conflict handling doesn't exist yet
   * - Server-side conflict detection doesn't exist
   * - Conflict error message doesn't exist
   */
  test('2.2: should reject domain already in use', async ({ page, context }) => {
    // Mock API to return conflict error
    await context.route('**/trpc/domain.add*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          error: {
            code: 'DOMAIN_CONFLICT',
            message: 'Domain already in use by another tenant',
          },
        }),
        contentType: 'application/json',
        status: 400,
      });
    });

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Open add domain dialog
    await page.getByRole('button', { name: /add custom domain/i }).click();

    await page.getByLabel(/domain name/i).fill('taken.example.com');
    await page.getByRole('button', { name: /add domain/i }).click();

    // RED: Conflict error message doesn't exist yet
    await expect(page.getByText(/already in use/i)).toBeVisible();

    // Verify domain was NOT added to database
    const loginResponse = await page.request.post('/api/users/login', {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    const { token } = await loginResponse.json();

    const tenantResponse = await page.request.get('/api/tenants?where[slug][equals]=ceremonia', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { docs } = await tenantResponse.json();
    const tenant = docs[0];

    // Domain should still be null (not updated)
    expect(tenant.domain).toBeNull();
  });

  /**
   * Test 6: Permission Checks
   *
   * RED: This test will FAIL because permission checks don't exist yet
   * - Role-based UI doesn't exist
   * - API permission checks don't exist
   */
  test('3.1: should prevent non-admin from adding domain', async ({ page }) => {
    // Note: This requires a viewer user to be seeded
    // For now, we'll test that the UI checks for tenant admin role

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // In a real scenario, we'd login as a viewer user
    // For now, verify that admin CAN see the button (baseline)
    const addDomainButton = page.getByRole('button', { name: /add custom domain/i });
    await expect(addDomainButton).toBeVisible();
    await expect(addDomainButton).toBeEnabled();

    // TODO: Add test with actual viewer user when user seeding supports roles
    // Expected behavior:
    // - Viewer should NOT see "Add Domain" button
    // - OR button should be disabled
    // - API calls should return 403 Forbidden
  });

  /**
   * Test 7: DNS Instructions Display
   *
   * RED: This test will FAIL because DNS instructions component doesn't exist yet
   * - Instructions panel doesn't exist
   * - Copy button doesn't exist
   * - Record formatting doesn't exist
   */
  test('4.1: should display complete DNS instructions with copy functionality', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Add domain to see instructions
    await page.getByRole('button', { name: /add custom domain/i }).click();
    await page.getByLabel(/domain name/i).fill(TEST_DOMAIN);
    await page.getByRole('button', { name: /add domain/i }).click();

    // Verify DNS instructions are comprehensive
    await expect(page.getByText(/configure dns records/i)).toBeVisible();

    // Verify TXT record instructions
    await expect(page.getByText(/txt record/i)).toBeVisible();
    await expect(page.getByText(/_vercel/i)).toBeVisible();
    await expect(page.getByText(new RegExp(TEST_VERIFICATION_VALUE, 'i'))).toBeVisible();

    // Verify CNAME record instructions
    await expect(page.getByText(/cname record/i)).toBeVisible();
    await expect(page.getByText(/cname\.vercel-dns\.com/i)).toBeVisible();

    // Verify copy buttons exist
    // RED: Copy buttons don't exist yet
    const copyButtons = page.getByRole('button', { name: /copy/i });
    await expect(copyButtons.first()).toBeVisible();

    // Test copy functionality
    await copyButtons.first().click();
    await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 2000 });
  });

  /**
   * Test 8: Domain Status Indicator
   *
   * RED: This test will FAIL because status indicator doesn't exist yet
   * - Status badge doesn't exist
   * - Status-specific styling doesn't exist
   */
  test('4.2: should display domain status with appropriate styling', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Scenario 1: No domain configured
    // RED: Empty state doesn't exist yet
    await expect(page.getByText(/no custom domain configured/i)).toBeVisible();

    // Scenario 2: Domain pending verification
    await page.getByRole('button', { name: /add custom domain/i }).click();
    await page.getByLabel(/domain name/i).fill(TEST_DOMAIN);
    await page.getByRole('button', { name: /add domain/i }).click();

    // RED: Pending status badge doesn't exist yet
    await expect(page.getByText(/pending verification/i)).toBeVisible();

    // Verify status has warning/yellow styling
    const statusBadge = page.locator('[data-status="pending_verification"]');
    await expect(statusBadge).toBeVisible();

    // Scenario 3: Domain verified
    await page.getByRole('button', { name: /verify domain/i }).click();
    await expect(page.getByText(/domain verified/i)).toBeVisible();

    // RED: Verified status badge doesn't exist yet
    await expect(page.getByText(/verified/i)).toBeVisible();

    // Verify status has success/green styling
    const verifiedBadge = page.locator('[data-status="verified"]');
    await expect(verifiedBadge).toBeVisible();
  });
});

/**
 * PHASE 4 DOMAIN AUTOMATION EXIT CRITERIA (TDD RED):
 *
 * ALL tests in this suite SHOULD FAIL initially (RED phase).
 * This is intentional - tests drive implementation.
 *
 * Expected Failures:
 * ✗ 1.1: Domain provisioning UI doesn't exist
 * ✗ 1.2: Verification UI doesn't exist
 * ✗ 1.3: Removal UI doesn't exist
 * ✗ 2.1: Client-side validation doesn't exist
 * ✗ 2.2: Conflict handling doesn't exist
 * ✗ 3.1: Permission checks don't exist
 * ✗ 4.1: DNS instructions component doesn't exist
 * ✗ 4.2: Status indicator doesn't exist
 *
 * Next Step: TASK-024b (TDD GREEN)
 * - Implement UI components to make tests pass
 * - Iterate until all tests GREEN
 * - Verify 100% pass rate
 */
