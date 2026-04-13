import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['html'], ['list']],
  timeout: 30_000,
  use: {
    baseURL: process.env.INVENTREE_URL || 'http://localhost:8080',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
});
