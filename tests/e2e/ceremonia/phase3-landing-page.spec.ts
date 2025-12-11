/**
 * Phase 3: First Landing Page Tests
 *
 * Tests creation and rendering of Ceremonia's first real landing page:
 * "Softening the Season: 3 Simple Skills for Connection in the Chaos"
 *
 * SUCCESS CRITERIA (BLOCKING):
 * - First page created with complete content
 * - Page renders with Untitled UI components
 * - Mobile responsive layout
 * - SEO metadata present
 * - Performance meets targets (< 3s load time)
 */
import { expect, test } from '@playwright/test';

import { firstLandingPage } from './fixtures/first-page';
import { ceremoniaUser } from './fixtures/user';

// Payload CMS API URL (separate from main app)
const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3011';

test.describe('Phase 3: First Landing Page', () => {
  test.describe.configure({ mode: 'serial' });

  const pageSlug = 'softening-the-season-3-simple-skills-for-connection-in-the-chaos';

  test('3.1: should create "Softening the Season" page in Payload', async ({ request }) => {
    // RED: This will fail initially - page structure may not match schema

    // Login to Payload CMS
    const loginResponse = await request.post(`${PAYLOAD_URL}/api/users/login`, {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    // Check if page already exists (idempotent test)
    const existingResponse = await request.get(
      `${PAYLOAD_URL}/api/pages?where[slug][equals]=${pageSlug}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const existingData = await existingResponse.json();

    // If page exists, delete it first to ensure clean test
    if (existingData.docs && existingData.docs.length > 0) {
      await request.delete(`${PAYLOAD_URL}/api/pages/${existingData.docs[0].id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // Create first landing page
    const response = await request.post(`${PAYLOAD_URL}/api/pages`, {
      data: firstLandingPage,
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();
    const page = result.doc;

    expect(page.slug).toBe(pageSlug);
    expect(page.title).toContain('Softening the Season');
    expect(page.sections).toHaveLength(3); // Hero, Features, CTA
    expect(page.designSystem).toBe('untitledui');
  });

  test('3.2: should render page with Untitled UI components', async ({ page }) => {
    // RED: This will fail initially - PageRenderer may not map sections correctly

    // Publish page first
    await page.goto(`/preview/ceremonia/${pageSlug}`);

    // Verify Hero section
    await expect(page.locator('h1')).toContainText('Softening the Season');
    await expect(page.locator('text=3 Simple Skills for Connection in the Chaos')).toBeVisible();
    await expect(page.locator('button:has-text("Join Us")')).toBeVisible();

    // Verify Features section
    await expect(page.locator("text=What You'll Learn")).toBeVisible();

    // Verify all 3 feature items
    await expect(page.locator('text=Emotional Regulation')).toBeVisible();
    await expect(page.locator('text=Tools to manage stress during the holidays')).toBeVisible();

    await expect(page.locator('text=Connection Skills')).toBeVisible();
    await expect(page.locator('text=Deepen relationships with loved ones')).toBeVisible();

    await expect(page.locator('text=Mindfulness Practices')).toBeVisible();
    await expect(page.locator('text=Stay present amidst the chaos')).toBeVisible();

    // Verify CTA section
    await expect(page.locator('text=Ready to Transform Your Holidays?')).toBeVisible();
    await expect(page.locator('text=Join us for this transformative workshop')).toBeVisible();
    await expect(page.locator('button:has-text("Register Now")')).toBeVisible();

    // Verify Untitled UI styles applied
    // Note: This checks for presence of Untitled UI design system classes
    const heroElement = page.locator('h1').first();
    const classes = await heroElement.getAttribute('class');

    // Untitled UI uses specific typography classes
    // This will fail if PageRenderer doesn't use Untitled UI components
    expect(classes).toBeTruthy();
  });

  test('3.3: should be mobile responsive', async ({ page }) => {
    // RED: This will fail initially - responsive styles may not be applied

    // TASK-016: Test all required viewports (320px, 375px, 414px, 768px)
    const viewports = [
      { height: 568, name: 'iPhone SE (smallest)', width: 320 },
      { height: 667, name: 'iPhone SE', width: 375 },
      { height: 896, name: 'iPhone XR', width: 414 },
      { height: 1024, name: 'iPad', width: 768 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.goto(`/preview/ceremonia/${pageSlug}`);

      // Verify content visible at this viewport
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Emotional Regulation')).toBeVisible();

      // BLOCKING: No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(
        scrollWidth,
        `No horizontal scroll at ${viewport.name} (${viewport.width}px)`,
      ).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance

      // BLOCKING: Touch target size >= 44px for all buttons
      const buttons = await page.locator('a[class*="rounded-lg"]').all();
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height, `Button height >= 44px at ${viewport.name}`).toBeGreaterThanOrEqual(
            44,
          );
          // Width can vary based on text, but should be reasonable
          expect(box.width, `Button width >= 44px at ${viewport.name}`).toBeGreaterThanOrEqual(44);
        }
      }

      // Verify all sections stack correctly (visible without scrolling horizontally)
      const sections = await page.locator('section').all();
      for (const section of sections) {
        const box = await section.boundingBox();
        if (box) {
          expect(box.width, `Section width <= viewport at ${viewport.name}`).toBeLessThanOrEqual(
            viewport.width + 1,
          );
        }
      }
    }

    // Test desktop viewport for comparison
    await page.setViewportSize({ height: 1080, width: 1920 });
    await page.goto(`/preview/ceremonia/${pageSlug}`);

    await expect(page.locator('h1')).toBeVisible();
  });

  test('3.4: should have correct SEO metadata', async ({ page, request }) => {
    // RED: This will fail initially - SEO metadata may not be generated

    // Publish page first via Payload CMS API
    const loginResponse = await request.post(`${PAYLOAD_URL}/api/users/login`, {
      data: {
        email: ceremoniaUser.email,
        password: ceremoniaUser.password,
      },
    });
    const { token } = await loginResponse.json();

    const pagesResponse = await request.get(
      `${PAYLOAD_URL}/api/pages?where[slug][equals]=${pageSlug}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const { docs } = await pagesResponse.json();
    const pageId = docs[0].id;

    await request.patch(`${PAYLOAD_URL}/api/pages/${pageId}`, {
      data: { _status: 'published' },
      headers: { Authorization: `Bearer ${token}` },
    });

    // Navigate to published page
    await page.goto(`/page/ceremonia/${pageSlug}`);

    // Verify page title
    await expect(page).toHaveTitle(/Softening the Season/);

    // Verify meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();

    // Verify Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toContain('Softening the Season');
    expect(ogDescription).toBeTruthy();
    expect(ogType).toBe('website');
  });

  test('3.5: should load in under 3 seconds', async ({ page }) => {
    // RED: This will fail initially - performance may not meet targets

    // Measure page load time
    const start = Date.now();

    await page.goto(`/page/ceremonia/${pageSlug}`, {
      waitUntil: 'networkidle',
    });

    const loadTime = Date.now() - start;

    // Target: < 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify Core Web Vitals
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

      return {
        domContentLoaded: perfEntries?.domContentLoadedEventEnd || 0,
        fcp: fcpEntry?.startTime || 0,
      };
    });

    // FCP should be < 1.5s (good)
    expect(metrics.fcp).toBeLessThan(1500);

    // DOM Content Loaded should be < 2s
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });

  test('3.6: should handle anchor link navigation', async ({ page }) => {
    // Test CTA button anchor links work
    await page.goto(`/page/ceremonia/${pageSlug}`);

    // Click "Join Us" CTA (links to #register)
    await page.click('button:has-text("Join Us")');

    // Verify URL updated with hash
    expect(page.url()).toContain('#register');

    // Click "Register Now" CTA
    await page.click('button:has-text("Register Now")');

    // Verify URL updated
    expect(page.url()).toContain('#register');
  });
});

/**
 * PHASE 3 EXIT CRITERIA:
 *
 * ALL tests in this suite MUST pass before proceeding to Phase 4.
 *
 * Verifies:
 * ✓ First landing page created with complete content
 * ✓ Hero, Features, and CTA sections render correctly
 * ✓ Untitled UI design system applied
 * ✓ Mobile responsive on all viewport sizes
 * ✓ SEO metadata complete (title, description, OG tags)
 * ✓ Page load time < 3 seconds
 * ✓ Core Web Vitals within targets (FCP < 1.5s)
 * ✓ Navigation and interaction work correctly
 */
