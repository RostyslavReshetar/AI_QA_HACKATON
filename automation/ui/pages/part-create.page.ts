import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class PartCreatePage extends BasePage {
  private dialog: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.getByRole('dialog', { name: 'Add Part' });
  }

  async fillName(name: string): Promise<void> {
    const input = this.dialog.getByRole('textbox', { name: 'text-field-name' });
    await input.clear();
    await input.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    const input = this.dialog.getByRole('textbox', { name: 'text-field-description' });
    await input.clear();
    await input.fill(description);
  }

  async selectCategory(categoryName: string): Promise<void> {
    const combo = this.dialog.getByRole('combobox', { name: 'related-field-category' });
    await combo.click();
    await combo.fill(categoryName);
    // Wait for dropdown results and click matching option
    const option = this.page.getByRole('option', { name: new RegExp(categoryName, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async setIPN(ipn: string): Promise<void> {
    const input = this.dialog.getByRole('textbox', { name: 'text-field-IPN' });
    await input.clear();
    await input.fill(ipn);
  }

  async setKeywords(keywords: string): Promise<void> {
    const input = this.dialog.getByRole('textbox', { name: 'text-field-keywords' });
    await input.clear();
    await input.fill(keywords);
  }

  async setUnits(units: string): Promise<void> {
    const input = this.dialog.getByRole('textbox', { name: 'text-field-units' });
    await input.clear();
    await input.fill(units);
  }

  async toggleSwitch(fieldName: string, value: boolean): Promise<void> {
    const sw = this.dialog.getByRole('switch', { name: `boolean-field-${fieldName}` });
    const isChecked = await sw.isChecked();
    if (isChecked !== value) {
      await sw.click();
    }
  }

  async submit(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Submit' }).click();
  }

  async cancel(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async getValidationErrors(): Promise<string[]> {
    const errors = this.dialog.locator('.mantine-Input-error, [class*="error"]');
    const count = await errors.count();
    const messages: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text) messages.push(text.trim());
    }
    return messages;
  }
}
