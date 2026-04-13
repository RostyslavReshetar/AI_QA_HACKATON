# Playwright Page Object Model Best Practices

## POM Decomposition

Separate every page into three files:

| File | Purpose | Naming |
|------|---------|--------|
| `*.locators.ts` | Locator definitions only | `login.locators.ts` |
| `*.page.ts` | Page methods (actions + assertions) | `login.page.ts` |
| `*.spec.ts` | Test specs | `login.spec.ts` |

Never mix locators, actions, or test logic in the same file.

## BasePage Class

Every page object extends `BasePage`:

```typescript
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly url: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true, path: `screenshots/${name}.png` });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
```

## Locator Strategy (Priority Order)

1. **`data-testid`** — most stable, never changes with UI refactors
2. **Role-based** — `getByRole('button', { name: 'Submit' })` — accessible and readable
3. **Text-based** — `getByText('Welcome')` — acceptable for static content
4. **CSS selectors** — last resort, most fragile

```typescript
// locators file example
import { Page } from '@playwright/test';

export class LoginLocators {
  constructor(private readonly page: Page) {}

  get usernameInput() { return this.page.getByTestId('username-input'); }
  get passwordInput() { return this.page.getByTestId('password-input'); }
  get submitButton() { return this.page.getByRole('button', { name: 'Sign In' }); }
  get errorMessage() { return this.page.getByTestId('error-message'); }
}
```

## Wait Strategies

**Never use hard waits** (`page.waitForTimeout`). Always use condition-based waits:

```typescript
// Wait for element
await this.page.waitForSelector('[data-testid="dashboard"]');

// Wait for page state
await this.page.waitForLoadState('domcontentloaded');
await this.page.waitForLoadState('networkidle');

// Wait for response
await this.page.waitForResponse(resp =>
  resp.url().includes('/api/data') && resp.status() === 200
);

// Wait for navigation
await Promise.all([
  this.page.waitForNavigation(),
  this.page.click('[data-testid="nav-link"]'),
]);
```

## Test Isolation

Each test must be independent — no shared mutable state between tests:

```typescript
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate();
  });

  test('displays user name', async ({ page }) => {
    // self-contained, no dependency on other tests
  });
});
```

## Fixtures and Auth State Reuse

Store auth state once and reuse via `storageState`:

```typescript
// global-setup.ts
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('/login');
  await page.getByTestId('username-input').fill(process.env.TEST_USER!);
  await page.getByTestId('password-input').fill(process.env.TEST_PASS!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'auth-state.json' });
  await browser.close();
}

export default globalSetup;
```

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  projects: [
    { name: 'authenticated', use: { storageState: 'auth-state.json' } },
    { name: 'unauthenticated', use: {} },
  ],
});
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page Object | `*.page.ts` | `dashboard.page.ts` |
| Test Spec | `*.spec.ts` | `dashboard.spec.ts` |
| Locators | `*.locators.ts` | `dashboard.locators.ts` |
| Fixtures | `*.fixture.ts` | `auth.fixture.ts` |

## Assertion Patterns

Always use `expect()` with meaningful messages:

```typescript
import { expect } from '@playwright/test';

// With message for clear failure output
await expect(page.getByTestId('welcome-message'))
  .toBeVisible({ timeout: 5000 });

await expect(page.getByTestId('user-name'))
  .toHaveText('John Doe', { message: 'Expected logged-in user name to display' });

await expect(page.getByTestId('item-list'))
  .toHaveCount(5, { message: 'Expected exactly 5 items in the list' });

// Soft assertions — continue test on failure, report at end
await expect.soft(page.getByTestId('sidebar')).toBeVisible();
await expect.soft(page.getByTestId('footer')).toBeVisible();
```

## Error Handling: Screenshot + DOM Snapshot on Failure

Capture diagnostic artifacts automatically on test failure:

```typescript
import { test as base } from '@playwright/test';
import * as fs from 'fs';

export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page);
  },
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = `test-results/${testInfo.title}-failure.png`;
    await page.screenshot({ fullPage: true, path: screenshotPath });
    testInfo.attachments.push({
      name: 'failure-screenshot',
      path: screenshotPath,
      contentType: 'image/png',
    });

    const domSnapshot = await page.content();
    const snapshotPath = `test-results/${testInfo.title}-dom.html`;
    fs.writeFileSync(snapshotPath, domSnapshot);
    testInfo.attachments.push({
      name: 'dom-snapshot',
      path: snapshotPath,
      contentType: 'text/html',
    });
  }
});
```

## TypeScript Strict Mode Patterns

Enable strict TypeScript for Playwright projects:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Apply strict patterns in page objects:

```typescript
// Use readonly for immutable locators
readonly submitButton = this.page.getByTestId('submit');

// Explicit return types on all page methods
async getItemCount(): Promise<number> {
  return this.page.getByTestId('item').count();
}

// Non-null assertions only when guaranteed by preconditions
async getSelectedValue(): Promise<string> {
  const value = await this.page.getByTestId('select').inputValue();
  if (!value) throw new Error('No value selected');
  return value;
}

// Typed page method parameters
async fillForm(data: { username: string; password: string }): Promise<void> {
  await this.locators.usernameInput.fill(data.username);
  await this.locators.passwordInput.fill(data.password);
}
```
