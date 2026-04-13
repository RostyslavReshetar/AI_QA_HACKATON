import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class PartsListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/web/part/category/index/parts');
    await this.waitForPageLoad();
  }

  async clickCreatePart(): Promise<void> {
    // Click "Add Parts" dropdown menu button
    await this.page.getByRole('button', { name: 'action-menu-add-parts' }).click();
    // Then click "Create Part" in the dropdown
    await this.page.getByRole('menuitem', { name: /create-part/i }).click();
    // Wait for the "Add Part" dialog to open
    await this.waitForDialog('Add Part');
  }

  async searchPart(query: string): Promise<void> {
    const searchInput = this.page.getByRole('textbox', { name: 'table-search-input' });
    await searchInput.clear();
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(1000); // wait for table to update
  }

  async getPartRowByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name }).first();
  }

  async clickPartByName(name: string): Promise<void> {
    const link = this.page.getByRole('link', { name }).first();
    await link.click();
    await this.waitForPageLoad();
  }

  async isPartVisible(name: string): Promise<boolean> {
    const row = this.page.getByRole('row').filter({ hasText: name }).first();
    return await row.isVisible({ timeout: 5000 }).catch(() => false);
  }
}
