/**
 * Self-healing selector strategy — tries multiple selector approaches
 * and falls back gracefully, logging which strategy succeeded.
 */
import { type Page, type Locator } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface SelectorStrategy {
  type: 'data-testid' | 'role' | 'text' | 'label' | 'css' | 'xpath';
  selector: string;
  options?: Record<string, unknown>;
  priority: number;
}

export class SelectorResolutionError extends Error {
  constructor(
    public strategies: SelectorStrategy[],
    public screenshotPath?: string,
  ) {
    const tried = strategies.map(s => `${s.type}: ${s.selector}`).join(', ');
    super(`All selector strategies failed. Tried: [${tried}]`);
    this.name = 'SelectorResolutionError';
  }
}

/**
 * Resolve an element using multiple selector strategies in priority order.
 * Returns the first visible locator found.
 */
export async function resolveSelector(
  page: Page,
  strategies: SelectorStrategy[],
  timeout = 3000,
): Promise<Locator> {
  const sorted = [...strategies].sort((a, b) => a.priority - b.priority);

  for (const strategy of sorted) {
    try {
      const locator = getLocator(page, strategy);
      await locator.waitFor({ state: 'visible', timeout });
      console.log(`  [selector] Resolved via ${strategy.type}: ${strategy.selector}`);
      return locator;
    } catch {
      // Strategy failed, try next
    }
  }

  // All strategies failed — capture diagnostics
  const screenshotPath = await captureFailureDiagnostics(page, strategies);
  throw new SelectorResolutionError(strategies, screenshotPath);
}

function getLocator(page: Page, strategy: SelectorStrategy): Locator {
  switch (strategy.type) {
    case 'data-testid':
      return page.getByTestId(strategy.selector);
    case 'role':
      return page.getByRole(strategy.options?.role as any, {
        name: strategy.selector,
        exact: strategy.options?.exact as boolean,
      });
    case 'text':
      return page.getByText(strategy.selector, {
        exact: (strategy.options?.exact as boolean) ?? false,
      });
    case 'label':
      return page.getByLabel(strategy.selector);
    case 'css':
      return page.locator(strategy.selector);
    case 'xpath':
      return page.locator(`xpath=${strategy.selector}`);
    default:
      return page.locator(strategy.selector);
  }
}

async function captureFailureDiagnostics(
  page: Page,
  strategies: SelectorStrategy[],
): Promise<string> {
  const timestamp = Date.now();
  const dir = path.join(process.cwd(), 'test-results', 'selector-failures');
  fs.mkdirSync(dir, { recursive: true });

  const screenshotPath = path.join(dir, `failure-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

  const domPath = path.join(dir, `failure-${timestamp}-dom.html`);
  const content = await page.content().catch(() => 'Failed to capture DOM');
  fs.writeFileSync(domPath, content);

  const logPath = path.join(dir, `failure-${timestamp}-strategies.json`);
  fs.writeFileSync(logPath, JSON.stringify(strategies, null, 2));

  return screenshotPath;
}

/**
 * Helper to build selector strategies for common InvenTree UI patterns.
 */
export function partFormSelectors(fieldName: string): SelectorStrategy[] {
  return [
    { type: 'label', selector: fieldName, priority: 1 },
    { type: 'css', selector: `input[name="${fieldName}"], textarea[name="${fieldName}"]`, priority: 2 },
    { type: 'css', selector: `[data-field="${fieldName}"] input, [data-field="${fieldName}"] textarea`, priority: 3 },
    { type: 'role', selector: fieldName, options: { role: 'textbox' }, priority: 4 },
  ];
}
