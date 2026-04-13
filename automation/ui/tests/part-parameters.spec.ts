/**
 * Part Parameters UI tests.
 * Covers: TC-051, TC-052
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import { createTestPartViaAPI, CleanupRegistry } from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();
test.afterAll(async () => { await cleanup.cleanupAll(); });

test.describe('Part Parameters', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({ name: `ParamTest-${Date.now()}` });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-051: Parameters tab is visible on part detail', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    const isVisible = await detail.isTabVisible('Parameters');
    expect(isVisible).toBeTruthy();
  });

  test('TC-052: Navigate to Parameters tab', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);
    await detail.goToTab('Parameters');

    await page.waitForLoadState('networkidle');
  });
});
