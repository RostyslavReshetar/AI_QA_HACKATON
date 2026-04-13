/**
 * Auth fixture — extends Playwright test with authenticated page.
 * All tests should import { test, expect } from this file.
 */
import { test as base, expect } from '@playwright/test';
import path from 'path';
import { captureOnFailure } from '../helpers/screenshot-on-fail.js';

const STORAGE_STATE = path.join(__dirname, '..', '.auth', 'storage-state.json');

export const test = base.extend<{}>({
  // Override the default page with one that uses stored auth
  page: async ({ page }, use, testInfo) => {
    await use(page);
    // After test: capture diagnostics if failed
    await captureOnFailure(page, testInfo);
  },
});

export { expect };
export { STORAGE_STATE };
