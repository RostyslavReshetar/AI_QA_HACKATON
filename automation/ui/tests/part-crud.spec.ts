```typescript
/**
 * Part CRUD test suite — covers TC-PART-001 through TC-PART-007 (and partial others).
 *
 * ★ Insight: Playwright's `test.describe` groups share no state by default.
 * We deliberately avoid shared mutable state between tests so they can run in
 * parallel with `--workers` without flakiness.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { PartsListPage } from '../pages/parts-list.page';
import { PartDetailPage } from '../pages/part-detail.page';
import { SelfHealingLocator } from '../helpers/self-healing';
import { getAuthStatePath } from '../fixtures/auth.fixture';

const BASE_URL = 'http://localhost:8080';

// Re-use authenticated storage state for speed
test.use({ storageState: getAuthStatePath() });

/**
 * Helper: fills the "Create Part" dialog with provided fields.
 */
async function fillCreatePartDialog(
  page: import('@playwright/test').Page,
  fields: {
    name: string;
    category?: string;
    description?: string;
    ipn?: string;
    keywords?: string;
    link?: string;
    units?: string;
  }
): Promise<void> {
  const healer = new SelfHealingLocator(page);
  const dialog = await healer.waitForDialog();

  await healer.fillByLabel('Name', fields.name);

  if (fields.category) {
    await healer.selectMantineOption(dialog as import('@playwright/test').Locator, 'Category', fields.category);
  }
  if (fields.description) await healer.fillByLabel('Description', fields.description);
  if (fields.ipn) await healer.fillByLabel('IPN', fields.ipn);
  if (fields.keywords) await healer.fillByLabel('Keywords', fields.keywords);
  if (fields.link) await healer.fillByLabel('Link', fields.link);
  if (fields.units) await healer.fillByLabel('Units', fields.units);
}

// ─── TC-PART-001: Create part with required fields ───────────────────────────
test('TC-PART-001: create part with required fields', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  const dialog = await healer.waitForDialog();

  await fillCreatePartDialog(page, {
    name: 'Test Part Alpha',
    category: 'Resistors',
  });

  const saveBtn = dialog.locator('button:has-text("Save"), button[type="submit"]').first();
  await saveBtn.click();

  // Expect success: dialog closes and part appears in list
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 10_000 });
  await listPage.waitForTableLoad();

  const inList = await listPage.isPartInList('Test Part Alpha');
  expect(inList).toBe(true);
});

// ─── TC-PART-002: Create part with all optional fields ───────────────────────
test('TC-PART-002: create part with all optional fields', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  const dialog = await healer.waitForDialog();

  await fillCreatePartDialog(page, {
    name: 'Test Part Beta Full',
    category: 'Resistors',
    description: 'Optional desc',
    ipn: 'IPN-BETA-001',
    keywords: 'test beta resistor',
    units: 'Ohm',
  });

  // Enable boolean toggles
  for (const label of ['Active', 'Purchaseable', 'Salable', 'Trackable']) {
    const checkbox = dialog.locator(`label:has-text("${label}") input[type="checkbox"], [aria-label="${label}"]`).first();
    if (await checkbox.isVisible()) {
      const checked = await checkbox.isChecked();
      if (!checked) await checkbox.click();
    }
  }

  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 10_000 });

  await listPage.searchPart('Test Part Beta Full');
  const inList = await listPage.isPartInList('Test Part Beta Full');
  expect(inList).toBe(true);
});

// ─── TC-PART-003: Name exactly 100 characters ────────────────────────────────
test('TC-PART-003: part name exactly 100 characters is accepted', async ({ page }) => {
  const name100 = 'A'.repeat(100);
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  const dialog = await healer.waitForDialog();

  await fillCreatePartDialog(page, { name: name100, category: 'Resistors' });
  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();

  // No validation error expected
  const error = await dialog
    .locator('.mantine-InputWrapper-error, [data-error]')
    .first()
    .isVisible()
    .catch(() => false);
  expect(error).toBe(false);

  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 10_000 });
});

// ─── TC-PART-004: Name 101 characters is rejected ────────────────────────────
test('TC-PART-004: part name 101 characters shows validation error', async ({ page }) => {
  const name101 = 'B'.repeat(101);
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  const dialog = await healer.waitForDialog();

  await fillCreatePartDialog(page, { name: name101, category: 'Resistors' });
  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();

  // Dialog should remain open and show an error
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });

  const error = dialog.locator('.mantine-InputWrapper-error, [data-error], [role="alert"]').first();
  await expect(error).toBeVisible({ timeout: 5_000 });
  await expect(error).toContainText(/100|characters/i);
});

// ─── TC-PART-005: Create without required name → error ───────────────────────
test('TC-PART-005: create part without name shows validation error', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  const dialog = await healer.waitForDialog();

  // Leave name empty, select category, submit
  await healer.selectMantineOption(
    dialog as import('@playwright/test').Locator,
    'Category',
    'Resistors'
  );
  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();

  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
  const error = dialog.locator('.mantine-InputWrapper-error, [data-error]').first();
  await expect(error).toBeVisible({ timeout: 5_000 });
});

// ─── TC-PART-006: Read / view part detail ────────────────────────────────────
test('TC-PART-006: view part detail page shows correct data', async ({ page }) => {
  // Navigate to all parts, search for the seeded part, click through to detail
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.searchPart('Test Resistor 10k');

  const inList = await listPage.isPartInList('Test Resistor 10k');
  test.skip(!inList, 'Seeded part "Test Resistor 10k" not found — skipping read test');

  await listPage.clickPartName('Test Resistor 10k');

  // Verify we're on a detail page
  await page.waitForURL(/\/web\/part\/\d+\//, { timeout: 10_000 });

  const detailPage = new PartDetailPage(page);
  const name = await detailPage.getPartName();
  expect(name).toContain('Test Resistor 10k');
});

// ─── TC-PART-007: Update part name ───────────────────────────────────────────
test('TC-PART-007: edit part name and verify updated value', async ({ page }) => {
  // First create a part we can safely edit
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  let dialog = await healer.waitForDialog();

  await fillCreatePartDialog(page, {
    name: 'Edit Target Part',
    category: 'Resistors',
  });
  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 10_000 });

  // Navigate to the newly created part
  await listPage.waitForTableLoad();
  await listPage.searchPart('Edit Target Part');
  await listPage.clickPartName('Edit Target Part');
  await page.waitForURL(/\/web\/part\/\d+\//, { timeout: 10_000 });

  const detailPage = new PartDetailPage(page);
  await detailPage.clickEditPart();

  dialog = await healer.waitForDialog();
  const nameInput = dialog.locator('input[aria-label="Name"], label:has-text("Name") ~ div input').first();
  await nameInput.fill('Edited Part Name');
  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 10_000 });

  const updatedName = await detailPage.getPartName();
  expect(updatedName).toContain('Edited Part Name');
});

// ─── TC-PART-008: Delete part with no stock ──────────────────────────────────
test('TC-PART-008: delete part with no stock succeeds', async ({ page }) => {
  // Create a deletable part
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.clickNewPart();

  const healer = new SelfHealingLocator(page);
  let dialog = await healer.waitForDialog();
  await fillCreatePartDialog(page, {
    name: 'Delete Me Part',
    category: 'Resistors',
  });
  await dialog.locator('button:has-text("Save"), button[type="submit"]').first().click();
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 10_000 });

  await listPage.waitForTableLoad();
  await listPage.searchPart('Delete Me Part');
  await listPage.clickPartName('Delete Me Part');
  await page.waitForURL(/\/web\/part\/\d+\//, { timeout: 10_000 });

  const detailPage = new PartDetailPage(page);
  await detailPage.clickDeletePart();

  dialog = await healer.waitForDialog();
  // Confirm deletion
  const confirmBtn = dialog.locator('button:has-text("Delete"), button:has-text("Confirm"), button[type="submit"]').first();
  await confirmBtn.click();

  // Should redirect away from the deleted part's page
  await page.waitForURL(/\/web\/part\//, { timeout: 10_000 });
  // Verify we're not on the deleted part's page anymore OR we get redirected to list
  const currentUrl = page.url();
  // The part detail page shouldn't load the deleted part successfully
  expect(currentUrl).not.toMatch(/\/web\/part\/\d+\/details/);
});

// ─── TC-PART-009: Delete part with stock is prevented ────────────────────────
test('TC-PART-009: delete part with active stock is blocked', async ({ page }) => {
  // This test requires PC-08 (a part with active stock) — we'll search for it
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.searchPart('Test Resistor 10k');

  const inList = await listPage.isPartInList('Test Resistor 10k');
  test.skip(!inList, 'Seeded part with stock not found — skipping deletion-prevention test');

  await listPage.clickPartName('Test Resistor 10k');
  await page.waitForURL(/\/web\/part\/\d+\//, { timeout: 10_000 });

  const detailPage = new PartDetailPage(page);

  // Delete button should be disabled or not present when stock exists
  const isDisabled = await detailPage.isDeleteButtonDisabled();
  expect(isDisabled).toBe(true);
});
```