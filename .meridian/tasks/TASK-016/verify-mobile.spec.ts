/**
 * TASK-016: Mobile Responsiveness Verification
 *
 * Standalone test to verify mobile layout at required viewports:
 * - 320px (smallest mobile)
 * - 375px (iPhone SE)
 * - 414px (iPhone XR)
 * - 768px (iPad)
 */
import { expect, test } from '@playwright/test';

const PAGE_URL =
  'http://localhost:3011/page/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos';

test.describe('TASK-016: Mobile Responsive Layout', () => {
  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE (smallest)' },
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone XR' },
    { width: 768, height: 1024, name: 'iPad' },
  ];

  for (const viewport of viewports) {
    test(`should be responsive at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to page
      await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

      // BLOCKING CRITERIA 1: No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      console.log(`[${viewport.name}] Scroll width: ${scrollWidth}, Client width: ${clientWidth}`);
      expect(
        scrollWidth,
        `No horizontal scroll at ${viewport.name} (${viewport.width}px)`,
      ).toBeLessThanOrEqual(clientWidth + 1);

      // BLOCKING CRITERIA 2: All content readable
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      const h1Text = await h1.textContent();
      console.log(`[${viewport.name}] H1 text: ${h1Text}`);

      // BLOCKING CRITERIA 3: CTA buttons have adequate touch target (>= 44px)
      const ctaButtons = await page.locator('a[class*="rounded-lg"]').all();
      console.log(`[${viewport.name}] Found ${ctaButtons.length} CTA buttons`);

      for (let i = 0; i < ctaButtons.length; i++) {
        const button = ctaButtons[i];
        const box = await button.boundingBox();

        if (box) {
          console.log(`[${viewport.name}] Button ${i + 1}: ${box.width}px x ${box.height}px`);

          expect(
            box.height,
            `Button ${i + 1} height >= 44px at ${viewport.name}`,
          ).toBeGreaterThanOrEqual(44);
          expect(
            box.width,
            `Button ${i + 1} width >= 44px at ${viewport.name}`,
          ).toBeGreaterThanOrEqual(44);
        }
      }

      // CRITERIA 4: Typography scales appropriately
      const h1FontSize = await h1.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      console.log(`[${viewport.name}] H1 font size: ${h1FontSize}`);

      // Verify responsive font scaling
      const expectedMinSize = viewport.width <= 640 ? 48 : 60; // text-5xl vs text-6xl
      const actualSize = parseFloat(h1FontSize);
      expect(actualSize, `H1 font size appropriate at ${viewport.name}`).toBeGreaterThanOrEqual(
        expectedMinSize,
      );

      // Verify sections don't overflow
      const sections = await page.locator('section').all();
      console.log(`[${viewport.name}] Found ${sections.length} sections`);

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const box = await section.boundingBox();

        if (box) {
          expect(
            box.width,
            `Section ${i + 1} width <= viewport at ${viewport.name}`,
          ).toBeLessThanOrEqual(viewport.width + 1);
        }
      }
    });
  }
});
