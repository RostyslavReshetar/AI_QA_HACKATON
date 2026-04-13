import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'storage-state.json');

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/web/login`);
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.getByRole('textbox', { name: 'login-username' }).fill('admin');
    await page.getByRole('textbox', { name: 'login-password' }).fill('inventree123');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Wait for redirect after login
    await page.waitForURL('**/web/**', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Wait a bit for all cookies/localStorage to be set
    await page.waitForTimeout(2000);

    // Save storage state (includes cookies AND localStorage)
    const authDir = path.dirname(STORAGE_STATE_PATH);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    await context.storageState({ path: STORAGE_STATE_PATH });

    // Verify we have cookies
    const cookies = await context.cookies();
    console.log(`Global setup: saved ${cookies.length} cookies, state at ${STORAGE_STATE_PATH}`);
    if (cookies.length === 0) {
      console.warn('WARNING: No cookies saved — auth may not persist between tests');
    }
  } catch (error) {
    console.error('Global setup: login failed.', error);
    const resultsDir = path.join(__dirname, 'test-results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    await page.screenshot({ path: path.join(resultsDir, 'global-setup-failure.png') });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
export { STORAGE_STATE_PATH };
