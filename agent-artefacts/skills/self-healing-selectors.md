# Self-Healing Selector Strategy

## Multi-Strategy Fallback Chain

Resolution order (highest to lowest priority):

1. **`data-testid`** — most stable, dedicated test attribute
2. **Role + aria-label** — accessible, semantic
3. **Visible text** — readable but locale-dependent
4. **CSS path** — structural, breaks on DOM changes
5. **XPath** — last resort, most fragile

## SelectorStrategy Interface

```typescript
interface SelectorStrategy {
  type: 'testid' | 'role' | 'text' | 'css' | 'xpath';
  selector: string;
  priority: number; // 1 = highest
}

interface SelectorResolutionResult {
  element: Locator;
  usedStrategy: SelectorStrategy;
  attemptedStrategies: SelectorStrategy[];
  resolutionTimeMs: number;
}

class SelectorResolutionError extends Error {
  constructor(
    public readonly elementName: string,
    public readonly attemptedStrategies: SelectorStrategy[],
    public readonly domSnapshot: string,
    public readonly screenshotPath: string,
  ) {
    const strategySummary = attemptedStrategies
      .map(s => `  [${s.type}] ${s.selector}`)
      .join('\n');
    super(
      `Failed to resolve element "${elementName}" after trying all strategies:\n${strategySummary}`
    );
    this.name = 'SelectorResolutionError';
  }
}
```

## Resolution Function

Tries each strategy with a short timeout (2 seconds). Logs which strategy succeeded:

```typescript
import { Page, Locator } from '@playwright/test';

const STRATEGY_TIMEOUT = 2000; // 2 seconds per strategy

async function resolveSelector(
  page: Page,
  elementName: string,
  strategies: SelectorStrategy[],
): Promise<SelectorResolutionResult> {
  const startTime = Date.now();
  const sorted = [...strategies].sort((a, b) => a.priority - b.priority);
  const attempted: SelectorStrategy[] = [];

  for (const strategy of sorted) {
    attempted.push(strategy);
    const locator = buildLocator(page, strategy);

    try {
      await locator.waitFor({ state: 'visible', timeout: STRATEGY_TIMEOUT });
      const resolutionTimeMs = Date.now() - startTime;

      console.log(
        `[SelectorResolver] "${elementName}" resolved via ${strategy.type}: ${strategy.selector} (${resolutionTimeMs}ms)`
      );

      return {
        element: locator,
        usedStrategy: strategy,
        attemptedStrategies: attempted,
        resolutionTimeMs,
      };
    } catch {
      console.warn(
        `[SelectorResolver] "${elementName}" failed with ${strategy.type}: ${strategy.selector}`
      );
    }
  }

  // All strategies failed — capture diagnostics
  const domSnapshot = await page.content();
  const screenshotPath = `test-results/selector-failure-${elementName}-${Date.now()}.png`;
  await page.screenshot({ fullPage: true, path: screenshotPath });

  throw new SelectorResolutionError(elementName, attempted, domSnapshot, screenshotPath);
}

function buildLocator(page: Page, strategy: SelectorStrategy): Locator {
  switch (strategy.type) {
    case 'testid':
      return page.getByTestId(strategy.selector);
    case 'role': {
      const [role, name] = strategy.selector.split('::');
      return page.getByRole(role as any, { name });
    }
    case 'text':
      return page.getByText(strategy.selector);
    case 'css':
      return page.locator(strategy.selector);
    case 'xpath':
      return page.locator(`xpath=${strategy.selector}`);
  }
}
```

## On Complete Failure: Diagnostics

When all strategies fail, capture:

1. **DOM snapshot** — `page.content()` saved as HTML
2. **Screenshot** — full-page screenshot at failure time
3. **All attempted selectors** — logged in the error for debugging

```typescript
// SelectorResolutionError provides all diagnostic data:
// - error.attemptedStrategies — what was tried
// - error.domSnapshot — full DOM at failure time
// - error.screenshotPath — visual state at failure time
```

## Logging Successful Strategy

Track which strategies resolve in practice to identify fragile selectors:

```typescript
// Collect resolution stats across test suite
const resolutionStats: Map<string, { type: string; count: number }[]> = new Map();

function recordResolution(elementName: string, strategyType: string): void {
  if (!resolutionStats.has(elementName)) {
    resolutionStats.set(elementName, []);
  }
  const stats = resolutionStats.get(elementName)!;
  const entry = stats.find(s => s.type === strategyType);
  if (entry) {
    entry.count++;
  } else {
    stats.push({ type: strategyType, count: 1 });
  }
}

// Log at suite end — elements falling back beyond testid need attention
function reportFragileSelectors(): void {
  for (const [element, stats] of resolutionStats) {
    const fallbacks = stats.filter(s => s.type !== 'testid');
    if (fallbacks.length > 0) {
      console.warn(
        `[FragileSelector] "${element}" resolved via fallback: ${fallbacks.map(f => f.type).join(', ')}`
      );
    }
  }
}
```

## Integration with POM

Page objects use the resolver, never raw locators:

```typescript
import { Page } from '@playwright/test';
import { resolveSelector, SelectorStrategy } from '../utils/selector-resolver';

// Define strategies per element
const loginSelectors: Record<string, SelectorStrategy[]> = {
  usernameInput: [
    { type: 'testid', selector: 'username-input', priority: 1 },
    { type: 'role', selector: 'textbox::Username', priority: 2 },
    { type: 'css', selector: 'input[name="username"]', priority: 3 },
    { type: 'xpath', selector: '//input[@placeholder="Enter username"]', priority: 4 },
  ],
  submitButton: [
    { type: 'testid', selector: 'login-submit', priority: 1 },
    { type: 'role', selector: 'button::Sign In', priority: 2 },
    { type: 'text', selector: 'Sign In', priority: 3 },
    { type: 'css', selector: 'form button[type="submit"]', priority: 4 },
  ],
};

class LoginPage {
  constructor(private readonly page: Page) {}

  private async resolve(name: string) {
    return resolveSelector(this.page, name, loginSelectors[name]);
  }

  async fillUsername(value: string): Promise<void> {
    const { element } = await this.resolve('usernameInput');
    await element.fill(value);
  }

  async clickSubmit(): Promise<void> {
    const { element } = await this.resolve('submitButton');
    await element.click();
  }
}
```

## Configuration: Override Strategies Per Element

Allow test-time overrides for specific environments or dynamic elements:

```typescript
interface SelectorConfig {
  defaultStrategies: Record<string, SelectorStrategy[]>;
  overrides?: Record<string, SelectorStrategy[]>;
  strategyTimeout?: number;
}

function createResolver(config: SelectorConfig) {
  const timeout = config.strategyTimeout ?? STRATEGY_TIMEOUT;

  return async function resolve(page: Page, elementName: string) {
    const strategies =
      config.overrides?.[elementName] ??
      config.defaultStrategies[elementName];

    if (!strategies) {
      throw new Error(`No selector strategies defined for element "${elementName}"`);
    }

    return resolveSelector(page, elementName, strategies);
  };
}

// Usage — override for a specific environment
const resolver = createResolver({
  defaultStrategies: loginSelectors,
  overrides: {
    // Staging env has different testids
    usernameInput: [
      { type: 'testid', selector: 'staging-username', priority: 1 },
      { type: 'css', selector: '#login-username', priority: 2 },
    ],
  },
  strategyTimeout: 3000,
});
```
