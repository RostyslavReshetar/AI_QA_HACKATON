import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/web/login');
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('input[name="login-username"]').fill(username);
    await this.page.locator('input[name="login-password"]').fill(password);
    await this.page.getByRole('button', { name: 'Log In' }).click();
    await this.page.waitForURL('**/web/**', { timeout: 30000 });
    await this.waitForPageLoad();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/web/**', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
