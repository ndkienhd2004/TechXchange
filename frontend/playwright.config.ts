import { defineConfig } from '@playwright/test';

const apiBaseURL = process.env.E2E_API_BASE_URL || 'http://localhost:3000';
const webBaseURL = process.env.E2E_WEB_BASE_URL || 'http://localhost:8080';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      name: 'api',
      testMatch: /.*api-regression\.spec\.ts/,
      use: { baseURL: apiBaseURL },
    },
    {
      name: 'ui',
      testMatch: /.*ui-smoke\.spec\.ts/,
      use: { baseURL: webBaseURL },
    },
  ],
});
