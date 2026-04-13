import { type Page, type Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for InvenTree's Mantine loading overlay to disappear
    const loader = this.page.locator('.mantine-LoadingOverlay-root');
    await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  async getNotificationText(): Promise<string> {
    const notification = this.page.locator('.mantine-Notification-root, [role="alert"]').first();
    try {
      await notification.waitFor({ state: 'visible', timeout: 5000 });
      return (await notification.textContent()) || '';
    } catch {
      return '';
    }
  }

  async waitForDialog(title?: string): Promise<Locator> {
    const dialog = title
      ? this.page.getByRole('dialog', { name: title })
      : this.page.getByRole('dialog').first();
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    return dialog;
  }

  async closeDialog(): Promise<void> {
    const dialog = this.page.getByRole('dialog').first();
    const closeBtn = dialog.getByRole('button').first();
    await closeBtn.click();
  }
}
