/**
 * Part BOM UI tests.
 * Covers: TC-070, TC-071
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import { createTestPartViaAPI, CleanupRegistry } from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();
test.afterAll(async () => { await cleanup.cleanupAll(); });

test.describe('BOM Management', () => {
  let assemblyPart: { pk: number; name: string };

  test.beforeAll(async () => {
    assemblyPart = await createTestPartViaAPI({
      name: `Assembly-${Date.now()}`,
      assembly: true,
    });
    cleanup.registerPart(assemblyPart.pk);
  });

  test('TC-070: BOM tab visible for assembly parts', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(assemblyPart.pk);

    // InvenTree shows "Bill of Materials" or "BOM" in sidebar
    const bomVisible = await detail.isTabVisible('Bill of Materials');
    const bomShort = await detail.isTabVisible('BOM');
    expect(bomVisible || bomShort).toBeTruthy();
  });

  test('TC-071: Navigate to BOM tab', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(assemblyPart.pk);

    const bomVisible = await detail.isTabVisible('Bill of Materials');
    await detail.goToTab(bomVisible ? 'Bill of Materials' : 'BOM');
    await page.waitForLoadState('networkidle');
  });
});
