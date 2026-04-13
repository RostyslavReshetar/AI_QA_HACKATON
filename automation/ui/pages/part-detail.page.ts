import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class PartDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(partId: number): Promise<void> {
    await this.page.goto(`/platform/part/${partId}/`);
    await this.waitForPageLoad();
  }

  async getPartName(): Promise<string> {
    const heading = this.page.locator('h3, h2, [class*="Title"]').first();
    return (await heading.textContent()) || '';
  }

  async goToTab(tabName: string): Promise<void> {
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).first();
    await tab.click();
    await this.waitForPageLoad();
  }

  async isTabVisible(tabName: string): Promise<boolean> {
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).first();
    return await tab.isVisible({ timeout: 3000 }).catch(() => false);
  }

  async editPart(): Promise<void> {
    // InvenTree has an edit action in the part detail page
    const editBtn = this.page.getByRole('button', { name: /edit/i }).first();
    await editBtn.click();
    await this.waitForModal();
  }

  async deletePart(): Promise<void> {
    // Find and click delete action
    const actionsBtn = this.page.getByRole('button', { name: /action|menu/i }).first();
    if (await actionsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await actionsBtn.click();
    }
    const deleteBtn = this.page.getByRole('menuitem', { name: /delete/i })
      .or(this.page.getByRole('button', { name: /delete/i })).first();
    await deleteBtn.click();
  }

  async getDetailField(fieldName: string): Promise<string> {
    const field = this.page.locator(`text=${fieldName}`).locator('..').locator('dd, span, [class*="Value"]').first();
    return (await field.textContent()) || '';
  }

  /** Get the stock count shown on the Stock tab badge */
  async getStockBadge(): Promise<string> {
    const stockTab = this.page.getByRole('tab', { name: /stock/i }).first();
    const badge = stockTab.locator('[class*="Badge"], .badge').first();
    return (await badge.textContent()) || '0';
  }
}
