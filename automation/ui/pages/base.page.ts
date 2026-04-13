```typescript
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseURL: string = 'http://localhost:8080';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForDialog(): Promise<Locator> {
    const dialog = this.page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    return dialog;
  }

  async closeDialogIfOpen(): Promise<void> {
    const closeBtn = this.page.locator('[role="dialog"] button[aria-label="Close"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    }
  }

  async waitForToast(messagePattern?: string | RegExp): Promise<void> {
    const toast = this.page.locator('.mantine-Notification-root, [role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 10_000 });
    if (messagePattern) {
      await expect(toast).toContainText(messagePattern);
    }
  }

  async waitForSuccessToast(): Promise<void> {
    const successToast = this.page.locator(
      '.mantine-Notification-root[data-with-icon] .mantine-Notification-description, ' +
      '[role="alert"]:not([class*="error"])'
    ).first();
    await expect(successToast).toBeVisible({ timeout: 10_000 });
  }

  async fillField(dialog: Locator, label: string, value: string): Promise<void> {
    const field = dialog.locator(`label:has-text("${label}")`).locator('..').locator('input, textarea').first();
    await field.fill(value);
  }

  async getFieldError(dialog: Locator, label: string): Promise<string | null> {
    const errorEl = dialog.locator(`label:has-text("${label}")`).locator('..').locator('.mantine-InputWrapper-error, [data-error]').first();
    if (await errorEl.isVisible()) {
      return errorEl.textContent();
    }
    return null;
  }

  async clickSaveButton(dialog: Locator): Promise<void> {
    const saveBtn = dialog.locator('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]').first();
    await expect(saveBtn).toBeEnabled({ timeout: 5_000 });
    await saveBtn.click();
  }

  async clickCancelButton(dialog: Locator): Promise<void> {
    const cancelBtn = dialog.locator('button:has-text("Cancel"), button:has-text("Close")').first();
    await cancelBtn.click();
  }

  async selectDropdownOption(dialog: Locator, label: string, optionText: string): Promise<void> {
    // Open the Mantine Select/Autocomplete dropdown
    const trigger = dialog.locator(`label:has-text("${label}")`).locator('..').locator('input').first();
    await trigger.click();
    await trigger.fill(optionText);
    // Wait for dropdown option and click it
    const option = this.page.locator(`.mantine-Select-dropdown .mantine-Select-item:has-text("${optionText}"), [role="option"]:has-text("${optionText}")`).first();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
  }

  async waitForTableLoad(): Promise<void> {
    // Wait for loading spinners to disappear
    await this.page.waitForSelector('.mantine-Loader-root, [data-loading="true"]', {
      state: 'hidden',
      timeout: 15_000,
    }).catch(() => {
      // Spinner may never appear for fast loads — that's fine
    });
    await this.page.waitForLoadState('networkidle');
  }
}
```