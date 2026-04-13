```typescript
import { Page, Locator } from '@playwright/test';

/**
 * SelfHealingLocator tries a prioritised list of selectors and returns the
 * first one that is visible in the DOM.  This prevents a single renamed
 * attribute from breaking an entire test file.
 *
 * Strategy order (most to least specific):
 *   1. data-testid attribute (explicit, developer-owned)
 *   2. aria-label attribute (accessibility-first)
 *   3. role + text (semantic)
 *   4. visible text content (human-readable fallback)
 *   5. CSS class / structural selector (last resort)
 */
export class SelfHealingLocator {
  constructor(private readonly page: Page) {}

  /**
   * Returns the first locator from `selectors` whose element is visible.
   * Throws with a diagnostic list if none match within the timeout.
   */
  async find(
    selectors: string[],
    options: { timeout?: number; root?: Locator } = {}
  ): Promise<Locator> {
    const { timeout = 8_000, root } = options;
    const context = root ?? this.page;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      for (const selector of selectors) {
        try {
          const locator = context.locator(selector).first();
          // Use a very short individual timeout per selector on each pass
          if (await locator.isVisible({ timeout: 300 })) {
            return locator;
          }
        } catch {
          // Selector not found yet — continue
        }
      }
      // Brief pause before next polling cycle
      await this.page.waitForTimeout(200);
    }

    throw new Error(
      `SelfHealingLocator: none of the following selectors became visible within ${timeout}ms:\n` +
        selectors.map((s) => `  • ${s}`).join('\n')
    );
  }

  /**
   * Convenience: find an element containing specific text, trying multiple
   * element types.
   */
  async findByText(
    text: string,
    tags: string[] = ['button', 'a', 'span', 'div'],
    options: { timeout?: number } = {}
  ): Promise<Locator> {
    const selectors = tags.map((tag) => `${tag}:has-text("${text}")`);
    return this.find(selectors, options);
  }

  /**
   * Fills an input identified by its associated label text.
   * Tries multiple label association patterns.
   */
  async fillByLabel(label: string, value: string): Promise<void> {
    const input = await this.find([
      `label:has-text("${label}") + div input`,
      `label:has-text("${label}") ~ div input`,
      `[aria-label="${label}"]`,
      `input[placeholder*="${label}" i]`,
      `input[name*="${label.toLowerCase().replace(/ /g, '_')}"]`,
    ]);
    await input.fill(value);
  }

  /**
   * Waits for a Mantine dialog / modal to appear and returns it.
   */
  async waitForDialog(timeout = 10_000): Promise<Locator> {
    return this.find(
      [
        '[role="dialog"]',
        '.mantine-Modal-content',
        '.mantine-Drawer-content',
      ],
      { timeout }
    );
  }

  /**
   * Selects an option from a Mantine Select component by label + option text.
   */
  async selectMantineOption(
    dialog: Locator | null,
    labelText: string,
    optionText: string
  ): Promise<void> {
    const ctx = dialog ?? this.page;
    const input = await this.find(
      [
        `label:has-text("${labelText}") + div input`,
        `label:has-text("${labelText}") ~ div input`,
        `[aria-label="${labelText}"]`,
      ],
      { root: ctx as Locator }
    ).catch(() =>
      // Fallback: search the whole page
      this.find([
        `label:has-text("${labelText}") + div input`,
        `label:has-text("${labelText}") ~ div input`,
      ])
    );

    await input.click();
    await input.fill(optionText);

    const option = await this.find([
      `.mantine-Select-dropdown [role="option"]:has-text("${optionText}")`,
      `.mantine-Combobox-option:has-text("${optionText}")`,
      `[role="listbox"] [role="option"]:has-text("${optionText}")`,
    ]);
    await option.click();
  }
}
```