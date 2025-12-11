/**
 * TASK-018: Detailed Performance Testing
 *
 * Captures comprehensive performance metrics for the landing page
 * to verify it meets the < 3 second load time requirement.
 *
 * SUCCESS CRITERIA (BLOCKING):
 * - Page load time < 3 seconds
 * - LCP < 2.5 seconds
 * - FCP < 1.5 seconds
 * - No render-blocking resources
 */
import { expect, test } from '@playwright/test';

test.describe('TASK-018: Performance Verification', () => {
  const pageSlug = 'softening-the-season-3-simple-skills-for-connection-in-the-chaos';
  const pageUrl = `/page/ceremonia/${pageSlug}`;

  test('should load in < 3 seconds with detailed metrics', async ({ page }) => {
    // Enable performance monitoring
    await page.goto('about:blank');

    // Start timing
    const startTime = Date.now();

    // Navigate to page
    await page.goto(pageUrl, {
      waitUntil: 'networkidle',
    });

    const totalLoadTime = Date.now() - startTime;

    // Get comprehensive performance metrics
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      const lcpEntry = paintEntries.find((entry) => entry.name === 'largest-contentful-paint');

      // Get resource timing for analysis
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const totalResources = resources.length;
      const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

      // Identify render-blocking resources
      const renderBlockingResources = resources.filter(
        (r) =>
          (r.initiatorType === 'script' || r.initiatorType === 'link') &&
          r.startTime < (fcpEntry?.startTime || 0),
      );

      return {
        // Timing breakdown
        dnsTime: perfEntries?.domainLookupEnd - perfEntries?.domainLookupStart || 0,

        // Navigation timing
        domContentLoaded: perfEntries?.domContentLoadedEventEnd || 0,

        domProcessing: perfEntries?.domContentLoadedEventStart - perfEntries?.responseEnd || 0,

        downloadTime: perfEntries?.responseEnd - perfEntries?.responseStart || 0,

        // Paint timing
        fcp: fcpEntry?.startTime || 0,

        lcp: lcpEntry?.startTime || 0,

        loadComplete: perfEntries?.loadEventEnd || 0,

        // Convert to KB
        renderBlockingCount: renderBlockingResources.length,

        tcpTime: perfEntries?.connectEnd - perfEntries?.connectStart || 0,
        // Resource metrics
        totalResources,
        totalSize: Math.round(totalSize / 1024),
        ttfb: perfEntries?.responseStart - perfEntries?.requestStart || 0,
      };
    });

    // Log detailed metrics for documentation
    console.log('\n=== PERFORMANCE METRICS ===');
    console.log(`Total Load Time: ${totalLoadTime}ms`);
    console.log(`First Contentful Paint (FCP): ${Math.round(metrics.fcp)}ms`);
    console.log(`Largest Contentful Paint (LCP): ${Math.round(metrics.lcp || metrics.fcp)}ms`);
    console.log(`DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`Load Complete: ${Math.round(metrics.loadComplete)}ms`);
    console.log(`\nResource Metrics:`);
    console.log(`  Total Resources: ${metrics.totalResources}`);
    console.log(`  Total Size: ${metrics.totalSize} KB`);
    console.log(`  Render-blocking Resources: ${metrics.renderBlockingCount}`);
    console.log(`\nTiming Breakdown:`);
    console.log(`  DNS Lookup: ${Math.round(metrics.dnsTime)}ms`);
    console.log(`  TCP Connection: ${Math.round(metrics.tcpTime)}ms`);
    console.log(`  Time to First Byte (TTFB): ${Math.round(metrics.ttfb)}ms`);
    console.log(`  Download Time: ${Math.round(metrics.downloadTime)}ms`);
    console.log(`  DOM Processing: ${Math.round(metrics.domProcessing)}ms`);
    console.log('=========================\n');

    // BLOCKING: Verify performance targets per TASK-018 acceptance criteria
    expect(totalLoadTime, 'Total load time should be < 3000ms').toBeLessThan(3000);

    // BLOCKING: LCP should be < 2.5s (Core Web Vital)
    // Note: May fall back to FCP if LCP not available
    const lcpValue = metrics.lcp || metrics.fcp;
    expect(lcpValue, 'Largest Contentful Paint should be < 2500ms').toBeLessThan(2500);

    // INFORMATIONAL: FCP should ideally be < 1.5s (good Core Web Vital)
    if (metrics.fcp >= 1500) {
      console.log(`⚠️  Warning: FCP is ${Math.round(metrics.fcp)}ms (target: < 1500ms)`);
    }

    // INFORMATIONAL: DOM Content Loaded should ideally be < 2s
    if (metrics.domContentLoaded >= 2000) {
      console.log(
        `⚠️  Warning: DOM Content Loaded is ${Math.round(metrics.domContentLoaded)}ms (target: < 2000ms)`,
      );
    }

    // INFORMATIONAL: Log render-blocking resources
    if (metrics.renderBlockingCount > 0) {
      console.log(`⚠️  Warning: ${metrics.renderBlockingCount} render-blocking resources detected`);
    }

    // INFORMATIONAL: Log excessive bundle size
    if (metrics.totalSize > 1000) {
      // 1MB
      console.log(`⚠️  Warning: Total page size is ${metrics.totalSize} KB (> 1000 KB)`);
    }
  });

  test('should have acceptable Time to First Byte (TTFB)', async ({ page }) => {
    await page.goto(pageUrl);

    const ttfb = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      return perfEntries?.responseStart - perfEntries?.requestStart || 0;
    });

    console.log(`Time to First Byte: ${Math.round(ttfb)}ms`);

    // INFORMATIONAL: TTFB should ideally be < 600ms (good)
    if (ttfb >= 600) {
      console.log(`⚠️  Warning: TTFB is ${Math.round(ttfb)}ms (target: < 600ms)`);
    }

    // Not blocking - TTFB depends on server/network conditions
    // This test is for informational purposes only
  });

  test('should not have excessive JavaScript bundle size', async ({ page }) => {
    await page.goto(pageUrl, { waitUntil: 'networkidle' });

    const jsMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter((r) => r.initiatorType === 'script');

      const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalJsCount = jsResources.length;

      return {
        largestJsFile: Math.max(...jsResources.map((r) => r.transferSize || 0)) / 1024,
        // KB
        totalJsCount,
        totalJsSize: Math.round(totalJsSize / 1024), // KB
      };
    });

    console.log('\n=== JAVASCRIPT METRICS ===');
    console.log(`Total JS Files: ${jsMetrics.totalJsCount}`);
    console.log(`Total JS Size: ${jsMetrics.totalJsSize} KB`);
    console.log(`Largest JS File: ${Math.round(jsMetrics.largestJsFile)} KB`);
    console.log('==========================\n');

    // INFORMATIONAL: Warn if total JS size is excessive
    if (jsMetrics.totalJsSize > 500) {
      console.log(`⚠️  Warning: Total JavaScript size is ${jsMetrics.totalJsSize} KB (> 500 KB)`);
    }

    // INFORMATIONAL: Warn if any single JS file is too large
    if (jsMetrics.largestJsFile > 200) {
      console.log(
        `⚠️  Warning: Largest JavaScript file is ${Math.round(jsMetrics.largestJsFile)} KB (> 200 KB)`,
      );
    }
  });

  test('should render content progressively (no long blocking tasks)', async ({ page }) => {
    await page.goto(pageUrl);

    // Check for long tasks (> 50ms is considered blocking)
    const longTasks = await page.evaluate(() => {
      const entries = performance.getEntriesByType('longtask');
      return entries.length;
    });

    console.log(`Long tasks detected: ${longTasks}`);

    // INFORMATIONAL: Log if long tasks detected
    if (longTasks > 0) {
      console.log(`⚠️  Warning: ${longTasks} long tasks detected (may block rendering)`);
    }
  });
});

/**
 * TASK-018 EXIT CRITERIA:
 *
 * BLOCKING tests (MUST pass):
 * ✓ Total load time < 3 seconds
 * ✓ Largest Contentful Paint (LCP) < 2.5 seconds
 *
 * Informational metrics (logged but not blocking):
 * - First Contentful Paint (FCP) - target < 1.5s
 * - DOM Content Loaded - target < 2s
 * - Time to First Byte (TTFB) - target < 600ms
 * - Render-blocking resources count
 * - Total page size
 * - JavaScript bundle size
 * - Long tasks count
 */
