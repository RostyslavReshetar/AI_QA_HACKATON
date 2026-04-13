```typescript
import { test as base, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.resolve(__dirname, '../.auth/admin-state.json');

/**
 * Performs a fresh login and saves browser storage state.
 * Call this once in global setup, then reuse the state file in tests.
 */
export async function saveAdminAuthState(page: Page): Promise<void> {
  const dir = path.dirname(AUTH_STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.goto('http://localhost:8080/web/login');
  await page.waitForLoadState('networkidle');

  await page.fill('#login-username', 'admin');
  await page.fill('#login-password', 'inventree123');
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');

  await page.waitForURL(/^(?!.*\/web\/login).*$/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');

  await page.context().storageState({ path: AUTH_STATE_PATH });
}

export function getAuthStatePath(): string {
  return AUTH_STATE_PATH;
}

/**
 * Extended test fixture that provides an authenticated page without
 * re-logging in on every test. Requires global setup to have run first.
 */
type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_STATE_PATH,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
```