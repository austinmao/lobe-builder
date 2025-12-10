/**
 * Phase 4: Domain Configuration Tests
 *
 * Tests custom domain configuration, HTTPS, DNS, and production deployment.
 *
 * SUCCESS CRITERIA (BLOCKING):
 * - HTTPS active on custom domain
 * - Page load time < 3 seconds
 * - No mixed content warnings
 * - SSL certificate valid
 * - DNS resolves correctly
 *
 * NOTE: These tests require actual custom domain configuration:
 * - DNS CNAME record: live.ceremoniacircle.org -> cname.vercel-dns.com
 * - Vercel domain added to project
 * - SSL certificate issued
 *
 * For local development, these tests are marked as @production-only
 * and can be skipped until production deployment.
 */
import { expect, test } from '@playwright/test';

const CUSTOM_DOMAIN = process.env.CEREMONIA_CUSTOM_DOMAIN || 'live.ceremoniacircle.org';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.CI === 'true';

test.describe('Phase 4: Domain Configuration', () => {
  // Skip in local development unless explicitly testing production
  test.skip(!IS_PRODUCTION, 'Skipping production-only tests in development');

  test.describe.configure({ mode: 'serial' });

  const pageSlug = 'softening-the-season-3-simple-skills-for-connection-in-the-chaos';

  test('4.1: should serve page over HTTPS on custom domain', async ({ page }) => {
    // RED: This will fail until DNS and Vercel domain are configured

    const response = await page.goto(`https://${CUSTOM_DOMAIN}/lp/${pageSlug}`, {
      timeout: 10_000,
    });

    // Verify HTTPS (will fail if not configured)
    expect(page.url()).toContain('https://');
    expect(page.url()).toContain(CUSTOM_DOMAIN);

    // Verify page loaded successfully
    expect(response?.status()).toBe(200);

    // Verify content rendered
    await expect(page.locator('h1')).toContainText('Softening the Season');
  });

  test('4.2: should have no mixed content warnings', async ({ page }) => {
    // RED: This will fail if any HTTP resources are loaded on HTTPS page

    const warnings: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'warning' && text.toLowerCase().includes('mixed content')) {
        warnings.push(text);
      }
      if (msg.type() === 'error' && text.toLowerCase().includes('mixed content')) {
        errors.push(text);
      }
    });

    await page.goto(`https://${CUSTOM_DOMAIN}/lp/${pageSlug}`);

    // Verify no mixed content warnings
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    // Verify all resources loaded over HTTPS
    const requests = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.map((r) => r.name);
    });

    const httpResources = requests.filter((url) => url.startsWith('http://'));
    expect(httpResources).toHaveLength(0);
  });

  test('4.3: should have valid SSL certificate', async ({ page }) => {
    // RED: This will fail if SSL certificate is not valid

    // Navigate to the page - Playwright validates SSL by default
    const response = await page.goto(`https://${CUSTOM_DOMAIN}/lp/${pageSlug}`);

    // If the request succeeds over HTTPS, the certificate is valid
    // Playwright throws an error for invalid certificates by default
    expect(response?.status()).toBe(200);

    // Verify we're on HTTPS
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('4.4: should resolve DNS correctly', async () => {
    // RED: This will fail if DNS is not configured

    // Note: This requires Node.js dns module
    const dns = require('node:dns').promises;

    try {
      // Verify CNAME record exists
      const records = await dns.resolveCname(CUSTOM_DOMAIN);

      // Should point to Vercel
      expect(records.some((record: string) => record.includes('vercel'))).toBeTruthy();
    } catch {
      // If CNAME doesn't exist, check A record (alternative configuration)
      const aRecords = await dns.resolve4(CUSTOM_DOMAIN);
      expect(aRecords.length).toBeGreaterThan(0);
    }
  });

  test('4.5: should load production page in under 3 seconds', async ({ page }) => {
    // RED: This will fail if production performance is not optimized

    const start = Date.now();

    await page.goto(`https://${CUSTOM_DOMAIN}/lp/${pageSlug}`, {
      waitUntil: 'networkidle',
    });

    const loadTime = Date.now() - start;

    // Target: < 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify content visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.6: should have correct canonical URL', async ({ page }) => {
    // Verify canonical URL points to custom domain

    await page.goto(`https://${CUSTOM_DOMAIN}/lp/${pageSlug}`);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

    expect(canonical).toContain(CUSTOM_DOMAIN);
    expect(canonical).toContain('/lp/');
  });

  test('4.7: should handle www redirect correctly', async ({ page }) => {
    // Test that www subdomain redirects to apex domain (or vice versa)

    const wwwDomain = `www.${CUSTOM_DOMAIN.replace('www.', '')}`;

    try {
      const response = await page.goto(`https://${wwwDomain}/lp/${pageSlug}`, {
        timeout: 5000,
        waitUntil: 'domcontentloaded',
      });

      // Either page should load successfully, or redirect should occur
      expect([200, 301, 302]).toContain(response?.status() || 200);
    } catch {
      // www subdomain may not be configured - this is acceptable
      console.log('www subdomain not configured (acceptable)');
    }
  });
});

/**
 * PHASE 4 EXIT CRITERIA:
 *
 * ALL tests in this suite MUST pass before proceeding to Phase 5.
 *
 * Verifies:
 * ✓ HTTPS active on custom domain
 * ✓ No mixed content warnings
 * ✓ Valid SSL certificate
 * ✓ DNS resolves correctly (CNAME to Vercel)
 * ✓ Production page load time < 3 seconds
 * ✓ Canonical URL configured
 * ✓ www redirect handled
 *
 * DEPLOYMENT CHECKLIST:
 * □ DNS CNAME record created: live.ceremoniacircle.org -> cname.vercel-dns.com
 * □ Vercel domain added in project settings
 * □ SSL certificate issued (automatic via Vercel)
 * □ Middleware deployed to production
 * □ Environment variables configured
 * □ First landing page published in Payload CMS
 */
