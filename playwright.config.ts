import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4100';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run serve:production',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      API_PORT: '4100',
      HOST: '127.0.0.1',
      APP_ORIGIN: baseURL,
      NODE_ENV: 'production',
      SERVE_STATIC: 'true',
      STATIC_DIR: 'dist',
      // E2E runs over local HTTP. Production deployments keep the secure-cookie default.
      SESSION_COOKIE_SECURE: 'false',
    },
  },
});
