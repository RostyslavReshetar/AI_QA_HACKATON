import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'storage-state.json');

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/platform/login`);
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('inventree123');
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for successful login — dashboard or main page loads
    await page.waitForURL('**/platform/**', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Save storage state
    const fs = await import('fs');
    const authDir = path.dirname(STORAGE_STATE_PATH);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log('Global setup: authentication state saved.');
  } catch (error) {
    console.error('Global setup: login failed.', error);
    await page.screenshot({ path: path.join(__dirname, 'test-results', 'global-setup-failure.png') });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
export { STORAGE_STATE_PATH };
