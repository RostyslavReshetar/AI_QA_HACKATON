/**
 * Screenshot and DOM capture helper for test failures.
 * Automatically captures diagnostics when a test fails.
 */
import { type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function captureOnFailure(
  page: Page,
  testInfo: { title: string; status?: string },
): Promise<void> {
  if (testInfo.status === 'passed') return;

  const safeName = testInfo.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 80);
  const timestamp = Date.now();
  const dir = path.join(process.cwd(), 'test-results', 'failure-captures');
  fs.mkdirSync(dir, { recursive: true });

  try {
    await page.screenshot({
      path: path.join(dir, `${safeName}-${timestamp}.png`),
      fullPage: true,
    });
  } catch {
    // Page may be closed
  }

  try {
    const html = await page.content();
    fs.writeFileSync(path.join(dir, `${safeName}-${timestamp}.html`), html);
  } catch {
    // Page may be closed
  }
}
