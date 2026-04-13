```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/web/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.fill('#login-username', username);
    await this.page.fill('#login-password', password);
    await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    // Wait for redirect away from login
    await this.page.waitForURL(/^(?!.*\/web\/login).*$/, { timeout: 15_000 });
    await this.page.waitForLoadState('networkidle');
  }

  async loginAsAdmin(): Promise<void> {
    await this.goto();
    await this.login('admin', 'inventree123');
  }

  async isLoggedIn(): Promise<boolean> {
    return !this.page.url().includes('/web/login');
  }
}
```