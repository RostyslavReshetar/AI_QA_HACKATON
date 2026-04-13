/**
 * Part Stock UI tests.
 * Covers: TC-079, TC-080
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import { createTestPartViaAPI, CleanupRegistry } from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();
test.afterAll(async () => { await cleanup.cleanupAll(); });

test.describe('Part Stock', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({ name: `StockTest-${Date.now()}` });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-079: Stock tab is visible', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    const stockVisible = await detail.isTabVisible('Stock');
    expect(stockVisible).toBeTruthy();
  });

  test('TC-080: Navigate to Stock tab', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);
    await detail.goToTab('Stock');
    await page.waitForLoadState('networkidle');
  });
});
