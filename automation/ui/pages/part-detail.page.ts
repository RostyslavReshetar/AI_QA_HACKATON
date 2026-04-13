import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class PartDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(partId: number): Promise<void> {
    await this.page.goto(`/web/part/${partId}/details`);
    // Wait for the React app to fully render the part detail page
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('text=/Part:/').first().waitFor({ state: 'visible', timeout: 30000 });
  }

  async getPartName(): Promise<string> {
    const heading = this.page.locator('text=/Part:/').first();
    await heading.waitFor({ state: 'visible', timeout: 30000 });
    return (await heading.textContent()) || '';
  }

  /**
   * Navigate to a tab in the part detail page.
   * InvenTree uses a left sidebar with tab-like navigation items.
   * Try both role="tab" (for panel-tabs tablist) and text links in sidebar.
   */
  async goToTab(tabName: string): Promise<void> {
    // First try: role=tab in any tablist
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tab.click();
      await this.waitForPageLoad();
      return;
    }
    // Second try: sidebar link by text
    const sidebarLink = this.page.locator(`nav a, [class*="NavLink"]`).filter({
      hasText: new RegExp(tabName, 'i'),
    }).first();
    if (await sidebarLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sidebarLink.click();
      await this.waitForPageLoad();
      return;
    }
    // Third try: click within the main content area (not top nav)
    const mainContent = this.page.locator('[class*="panel"], [class*="Navbar"], main').first();
    const textLink = mainContent.getByText(tabName, { exact: false }).first();
    if (await textLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textLink.click();
      await this.waitForPageLoad();
      return;
    }
    // Fourth try: just click the first visible match excluding top nav tabs
    const anyLink = this.page.locator(`a:has-text("${tabName}"), button:has-text("${tabName}")`).first();
    await anyLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if a tab/sidebar item is visible on the part detail page.
   */
  async isTabVisible(tabName: string): Promise<boolean> {
    // Try role=tab first
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      return true;
    }
    // Try sidebar text
    const text = this.page.getByText(tabName, { exact: false }).first();
    return await text.isVisible({ timeout: 3000 }).catch(() => false);
  }

  async editPart(): Promise<void> {
    // Click the kebab/actions menu (three vertical dots at top right)
    const actionsBtn = this.page.locator('[aria-label*="action"], button:has(svg.tabler-icon-dots-vertical)').last();
    await actionsBtn.click();
    const editItem = this.page.getByRole('menuitem', { name: /edit/i }).first();
    if (await editItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editItem.click();
    }
    await this.waitForDialog();
  }

  async deletePart(): Promise<void> {
    const actionsBtn = this.page.locator('[aria-label*="action"]').last();
    await actionsBtn.click();
    const deleteItem = this.page.getByRole('menuitem', { name: /delete/i }).first();
    await deleteItem.click();
  }
}
