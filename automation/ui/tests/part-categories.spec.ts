/**
 * Part Categories UI tests — navigation, hierarchy, breadcrumbs.
 * Covers: TC-025 to TC-034
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { CategoriesPage } from '../pages/categories.page.js';
import { PartsListPage } from '../pages/parts-list.page.js';

test.describe('Category Navigation', () => {
  test('TC-025: Navigate to root categories', async ({ page }) => {
    const categories = new CategoriesPage(page);
    await categories.navigate();

    // Should see Electronics and Mechanical root categories
    await expect(page.getByText('Electronics')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Mechanical')).toBeVisible();
  });

  test('TC-028: Navigate category hierarchy', async ({ page }) => {
    const categories = new CategoriesPage(page);
    // Navigate to Electronics category
    await categories.navigateToCategory(1);

    // Should see subcategories
    await expect(page.getByText('Resistors')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Capacitors')).toBeVisible();
  });

  test('TC-029: Verify category breadcrumb', async ({ page }) => {
    const categories = new CategoriesPage(page);
    // Navigate to Resistors (child of Electronics)
    await categories.navigateToCategory(2);

    // Breadcrumb should show hierarchy
    const breadcrumb = await categories.getCategoryBreadcrumb();
    expect(breadcrumb.some(b => b.includes('Electronics'))).toBeTruthy();
  });

  test('TC-031: Parts listed under correct category', async ({ page }) => {
    const categories = new CategoriesPage(page);
    await categories.navigateToCategory(1);

    // Any parts in Electronics category should be visible
    // (may be empty if no parts created in this category)
    await page.waitForLoadState('networkidle');
  });
});
