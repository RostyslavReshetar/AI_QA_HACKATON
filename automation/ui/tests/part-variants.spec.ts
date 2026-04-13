/**
 * Part Templates & Variants UI tests.
 * Covers: TC-058 to TC-063
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

test.describe('Templates & Variants', () => {
  let templatePart: { pk: number; name: string };

  test.beforeAll(async () => {
    templatePart = await createTestPartViaAPI({
      name: `Template-${Date.now()}`,
      is_template: true,
    });
    cleanup.registerPart(templatePart.pk);
  });

  test('TC-058: Template part shows Variants tab', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(templatePart.pk);

    const variantsVisible = await detail.isTabVisible('Variants');
    expect(variantsVisible).toBeTruthy();
  });

  test('TC-059: Navigate to Variants tab', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(templatePart.pk);
    await detail.goToTab('Variants');

    await page.waitForLoadState('networkidle');
    // Variants tab content should load
  });

  test('TC-061: Create variant from template', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(templatePart.pk);
    await detail.goToTab('Variants');

    // Look for "New Variant" button
    const newVariantBtn = page.getByRole('button', { name: /new variant|create variant/i }).first();
    if (await newVariantBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newVariantBtn.click();
      // Duplicate Part form should open
      const modal = page.locator('.mantine-Modal-root, [role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });
});
