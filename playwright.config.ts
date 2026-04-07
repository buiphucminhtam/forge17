import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 * Multi-browser, multi-viewport, accessibility-first testing setup
 * For forgewright project
 */
export default defineConfig({
  testDir: './tests/e2e/ui',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-results.json' }],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Chromium
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // WebKit
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewport tests
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'chromium-tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },

  outputDir: './test-results',
});
