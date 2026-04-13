```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { SelfHealingLocator } from '../helpers/self-healing';

export class PartDetailPage extends BasePage {
  private selfHealing: SelfHealingLocator;

  constructor(page: Page) {
    super(page);
    this.selfHealing = new SelfHealingLocator(page);
  }

  async goto(partId: number): Promise<void> {
    await this.navigate(`/web/part/${partId}/details`);
    await this.page.waitForLoadState('networkidle');
  }

  async getPartName(): Promise<string> {
    const heading = await this.selfHealing.find([
      '[data-testid="part-name"]',
      'h1',
      '.mantine-Title-root',
      'header h2',
    ]);
    return (await heading.textContent()) ?? '';
  }

  async getFieldValue(label: string): Promise<string> {
    const field = this.page.locator(`dt:has-text("${label}") + dd, td:has-text("${label}") + td, [data-label="${label}"]`).first();
    return (await field.textContent()) ?? '';
  }

  async clickEditPart(): Promise<void> {
    const editBtn = await this.selfHealing.find([
      '[data-testid="action-menu-edit-part"]',
      'button[aria-label="Edit Part"]',
      'button:has-text("Edit Part")',
      'button:has-text("Edit")',
    ]);
    await editBtn.click();
  }

  async clickDeletePart(): Promise<void> {
    const deleteBtn = await this.selfHealing.find([
      '[data-testid="action-menu-delete-part"]',
      'button[aria-label="Delete Part"]',
      'button:has-text("Delete Part")',
    ]);
    await deleteBtn.click();
  }

  async confirmDeletion(): Promise<void> {
    const dialog = await this.waitForDialog();
    // InvenTree delete dialogs often require typing the part name to confirm
    const confirmInput = dialog.locator('input[placeholder*="confirm" i], input[placeholder*="name" i]').first();
    if (await confirmInput.isVisible()) {
      const partName = await this.getPartName();
      await confirmInput.fill(partName.trim());
    }
    await this.clickSaveButton(dialog);
  }

  async isDeleteButtonDisabled(): Promise<boolean> {
    const deleteBtn = this.page.locator(
      '[data-testid="action-menu-delete-part"], button[aria-label="Delete Part"], button:has-text("Delete Part")'
    ).first();
    return (await deleteBtn.getAttribute('disabled')) !== null ||
           (await deleteBtn.getAttribute('aria-disabled')) === 'true';
  }

  async getActiveStatus(): Promise<boolean> {
    const badge = await this.selfHealing.find([
      '[data-testid="part-active-badge"]',
      '.mantine-Badge-root:has-text("Active")',
      'span:has-text("Active")',
    ]);
    return badge.isVisible();
  }

  async navigateToTab(tabName: string): Promise<void> {
    const tab = await this.selfHealing.find([
      `[role="tab"]:has-text("${tabName}")`,
      `.mantine-Tabs-tab:has-text("${tabName}")`,
      `button[role="tab"]:has-text("${tabName}")`,
    ]);
    await tab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getParameterValue(paramName: string): Promise<string> {
    await this.navigateToTab('Parameters');
    const row = this.page.locator(`tr:has-text("${paramName}")`).first();
    await expect(row).toBeVisible({ timeout: 8_000 });
    return (await row.locator('td').nth(1).textContent()) ?? '';
  }

  async clickActionsMenu(): Promise<void> {
    const actionsBtn = await this.selfHealing.find([
      '[data-testid="actions-menu"]',
      'button[aria-label="Actions"]',
      'button:has-text("Actions")',
      '.mantine-ActionIcon-root[aria-label*="action" i]',
    ]);
    await actionsBtn.click();
  }
}
```