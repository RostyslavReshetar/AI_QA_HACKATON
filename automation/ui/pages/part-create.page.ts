import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class PartCreatePage extends BasePage {
  private modal: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('.mantine-Modal-root, [role="dialog"]').first();
  }

  async fillName(name: string): Promise<void> {
    const nameInput = this.modal.getByLabel(/name/i).first();
    await nameInput.clear();
    await nameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    const descInput = this.modal.getByLabel(/description/i).first();
    await descInput.clear();
    await descInput.fill(description);
  }

  async selectCategory(categoryName: string): Promise<void> {
    // InvenTree uses a searchable select for category
    const categoryField = this.modal.locator('[class*="category"], [data-field="category"]')
      .or(this.modal.getByLabel(/category/i)).first();
    await categoryField.click();
    // Type in the search
    const searchInput = this.page.getByRole('searchbox').or(this.page.getByPlaceholder(/search/i)).first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill(categoryName);
    }
    // Select from dropdown
    const option = this.page.getByRole('option', { name: categoryName })
      .or(this.page.locator(`text=${categoryName}`)).first();
    await option.click();
  }

  async setIPN(ipn: string): Promise<void> {
    const ipnInput = this.modal.getByLabel(/IPN/i).first();
    await ipnInput.clear();
    await ipnInput.fill(ipn);
  }

  async setKeywords(keywords: string): Promise<void> {
    const input = this.modal.getByLabel(/keywords/i).first();
    await input.clear();
    await input.fill(keywords);
  }

  async setUnits(units: string): Promise<void> {
    const input = this.modal.getByLabel(/units/i).first();
    await input.clear();
    await input.fill(units);
  }

  async toggleAttribute(attr: string, value: boolean): Promise<void> {
    const checkbox = this.modal.getByLabel(new RegExp(attr, 'i')).first();
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (isChecked !== value) {
      await checkbox.click();
    }
  }

  async submit(): Promise<void> {
    const submitBtn = this.modal.getByRole('button', { name: /submit|create|save/i }).first();
    await submitBtn.click();
  }

  async getValidationErrors(): Promise<string[]> {
    const errors = this.modal.locator('.mantine-Input-error, [class*="error"], .field-error');
    const count = await errors.count();
    const messages: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text) messages.push(text.trim());
    }
    return messages;
  }
}
