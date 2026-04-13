import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class PartsListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/platform/part/');
    await this.waitForPageLoad();
  }

  async clickCreatePart(): Promise<void> {
    // InvenTree uses an "Add Part" or "New Part" action button
    const addBtn = this.page.getByRole('button', { name: /new part|add part|create part/i }).first();
    await addBtn.click();
    await this.waitForModal();
  }

  async searchPart(query: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/search/i).first();
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.waitForPageLoad();
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
    try {
      const row = await this.getPartRowByName(name);
      return await row.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  async getPartCount(): Promise<number> {
    // InvenTree shows record count in table footer or header
    const countText = this.page.locator('.mantine-Table-root tbody tr, table tbody tr');
    return await countText.count();
  }
}
