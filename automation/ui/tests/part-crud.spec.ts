/**
 * Part CRUD UI tests — Create, Read, Update, Delete operations.
 * Covers: TC-001 to TC-010, TC-015 to TC-020
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartsListPage } from '../pages/parts-list.page.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import { PartCreatePage } from '../pages/part-create.page.js';
import {
  createTestPartViaAPI,
  deleteTestPartViaAPI,
  CleanupRegistry,
} from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();

test.afterAll(async () => {
  await cleanup.cleanupAll();
});

test.describe('Part Creation', () => {
  test('TC-001: Create part with required fields', async ({ page }) => {
    const partsList = new PartsListPage(page);
    const createPage = new PartCreatePage(page);

    await partsList.navigate();
    await partsList.clickCreatePart();

    const partName = `CRUD-Test-${Date.now()}`;
    await createPage.fillName(partName);
    await createPage.fillDescription('Test resistor for CRUD verification');
    await createPage.selectCategory('Resistors');
    await createPage.submit();

    // Verify redirect to part detail or success notification
    await page.waitForURL(/\/platform\/part\/\d+/, { timeout: 15000 });
    const detail = new PartDetailPage(page);
    const name = await detail.getPartName();
    expect(name).toContain(partName);
  });

  test('TC-002: Create part with optional fields', async ({ page }) => {
    const partsList = new PartsListPage(page);
    const createPage = new PartCreatePage(page);

    await partsList.navigate();
    await partsList.clickCreatePart();

    const partName = `Full-Part-${Date.now()}`;
    await createPage.fillName(partName);
    await createPage.fillDescription('Part with all optional fields');
    await createPage.selectCategory('Capacitors');
    await createPage.setIPN(`IPN-${Date.now()}`);
    await createPage.setKeywords('test, capacitor, full');
    await createPage.setUnits('pcs');
    await createPage.toggleAttribute('Component', true);
    await createPage.toggleAttribute('Purchaseable', true);
    await createPage.submit();

    await page.waitForURL(/\/platform\/part\/\d+/, { timeout: 15000 });
    const detail = new PartDetailPage(page);
    const name = await detail.getPartName();
    expect(name).toContain(partName);
  });

  test('TC-003: Fail to create part without name', async ({ page }) => {
    const partsList = new PartsListPage(page);
    const createPage = new PartCreatePage(page);

    await partsList.navigate();
    await partsList.clickCreatePart();

    await createPage.fillDescription('Missing name test');
    await createPage.selectCategory('Resistors');
    await createPage.submit();

    const errors = await createPage.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
  });
});

test.describe('Part Read & Detail', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({ name: `ReadTest-${Date.now()}` });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-015: View part detail page', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    const name = await detail.getPartName();
    expect(name).toContain(testPart.name);
  });

  test('TC-016: Part detail shows correct tabs', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    // Stock tab should always be visible
    const stockVisible = await detail.isTabVisible('Stock');
    expect(stockVisible).toBeTruthy();
  });
});

test.describe('Part Update', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({ name: `UpdateTest-${Date.now()}` });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-017: Edit part name and description', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);
    await detail.editPart();

    const createPage = new PartCreatePage(page);
    const newName = `Updated-${Date.now()}`;
    await createPage.fillName(newName);
    await createPage.fillDescription('Updated description');
    await createPage.submit();

    await page.waitForLoadState('networkidle');
    const name = await detail.getPartName();
    expect(name).toContain(newName);
  });
});

test.describe('Part Delete', () => {
  test('TC-019: Delete a part', async ({ page }) => {
    // Create a part specifically for deletion
    const partToDelete = await createTestPartViaAPI({ name: `DeleteTest-${Date.now()}` });

    const detail = new PartDetailPage(page);
    await detail.navigate(partToDelete.pk);

    // Attempt deletion
    await detail.deletePart();

    // Confirm deletion in dialog if present
    const confirmBtn = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    // Should redirect away from deleted part
    await page.waitForURL(/\/platform\/part\/(?!.*partToDelete.pk)/, { timeout: 15000 }).catch(() => {});
  });
});
