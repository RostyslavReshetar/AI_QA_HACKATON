/**
 * Cross-functional end-to-end flow test.
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import {
  createTestPartViaAPI,
  createTestCategoryViaAPI,
  CleanupRegistry,
} from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();
test.afterAll(async () => { await cleanup.cleanupAll(); });

test.describe('Cross-Functional Flow', () => {
  test('E2E: Create part → view details → verify tabs → verify in category', async ({ page }) => {
    // Step 1: Create test data via API
    const category = await createTestCategoryViaAPI(`E2E-Cat-${Date.now()}`);
    cleanup.registerCategory(category.pk);

    const part = await createTestPartViaAPI({
      name: `E2E-Part-${Date.now()}`,
      description: 'End-to-end test part',
      category: category.pk,
      assembly: true,
      component: true,
    });
    cleanup.registerPart(part.pk);

    // Step 2: Navigate to part detail and verify name
    const detail = new PartDetailPage(page);
    await detail.navigate(part.pk);
    const displayedName = await detail.getPartName();
    expect(displayedName).toContain('E2E-Part');

    // Step 3: Verify Stock sidebar item is visible
    await expect(page.getByText('Stock', { exact: true }).first()).toBeVisible({ timeout: 10000 });

    // Step 4: Navigate to Stock tab via direct URL
    await page.goto(`/web/part/${part.pk}/stock`);
    await page.waitForLoadState('networkidle');

    // Step 5: Navigate back to details
    await page.goto(`/web/part/${part.pk}/details`);
    await page.waitForLoadState('networkidle');

    // Step 6: Navigate to category parts list and verify part is listed
    await page.goto(`/web/part/category/${category.pk}/parts`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Part should be visible in the table
    await expect(page.getByText(part.name).first()).toBeVisible({ timeout: 15000 });
  });
});
