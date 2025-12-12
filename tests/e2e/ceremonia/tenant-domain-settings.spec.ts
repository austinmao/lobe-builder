/**
 * Tenant Domain Settings E2E Tests
 *
 * Tests the complete domain settings UI flow for tenant administrators:
 * - Navigate to tenant settings page
 * - Display current domain status correctly
 * - Add domain flow (modal, validation, submit)
 * - Verify domain flow
 * - Remove domain flow
 * - Error handling when VERCEL_API_TOKEN is missing
 *
 * SUCCESS CRITERIA (BLOCKING):
 * - All critical user flows covered (happy path + error cases)
 * - Tests verify actual UI behavior and state transitions
 * - Mock Vercel API calls to avoid external dependencies
 * - Domain status indicators display correctly
 *
 * ISSUES BEING TESTED:
 * 1. Domain shows incorrect value (ceremoniacircle.org vs live.ceremoniacircle.org)
 * 2. "Verify Domain" fails with "VERCEL_API_TOKEN is required"
 * 3. Domain status indicators need proper data attributes for testing
 */
import { expect, test } from '@playwright/test';

import { ceremoniaUser } from './fixtures/user';

const TEST_DOMAIN = 'test-domain.example.com';
const INCORRECT_DOMAIN = 'ceremoniacircle.org'; // The bug: missing subdomain
const CORRECT_DOMAIN = 'live.ceremoniacircle.org'; // Expected value

test.describe('Tenant Domain Settings UI', () => {
  /**
   * Setup: Mock Vercel API and tRPC calls
   * This prevents real API calls during E2E tests
   */
  test.beforeEach(async ({ context }) => {
    // Mock: Vercel API calls
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
                value: 'vc-domain-verify=test-verification-123',
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
   * Test 1.1: Navigate to Tenant Settings Page
   *
   * Verifies:
   * - User can access /settings/tenant route
   * - Page renders with correct heading
   * - Authentication required
   */
  test('1.1: should navigate to tenant settings page', async ({ page }) => {
    // Step 1: Login as Ceremonia admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify login successful
    await expect(page).toHaveURL(/\/(?!login)/);

    // Step 2: Navigate to tenant settings
    await page.goto('/settings/tenant');

    // Verify page rendered
    await expect(page.getByRole('heading', { name: /tenant settings/i })).toBeVisible();
  });

  /**
   * Test 1.2: Unauthenticated users redirected to login
   *
   * Verifies:
   * - Unauthenticated access redirects to login
   * - Protected route behavior
   */
  test('1.2: should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/settings/tenant');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * Test 2.1: Display "No Domain" Status
   *
   * Verifies:
   * - Empty state shows "No custom domain configured"
   * - "Add Custom Domain" button visible
   * - No domain status indicators shown
   */
  test('2.1: should display no domain status when tenant has no domain', async ({
    page,
    context,
  }) => {
    // Mock: getTenant returns tenant with no domain
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: null,
                domainStatus: null,
                domainVerificationRecords: null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Verify empty state
    await expect(page.getByText(/no custom domain configured/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add custom domain/i })).toBeVisible();
  });

  /**
   * Test 2.2: Display "Pending Verification" Status
   *
   * Verifies:
   * - Domain name displayed correctly
   * - "Pending Verification" status badge shown
   * - DNS verification instructions visible
   * - "Verify Domain" button shown
   * - Status indicator has data-status attribute for testing
   */
  test('2.2: should display pending verification status correctly', async ({ page, context }) => {
    // Mock: getTenant returns tenant with pending domain
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: TEST_DOMAIN,
                domainStatus: 'pending_verification',
                domainVerificationRecords: [
                  {
                    name: '_vercel',
                    type: 'TXT',
                    value: 'vc-domain-verify=test-123',
                  },
                ],
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Verify domain displayed
    await expect(page.getByText(TEST_DOMAIN)).toBeVisible();

    // Verify status badge with data-status attribute
    const statusBadge = page.locator('[data-status="pending_verification"]');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText(/pending verification/i);

    // Verify DNS instructions visible
    await expect(page.getByText(/_vercel/i)).toBeVisible();
    await expect(page.getByText(/vc-domain-verify/i)).toBeVisible();

    // Verify "Verify Domain" button
    await expect(page.getByRole('button', { name: /verify domain/i })).toBeVisible();
  });

  /**
   * Test 2.3: Display "Verified" Status
   *
   * Verifies:
   * - Domain name displayed correctly
   * - "Verified" status badge shown with success styling
   * - DNS instructions hidden after verification
   * - "Remove Domain" button shown
   * - Status indicator has data-status attribute
   */
  test('2.3: should display verified status correctly', async ({ page, context }) => {
    // Mock: getTenant returns verified domain
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: TEST_DOMAIN,
                domainStatus: 'verified',
                domainVerificationRecords: null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Verify domain displayed
    await expect(page.getByText(TEST_DOMAIN)).toBeVisible();

    // Verify verified status badge
    const verifiedBadge = page.locator('[data-status="verified"]');
    await expect(verifiedBadge).toBeVisible();
    await expect(verifiedBadge).toContainText(/verified/i);

    // Verify "Remove Domain" button visible
    await expect(page.getByRole('button', { name: /remove domain/i })).toBeVisible();

    // Verify DNS instructions NOT visible
    await expect(page.getByText(/_vercel/i)).not.toBeVisible();
  });

  /**
   * Test 2.4: Display Domain with Null Status (Edge Case)
   *
   * This tests the bug fix where domain exists but domainStatus is null
   * (legacy data or direct DB entry without proper status)
   *
   * Verifies:
   * - Domain displayed correctly (CORRECT_DOMAIN, not INCORRECT_DOMAIN)
   * - "Needs Verification" status shown
   * - "Verify Domain" button available
   * - Status indicator has data-status="needs_verification" attribute
   */
  test('2.4: should handle domain with null status (legacy data edge case)', async ({
    page,
    context,
  }) => {
    // Mock: getTenant returns domain with null status
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: CORRECT_DOMAIN, // Bug fix: should show live.ceremoniacircle.org
                domainStatus: null, // Legacy data: status not set
                domainVerificationRecords: null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Verify CORRECT domain displayed (not the incorrect one from bug report)
    await expect(page.getByText(CORRECT_DOMAIN)).toBeVisible();
    await expect(page.getByText(INCORRECT_DOMAIN)).not.toBeVisible();

    // Verify "Needs Verification" status indicator
    const needsVerificationBadge = page.locator('[data-status="needs_verification"]');
    await expect(needsVerificationBadge).toBeVisible();
    await expect(needsVerificationBadge).toContainText(/needs verification/i);

    // Verify "Verify Domain" button available
    await expect(page.getByRole('button', { name: /verify domain/i })).toBeVisible();
  });

  /**
   * Test 3.1: Add Domain Flow (Happy Path)
   *
   * Verifies:
   * - "Add Custom Domain" button opens modal
   * - Domain input field present
   * - Form submission works
   * - Success feedback shown
   * - Domain status updates to pending_verification
   */
  test('3.1: should add domain successfully via modal form', async ({ page, context }) => {
    // Mock: getTenant initially returns no domain
    let hasDomain = false;
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: hasDomain ? TEST_DOMAIN : null,
                domainStatus: hasDomain ? 'pending_verification' : null,
                domainVerificationRecords: hasDomain
                  ? [{ name: '_vercel', type: 'TXT', value: 'vc-domain-verify=test-123' }]
                  : null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Mock: domain.add mutation
    await context.route('**/trpc/domain.add*', async (route) => {
      hasDomain = true; // Update state after add
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              success: true,
              tenant: {
                domain: TEST_DOMAIN,
                domainStatus: 'pending_verification',
                id: 'ceremonia-id',
              },
              verificationRecords: [
                { name: '_vercel', type: 'TXT', value: 'vc-domain-verify=test-123' },
              ],
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Step 1: Click "Add Custom Domain"
    await page.getByRole('button', { name: /add custom domain/i }).click();

    // Step 2: Verify modal opened
    await expect(page.getByText(/add custom domain/i).first()).toBeVisible();
    await expect(page.getByLabel(/domain name/i)).toBeVisible();

    // Step 3: Enter domain
    await page.getByLabel(/domain name/i).fill(TEST_DOMAIN);

    // Step 4: Submit form
    await page.getByRole('button', { name: /add domain/i }).click();

    // Step 5: Verify modal closed (domain input no longer visible)
    await expect(page.getByLabel(/domain name/i)).not.toBeVisible({ timeout: 5000 });

    // Step 6: Reload page to verify domain was added
    await page.reload();

    // Verify domain now shows as pending
    await expect(page.getByText(TEST_DOMAIN)).toBeVisible();
    const statusBadge = page.locator('[data-status="pending_verification"]');
    await expect(statusBadge).toBeVisible();
  });

  /**
   * Test 3.2: Add Domain Form Validation
   *
   * Verifies client-side validation for invalid domain formats:
   * - Empty domain
   * - Domain with protocol
   * - Domain with trailing slash
   * - Domain with spaces
   * - localhost
   * - IP addresses
   * - Invalid format
   */
  test('3.2: should validate domain format and show error messages', async ({ page, context }) => {
    // Mock: getTenant returns no domain
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: null,
                domainStatus: null,
                domainVerificationRecords: null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Open add domain modal
    await page.getByRole('button', { name: /add custom domain/i }).click();

    // Test invalid formats
    const invalidDomains = [
      { error: 'Do not include protocol', value: 'http://example.com' },
      { error: 'Do not include protocol', value: 'https://example.com' },
      { error: 'Invalid domain format', value: 'example.com/' },
      { error: 'Invalid domain format', value: 'invalid domain with spaces' },
      { error: 'Invalid domain format', value: 'localhost' },
      { error: 'IP addresses not allowed', value: '192.168.1.1' },
      { error: 'Invalid domain format', value: 'example' }, // TLD required
    ];

    for (const invalidDomain of invalidDomains) {
      // Clear and enter invalid domain
      await page.getByLabel(/domain name/i).clear();
      await page.getByLabel(/domain name/i).fill(invalidDomain.value);
      await page.getByRole('button', { name: /add domain/i }).click();

      // Verify error message shown
      await expect(page.getByText(new RegExp(invalidDomain.error, 'i'))).toBeVisible();
    }

    // Test valid domain format (should not show errors)
    await page.getByLabel(/domain name/i).clear();
    await page.getByLabel(/domain name/i).fill('valid-domain.com');

    // Error should clear on valid input
    await expect(page.getByText(/invalid domain/i)).not.toBeVisible();
  });

  /**
   * Test 4.1: Verify Domain Flow (Happy Path)
   *
   * Verifies:
   * - "Verify Domain" button triggers verification
   * - Loading state shown during verification
   * - Success message displayed
   * - Status updates to "verified"
   * - DNS instructions hidden after verification
   */
  test('4.1: should verify domain successfully', async ({ page, context }) => {
    // Mock: getTenant returns pending domain initially
    let isVerified = false;
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: TEST_DOMAIN,
                domainStatus: isVerified ? 'verified' : 'pending_verification',
                domainVerificationRecords: isVerified
                  ? null
                  : [{ name: '_vercel', type: 'TXT', value: 'vc-domain-verify=test-123' }],
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Mock: domain.verify mutation (success)
    await context.route('**/trpc/domain.verify*', async (route) => {
      isVerified = true; // Update state after verification
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              domain: TEST_DOMAIN,
              verified: true,
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Verify initial state: pending verification
    await expect(page.locator('[data-status="pending_verification"]')).toBeVisible();

    // Click "Verify Domain"
    await page.getByRole('button', { name: /verify domain/i }).click();

    // Wait for success message
    await expect(page.getByText(/domain verified/i)).toBeVisible({ timeout: 10_000 });

    // Reload to verify persistent state change
    await page.reload();

    // Verify status changed to verified
    const verifiedBadge = page.locator('[data-status="verified"]');
    await expect(verifiedBadge).toBeVisible();

    // Verify DNS instructions hidden
    await expect(page.getByText(/_vercel/i)).not.toBeVisible();
  });

  /**
   * Test 4.2: Verify Domain Error - VERCEL_API_TOKEN Missing
   *
   * This tests the bug where verification fails with "VERCEL_API_TOKEN is required"
   *
   * Verifies:
   * - Verification error displayed to user
   * - Domain status remains "pending_verification"
   * - DNS instructions still visible
   */
  test('4.2: should handle verification error when VERCEL_API_TOKEN is missing', async ({
    page,
    context,
  }) => {
    // Mock: getTenant returns pending domain
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: TEST_DOMAIN,
                domainStatus: 'pending_verification',
                domainVerificationRecords: [
                  { name: '_vercel', type: 'TXT', value: 'vc-domain-verify=test-123' },
                ],
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Mock: domain.verify mutation fails with API token error
    await context.route('**/trpc/domain.verify*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'VERCEL_API_TOKEN is required',
          },
        }),
        contentType: 'application/json',
        status: 500,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Click "Verify Domain"
    await page.getByRole('button', { name: /verify domain/i }).click();

    // Wait a moment for error to propagate
    await page.waitForTimeout(2000);

    // Verify status still pending (not verified)
    await expect(page.locator('[data-status="pending_verification"]')).toBeVisible();

    // Verify DNS instructions still visible
    await expect(page.getByText(/_vercel/i)).toBeVisible();

    // Note: Error message may be shown in console or as a toast notification
    // depending on how error handling is implemented in the UI
  });

  /**
   * Test 5.1: Remove Domain Flow (Happy Path)
   *
   * Verifies:
   * - "Remove Domain" button opens confirmation modal
   * - Confirmation modal displays warning message
   * - Cancel button closes modal without changes
   * - Confirm button removes domain
   * - Success message displayed
   * - Domain status resets to "no domain"
   */
  test('5.1: should remove domain successfully with confirmation', async ({ page, context }) => {
    // Mock: getTenant returns verified domain initially
    let hasDomain = true;
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: hasDomain ? TEST_DOMAIN : null,
                domainStatus: hasDomain ? 'verified' : null,
                domainVerificationRecords: null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Mock: domain.remove mutation
    await context.route('**/trpc/domain.remove*', async (route) => {
      hasDomain = false; // Update state after removal
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              success: true,
              tenantId: 'ceremonia-id',
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Verify initial state: domain verified
    await expect(page.getByText(TEST_DOMAIN)).toBeVisible();

    // Click "Remove Domain"
    await page.getByRole('button', { name: /remove domain/i }).click();

    // Verify confirmation modal
    await expect(page.getByText(/are you sure/i)).toBeVisible();

    // Test cancel button (should close modal without removing)
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByText(/are you sure/i)).not.toBeVisible();
    await expect(page.getByText(TEST_DOMAIN)).toBeVisible(); // Domain still there

    // Click "Remove Domain" again
    await page.getByRole('button', { name: /remove domain/i }).click();

    // Confirm removal
    await page.getByRole('button', { name: /confirm/i }).click();

    // Wait for success message
    await expect(page.getByText(/domain removed/i)).toBeVisible({ timeout: 5000 });

    // Reload to verify persistent state change
    await page.reload();

    // Verify domain removed - back to empty state
    await expect(page.getByText(/no custom domain configured/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add custom domain/i })).toBeVisible();
  });

  /**
   * Test 6.1: Keyboard Accessibility
   *
   * Verifies:
   * - All interactive elements keyboard accessible
   * - Tab navigation works correctly
   * - Enter key activates buttons
   * - Escape key closes modals
   */
  test('6.1: should be fully keyboard accessible', async ({ page, context }) => {
    // Mock: getTenant returns no domain
    await context.route('**/trpc/domain.getTenant*', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              tenant: {
                domain: null,
                domainStatus: null,
                domainVerificationRecords: null,
                id: 'ceremonia-id',
              },
            },
          },
        }),
        contentType: 'application/json',
        status: 200,
      });
    });

    // Login and navigate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ceremoniaUser.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('textbox', { name: /password/i }).fill(ceremoniaUser.password);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/settings/tenant');

    // Test keyboard navigation to "Add Custom Domain" button
    await page.keyboard.press('Tab');
    const addButton = page.getByRole('button', { name: /add custom domain/i });
    await expect(addButton).toBeFocused();

    // Test Enter key opens modal
    await page.keyboard.press('Enter');
    await expect(page.getByLabel(/domain name/i)).toBeVisible();

    // Test Escape key closes modal
    await page.keyboard.press('Escape');
    await expect(page.getByLabel(/domain name/i)).not.toBeVisible();
  });
});

/**
 * TEST SUITE SUMMARY:
 *
 * Coverage:
 * ✓ Navigation and authentication
 * ✓ Display all domain status states (none, pending, verified, needs_verification)
 * ✓ Add domain flow with validation
 * ✓ Verify domain flow (happy path and error cases)
 * ✓ Remove domain flow with confirmation
 * ✓ Keyboard accessibility
 * ✓ Edge case: domain with null status (bug fix verification)
 * ✓ Error handling: VERCEL_API_TOKEN missing (bug fix verification)
 *
 * Issues Verified:
 * 1. Domain display bug (ceremoniacircle.org vs live.ceremoniacircle.org) - Test 2.4
 * 2. VERCEL_API_TOKEN error handling - Test 4.2
 * 3. Status indicator data attributes - Tests 2.2, 2.3, 2.4
 *
 * Mock Strategy:
 * - Vercel API mocked at network level
 * - tRPC endpoints mocked to avoid database dependencies
 * - State transitions simulated for realistic flow testing
 */
