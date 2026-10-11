import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the accessibility gate (separate from Vitest unit tests).
 *
 * Boots `vite preview` on 4173 and runs the a11y spec against it. No backend and
 * no real login: the spec seeds a fake auth token in localStorage so the
 * ProtectedRoute lets the app shell render, and axe-core audits that shell.
 *
 * Chromium is reused from the Playwright cache (CI installs it with
 * `npx playwright install --with-deps chromium`).
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.a11y.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run build && npm run start -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
