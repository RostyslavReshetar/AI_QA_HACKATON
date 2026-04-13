import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export class CategoriesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/web/part/category/index/subcategories');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCategory(categoryId: number): Promise<void> {
    await this.page.goto(`/web/part/category/${categoryId}/details`);
    await this.page.waitForLoadState('networkidle');
    // Wait for "Part Category" heading — confirms the page rendered
    await this.page.getByText('Part Category').waitFor({ state: 'visible', timeout: 20000 });
  }

  async selectCategory(name: string): Promise<void> {
    const link = this.page.getByRole('link', { name }).first();
    await link.click();
    await this.waitForPageLoad();
  }

  async getCategoryBreadcrumb(): Promise<string[]> {
    const breadcrumbs = this.page.locator('[class*="Breadcrumb"] a, nav a');
    const count = await breadcrumbs.count();
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await breadcrumbs.nth(i).textContent();
      if (text) items.push(text.trim());
    }
    return items;
  }
}
