import { defineConfig, devices } from '@playwright/test';

/**
 * Manual Playwright configuration for testing running services
 * Does NOT start webServer - expects service to already be running
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-manual' }]],
  retries: 0,

  testDir: './tests/e2e',

  use: {
    baseURL: 'http://localhost:3011',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  workers: 4,

  // NO webServer - test against already running instance
});
