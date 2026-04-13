/**
 * Part Categories UI tests — navigation, hierarchy, breadcrumbs.
 * Covers: TC-025, TC-028, TC-029, TC-031
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { CategoriesPage } from '../pages/categories.page.js';

test.describe('Category Navigation', () => {
  test('TC-025: Navigate to Part Categories and see root categories', async ({ page }) => {
    await page.goto('/web/part/category/index/subcategories');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('cell', { name: 'Electronics' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: 'Mechanical' }).first()).toBeVisible();
  });

  test('TC-028: Navigate into Electronics category and see details', async ({ page }) => {
    const categories = new CategoriesPage(page);
    await categories.navigateToCategory(1);

    // The heading says "Part Category" and Name field shows "Electronics"
    await expect(page.getByText('Part Category')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Electronic components').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-029: Navigate to Resistors subcategory', async ({ page }) => {
    const categories = new CategoriesPage(page);
    await categories.navigateToCategory(2);

    await expect(page.getByText('Part Category')).toBeVisible({ timeout: 15000 });
    // Name cell should show "Resistors"
    await expect(page.getByText('Resistors subcategory').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-031: View parts tab in category', async ({ page }) => {
    await page.goto('/web/part/category/1/parts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 15000 });
  });
});
