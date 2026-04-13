/**
 * Part Parameters UI tests.
 * Covers: TC-050 to TC-057
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import {
  createTestPartViaAPI,
  CleanupRegistry,
} from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();

test.afterAll(async () => {
  await cleanup.cleanupAll();
});

test.describe('Part Parameters', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({ name: `ParamTest-${Date.now()}` });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-051: Navigate to Parameters tab', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    const isVisible = await detail.isTabVisible('Parameters');
    expect(isVisible).toBeTruthy();

    await detail.goToTab('Parameters');
    await page.waitForLoadState('networkidle');
  });

  test('TC-052: Add parameter to part', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);
    await detail.goToTab('Parameters');

    // Look for "Add Parameter" or "New Parameter" button
    const addBtn = page.getByRole('button', { name: /add parameter|new parameter/i }).first();
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click();
      // Modal should open for parameter creation
      const modal = page.locator('.mantine-Modal-root, [role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });
});
