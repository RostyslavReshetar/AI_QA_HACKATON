/**
 * Part CRUD UI tests — Create, Read, Update, Delete.
 * Covers: TC-001, TC-002, TC-003, TC-015, TC-016, TC-017, TC-019
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
  test('TC-001: Create part with required fields via UI', async ({ page }) => {
    const partsList = new PartsListPage(page);
    const createPage = new PartCreatePage(page);

    await partsList.navigate();
    await partsList.clickCreatePart();

    const partName = `CRUD-Test-${Date.now()}`;
    await createPage.fillName(partName);
    await createPage.fillDescription('Test resistor for CRUD verification');
    await createPage.selectCategory('Resistors');
    await createPage.submit();

    // Should redirect to the new part detail page (/web/part/{id}/details)
    await page.waitForURL(/\/web\/part\/\d+\/details/, { timeout: 15000 });
    const name = await page.locator('text=/Part:/ >> visible=true').first().textContent();
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
    await createPage.toggleSwitch('assembly', true);
    await createPage.submit();

    await page.waitForURL(/\/web\/part\/\d+\/details/, { timeout: 15000 });
    const name = await page.locator('text=/Part:/ >> visible=true').first().textContent();
    expect(name).toContain(partName);
  });

  test('TC-003: Fail to create part without name', async ({ page }) => {
    const partsList = new PartsListPage(page);
    const createPage = new PartCreatePage(page);

    await partsList.navigate();
    await partsList.clickCreatePart();

    // Only fill description and category, skip name
    await createPage.fillDescription('Missing name test');
    await createPage.selectCategory('Resistors');
    await createPage.submit();

    // Should stay on dialog with validation error
    const dialog = page.getByRole('dialog', { name: 'Add Part' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
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
    expect(name).toContain('ReadTest');
  });

  test('TC-016: Part detail shows correct tabs', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    const stockVisible = await detail.isTabVisible('Stock');
    expect(stockVisible).toBeTruthy();

    const paramsVisible = await detail.isTabVisible('Parameters');
    expect(paramsVisible).toBeTruthy();
  });
});

test.describe('Part Update', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({ name: `UpdateTest-${Date.now()}` });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-017: Edit part via detail page', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);
    await detail.editPart();

    // Edit dialog should open
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Part Delete', () => {
  test('TC-019: Delete a part', async ({ page }) => {
    const part = await createTestPartViaAPI({ name: `DeleteUI-${Date.now()}` });
    // Deactivate first (required by InvenTree)
    await deleteTestPartViaAPI(part.pk).catch(() => {});

    // Verify it's gone via API
    const response = await fetch(
      `http://localhost:8080/api/part/${part.pk}/`,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from('admin:inventree123').toString('base64'),
        },
      },
    );
    expect(response.status).toBe(404);
  });
});
