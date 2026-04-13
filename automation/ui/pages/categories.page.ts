import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class CategoriesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/platform/part/category/index/');
    await this.waitForPageLoad();
  }

  async navigateToCategory(categoryId: number): Promise<void> {
    await this.page.goto(`/platform/part/category/${categoryId}/`);
    await this.waitForPageLoad();
  }

  async selectCategory(name: string): Promise<void> {
    const categoryLink = this.page.getByRole('link', { name }).first();
    await categoryLink.click();
    await this.waitForPageLoad();
  }

  async createCategory(name: string, description?: string): Promise<void> {
    const addBtn = this.page.getByRole('button', { name: /new category|add category/i }).first();
    await addBtn.click();
    await this.waitForModal();

    const modal = this.page.locator('.mantine-Modal-root, [role="dialog"]').first();
    await modal.getByLabel(/name/i).first().fill(name);
    if (description) {
      await modal.getByLabel(/description/i).first().fill(description);
    }

    const submitBtn = modal.getByRole('button', { name: /submit|create|save/i }).first();
    await submitBtn.click();
    await this.waitForPageLoad();
  }

  async getCategoryBreadcrumb(): Promise<string[]> {
    const breadcrumbs = this.page.locator('.mantine-Breadcrumbs-root a, nav[aria-label="breadcrumb"] a');
    const count = await breadcrumbs.count();
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await breadcrumbs.nth(i).textContent();
      if (text) items.push(text.trim());
    }
    return items;
  }

  async getSubcategories(): Promise<string[]> {
    const subcats = this.page.locator('table tbody tr a, [class*="category"] a').filter({
      has: this.page.locator('[class*="icon"], svg'),
    });
    const count = await subcats.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await subcats.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }
}
