import { type Page, type Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for InvenTree's React app to finish loading
    await this.page.waitForFunction(() => {
      return !document.querySelector('.mantine-LoadingOverlay-root');
    }, { timeout: 15000 }).catch(() => {});
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
      return await notification.textContent() || '';
    } catch {
      return '';
    }
  }

  async dismissNotification(): Promise<void> {
    const closeBtn = this.page.locator('.mantine-Notification-root button[aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
    }
  }

  async navigateToSidebar(item: string): Promise<void> {
    const sidebarItem = this.page.getByRole('link', { name: item });
    await sidebarItem.click();
    await this.waitForPageLoad();
  }

  /** Click a button by its text, handling InvenTree's Mantine buttons */
  async clickButton(text: string): Promise<void> {
    const btn = this.page.getByRole('button', { name: text });
    await btn.click();
  }

  /** Wait for a modal dialog to appear */
  async waitForModal(): Promise<Locator> {
    const modal = this.page.locator('.mantine-Modal-root, [role="dialog"]').first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });
    return modal;
  }

  /** Close current modal */
  async closeModal(): Promise<void> {
    const closeBtn = this.page.locator('.mantine-Modal-root button[aria-label="Close"], [role="dialog"] button[aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
    }
  }
}
