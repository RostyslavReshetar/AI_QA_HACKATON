```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { SelfHealingLocator } from '../helpers/self-healing';

export class PartsListPage extends BasePage {
  private selfHealing: SelfHealingLocator;

  constructor(page: Page) {
    super(page);
    this.selfHealing = new SelfHealingLocator(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/web/part/category/index/parts');
    await this.waitForTableLoad();
  }

  async gotoCategory(categoryPk: number): Promise<void> {
    await this.navigate(`/web/part/category/${categoryPk}/parts`);
    await this.waitForTableLoad();
  }

  async clickNewPart(): Promise<void> {
    const addBtn = await this.selfHealing.find([
      '[data-testid="action-menu-add-parts"]',
      'button[aria-label="Add Parts"]',
      'button:has-text("New Part")',
      '[id="action-menu-add-parts"]',
    ]);
    await addBtn.click();
    // Click "Create Part" from the dropdown menu
    const createMenuItem = await this.selfHealing.find([
      '[data-testid="action-menu-add-parts-create-part"]',
      '[role="menuitem"]:has-text("Create Part")',
      'a:has-text("Create Part")',
      'button:has-text("Create Part")',
    ]);
    await createMenuItem.click();
  }

  async searchPart(name: string): Promise<void> {
    const searchInput = await this.selfHealing.find([
      '[data-testid="search-input"]',
      'input[placeholder*="Search"]',
      'input[type="search"]',
      '.mantine-TextInput-input[placeholder*="search" i]',
    ]);
    await searchInput.fill(name);
    await this.waitForTableLoad();
  }

  async getPartRowByName(name: string): Promise<Locator> {
    const row = this.page.locator(`tr:has-text("${name}"), [data-testid="part-row"]:has-text("${name}")`).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    return row;
  }

  async isPartInList(name: string): Promise<boolean> {
    try {
      const row = this.page.locator(`tr:has-text("${name}")`).first();
      await expect(row).toBeVisible({ timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickPartName(name: string): Promise<void> {
    const link = this.page.locator(`a:has-text("${name}")`).first();
    await expect(link).toBeVisible({ timeout: 8_000 });
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCategoryBreadcrumb(): Promise<string[]> {
    const breadcrumbs = this.page.locator('.mantine-Breadcrumbs-root a, nav[aria-label="breadcrumb"] a');
    const count = await breadcrumbs.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await breadcrumbs.nth(i).textContent()) ?? '');
    }
    return texts;
  }

  async getCategoryTree(): Promise<Locator> {
    return this.page.locator('[data-testid="category-tree"], .category-tree, aside nav').first();
  }

  async expandCategoryInTree(categoryName: string): Promise<void> {
    const treeNode = this.page.locator(`[data-testid="category-tree"] :has-text("${categoryName}"), aside nav :has-text("${categoryName}")`).first();
    await expect(treeNode).toBeVisible({ timeout: 8_000 });
    // Click expand toggle if present
    const toggle = treeNode.locator('button[aria-expanded], [data-testid="expand-toggle"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
    } else {
      await treeNode.click();
    }
  }
}
```