/**
 * E2E Tests for Ceremonia Year Reflection Page
 *
 * Tests the interactive year reflection form at:
 * - Internal route: /page/ceremonia/ceremonia-new-year-manifestation-guide
 * - Public route: live.ceremoniacircle.org/lp/ceremonia-new-year-manifestation-guide
 */
import { expect, test } from '@playwright/test';

test.describe('Ceremonia Year Reflection Page', () => {
  // Use internal route for testing (no custom domain needed)
  const PAGE_URL = '/page/ceremonia/ceremonia-new-year-manifestation-guide';

  test('should load the page successfully', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Check page title
    await expect(page).toHaveTitle(/Ceremonia Alumni Year Reflection/);

    // Check main heading
    await expect(
      page.getByRole('heading', { name: /ceremonia alumni year reflection/i }),
    ).toBeVisible();
  });

  test('should display all 12 month sections', async ({ page }) => {
    await page.goto(PAGE_URL);

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    for (const month of months) {
      await expect(page.locator(`#month-${month.toLowerCase()}`)).toBeVisible();
    }
  });

  test('should have January accordion open by default', async ({ page }) => {
    await page.goto(PAGE_URL);

    // January should be open (expanded) - note: aria-controls uses capitalized month name
    const januaryButton = page.locator('button[aria-controls="month-content-January"]');
    await expect(januaryButton).toHaveAttribute('aria-expanded', 'true');

    // Other months should be closed
    const februaryButton = page.locator('button[aria-controls="month-content-February"]');
    await expect(februaryButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should toggle month accordion on click', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Click February to open it - note: aria-controls uses capitalized month name
    const februaryButton = page.locator('button[aria-controls="month-content-February"]');
    await februaryButton.click();
    await expect(februaryButton).toHaveAttribute('aria-expanded', 'true');

    // Click again to close it
    await februaryButton.click();
    await expect(februaryButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should display all three Zoom Out sections', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Pendulums section
    await expect(page.locator('#section-pendulums')).toBeVisible();
    await expect(page.getByRole('heading', { name: /zoom out: pendulums/i })).toBeVisible();

    // Importance section
    await expect(page.locator('#section-importance')).toBeVisible();
    await expect(page.getByRole('heading', { name: /zoom out: importance/i })).toBeVisible();

    // Next Line section
    await expect(page.locator('#section-nextline')).toBeVisible();
    await expect(page.getByRole('heading', { name: /choosing your next line/i })).toBeVisible();
  });

  test('should display state chips in Next Line section', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Check for state chip buttons - these match NEXT_LINE_STATES from types.ts
    const states = [
      'Ease',
      'Trust',
      'Presence',
      'Clarity',
      'Grounded Confidence',
      'Openness',
      'Devotion',
    ];
    for (const state of states) {
      await expect(page.getByRole('radio', { name: state })).toBeVisible();
    }
  });

  test('should save form data to localStorage', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Fill in January's "stoodOut" field - field ID uses capitalized month name
    const stoodOutField = page.locator('#January-stoodOut');
    await stoodOutField.fill('Test entry for January');

    // Wait for autosave
    await page.waitForTimeout(500);

    // Verify localStorage has data - key may vary by year
    const storageData = await page.evaluate(() => {
      // Check for any ceremonia reflection data key
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ceremonia-year-reflection')) {
          return localStorage.getItem(key);
        }
      }
      return null;
    });
    expect(storageData).toBeTruthy();
    expect(storageData).toContain('Test entry for January');
  });

  test('should persist data on page reload', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Fill in data - field ID uses capitalized month name
    const stoodOutField = page.locator('#January-stoodOut');
    await stoodOutField.fill('Persistent test data');

    // Wait for autosave
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Check data is still there
    await expect(stoodOutField).toHaveValue('Persistent test data');
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Check progress indicator exists - matches "0/12 months completed" format
    await expect(page.getByText(/0\/12 months completed/)).toBeVisible();
  });

  test('should display sticky navigation', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Scroll down to make sticky nav visible
    await page.evaluate(() => window.scrollTo(0, 500));

    // Check sticky nav elements
    await expect(page.locator('.sticky-nav')).toBeVisible();
    await expect(page.getByRole('combobox', { name: /jump to month/i })).toBeVisible();
  });

  test('should have export buttons', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Check export buttons in sticky nav - use exact match for "Print" to avoid matching "Print / PDF"
    await expect(page.getByRole('button', { name: /json/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /md/i })).toBeVisible();
    await expect(page.getByRole('button', { exact: true, name: 'Print' })).toBeVisible();
  });

  test('should open clear data modal', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Click clear button
    await page.getByRole('button', { name: /clear/i }).click();

    // Check modal is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/clear all data\?/i)).toBeVisible();
  });

  test('should clear data when confirmed', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Fill in some data first - field ID uses capitalized month name
    const stoodOutField = page.locator('#January-stoodOut');
    await stoodOutField.fill('Data to be cleared');
    await page.waitForTimeout(500);

    // Open modal and confirm clear
    await page.getByRole('button', { name: /clear/i }).click();
    await page.getByRole('button', { name: /clear all data/i }).click();

    // Verify data is cleared
    await expect(stoodOutField).toHaveValue('');
  });

  test('should display closing mantra', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check closing mantra text
    await expect(page.getByText(/i don't need to force the future/i)).toBeVisible();
  });
});
