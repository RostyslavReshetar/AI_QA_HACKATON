```typescript
/**
 * Category navigation test suite.
 *
 * ★ Insight: InvenTree's category tree is a nested sidebar component. Tests here
 * verify both URL-driven navigation (direct /web/part/category/{pk}) and
 * interactive tree traversal — two distinct code paths in the frontend that
 * can break independently.
 */
import { test, expect } from '@playwright/test';
import { PartsListPage } from '../pages/parts-list.page';
import { SelfHealingLocator } from '../helpers/self-healing';
import { getAuthStatePath } from '../fixtures/auth.fixture';

test.use({ storageState: getAuthStatePath() });

// ─── TC-CAT-001: Navigate to root category page ──────────────────────────────
test('TC-CAT-001: root parts page loads with category tree visible', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();

  // Category tree sidebar should be present
  const tree = await listPage.getCategoryTree();
  await expect(tree).toBeVisible({ timeout: 10_000 });
});

// ─── TC-CAT-002: Expand parent category in tree ──────────────────────────────
test('TC-CAT-002: expand parent category shows child categories', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();

  await listPage.expandCategoryInTree('Electronics');

  // After expanding, a child category should become visible
  const childNode = page.locator(
    'aside nav :has-text("Resistors"), [data-testid="category-tree"] :has-text("Resistors")'
  ).first();
  await expect(childNode).toBeVisible({ timeout: 8_000 });
});

// ─── TC-CAT-003: Click category filters parts list ───────────────────────────
test('TC-CAT-003: clicking a category in tree filters the parts list', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();

  // Click Resistors category in the sidebar tree
  const healer = new SelfHealingLocator(page);
  const resistorsNode = await healer.findByText('Resistors', ['a', 'button', 'span', 'li'], {
    timeout: 10_000,
  });
  await resistorsNode.click();
  await listPage.waitForTableLoad();

  // URL should reflect the category navigation
  await expect(page).toHaveURL(/\/web\/part\/category\/\d+/, { timeout: 8_000 });

  // Breadcrumb should show the category
  const breadcrumbs = await listPage.getCategoryBreadcrumb();
  const hasResistors = breadcrumbs.some((b) => b.includes('Resistors'));
  expect(hasResistors).toBe(true);
});

// ─── TC-CAT-004: Direct URL navigation to category ───────────────────────────
test('TC-CAT-004: direct URL to category page loads correctly', async ({ page }) => {
  // We use category pk=1 as a known-good starting point; adjust if needed
  const listPage = new PartsListPage(page);
  await listPage.gotoCategory(1);

  // Page should load without error
  await expect(page.locator('body')).not.toContainText('404');
  await expect(page.locator('body')).not.toContainText('Not Found');

  // Category content should be present (tree or parts table)
  const content = page.locator(
    '[data-testid="parts-table"], table, [data-testid="category-tree"]'
  ).first();
  await expect(content).toBeVisible({ timeout: 10_000 });
});

// ─── TC-CAT-005: Breadcrumb navigation ──────────────────────────────────────
test('TC-CAT-005: breadcrumb links navigate correctly', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();

  // Navigate into a nested category via the tree
  await listPage.expandCategoryInTree('Electronics');
  const healer = new SelfHealingLocator(page);
  const resistorsLink = await healer.findByText('Resistors', ['a', 'li', 'span'], {
    timeout: 8_000,
  });
  await resistorsLink.click();
  await listPage.waitForTableLoad();

  // Get the breadcrumb trail
  const breadcrumbs = await listPage.getCategoryBreadcrumb();
  expect(breadcrumbs.length).toBeGreaterThan(1);

  // Click the parent breadcrumb (first breadcrumb that isn't "Resistors")
  const parentCrumb = page.locator(
    '.mantine-Breadcrumbs-root a, nav[aria-label="breadcrumb"] a'
  ).first();
  const parentHref = await parentCrumb.getAttribute('href');
  await parentCrumb.click();
  await listPage.waitForTableLoad();

  // URL should reflect the parent category
  if (parentHref) {
    await expect(page).toHaveURL(new RegExp(parentHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

// ─── TC-CAT-006: Search across all categories ────────────────────────────────
test('TC-CAT-006: search at root level finds parts across all categories', async ({ page }) => {
  const listPage = new PartsListPage(page);
  await listPage.goto();

  await listPage.searchPart('Resistor');
  await listPage.waitForTableLoad();

  // At least one result should be visible
  const rows = page.locator('table tbody tr, [data-testid="part-row"]');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ─── TC-CAT-007: Empty category shows empty state ────────────────────────────
test('TC-CAT-007: category with no parts shows empty state message', async ({ page }) => {
  // Search for something that doesn't exist
  const listPage = new PartsListPage(page);
  await listPage.goto();
  await listPage.searchPart('ZZZNORESULTSEXPECTED12345');
  await listPage.waitForTableLoad();

  const emptyState = page.locator(
    ':has-text("No results"), :has-text("No parts"), :has-text("No items"), [data-testid="empty-state"]'
  ).first();
  await expect(emptyState).toBeVisible({ timeout: 8_000 });
});
```