import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load environment variables from .env.e2e for E2E tests
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

/**
 * Playwright configuration for LobeChat E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  
  
// Fail the build on CI if you accidentally left test.only in the source code
forbidOnly: !!process.env.CI,

  
  

// Run tests in files in parallel
fullyParallel: true,

  
  

// Configure projects for major browsers
projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  
  


// Reporter to use
reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],

  
  



// Retry on CI only
retries: process.env.CI ? 2 : 0,

  
  


// Test directory
testDir: './tests/e2e',

  
  

// Shared settings for all the projects below
use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3010',

    
    // Screenshot on failure
screenshot: 'only-on-failure',

    
    // Collect trace when retrying the failed test
trace: 'on-first-retry',

    // Video on failure
    video: 'retain-on-failure',
  },

  
  

// Run your local dev server before starting the tests
webServer: {
    command: 'bun run dev',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    url: 'http://localhost:3010',
  },

  
  // Opt out of parallel tests on CI
workers: process.env.CI ? 1 : undefined,
});
