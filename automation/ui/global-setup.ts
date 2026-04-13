import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'storage-state.json');

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  try {
    // Strategy: login via browser form with retries
    await page.goto(`${baseURL}/web/login`, { waitUntil: 'networkidle', timeout: 60000 });

    // Fill and submit login form
    await page.getByRole('textbox', { name: 'login-username' }).fill('admin');
    await page.getByRole('textbox', { name: 'login-password' }).fill('inventree123');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Wait for redirect — the URL changes to /web or /web/home after login
    await page.waitForURL(/\/web(?:\/|$)/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    // Extra wait for cookies to be set by the server
    await page.waitForTimeout(3000);

    let cookies = await context.cookies();
    console.log(`Global setup: browser login got ${cookies.length} cookies`);

    // Fallback: if browser login didn't yield cookies, inject via API
    if (cookies.length === 0) {
      console.log('Global setup: fallback — injecting session via API...');

      // Get CSRF token by visiting login page
      await page.goto(`${baseURL}/web/login`, { waitUntil: 'networkidle', timeout: 30000 });
      cookies = await context.cookies();
      const csrfCookie = cookies.find(c => c.name === 'csrftoken');
      const csrfToken = csrfCookie?.value || '';

      // Submit login via Django form endpoint
      const loginResponse = await page.request.post(`${baseURL}/accounts/login/`, {
        form: {
          login: 'admin',
          password: 'inventree123',
          csrfmiddlewaretoken: csrfToken,
        },
        headers: {
          'Referer': `${baseURL}/accounts/login/`,
        },
      });

      console.log(`Global setup: API login status ${loginResponse.status()}`);

      // Navigate to verify we're logged in
      await page.goto(`${baseURL}/web/home`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      cookies = await context.cookies();
      console.log(`Global setup: after API login got ${cookies.length} cookies`);
    }

    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`Global setup: auth state saved to ${STORAGE_STATE_PATH}`);

    if (cookies.length === 0) {
      console.warn('WARNING: Still no cookies — UI tests will likely fail auth');
    }
  } catch (error) {
    console.error('Global setup failed:', error);
    const resultsDir = path.join(__dirname, 'test-results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    await page.screenshot({ path: path.join(resultsDir, 'global-setup-failure.png') }).catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
export { STORAGE_STATE_PATH };
