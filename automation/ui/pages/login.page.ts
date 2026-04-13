import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/platform/login');
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: /log in/i }).click();
    // Wait for redirect after login
    await this.page.waitForURL('**/platform/**', { timeout: 30000 });
    await this.waitForPageLoad();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/platform/**', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
