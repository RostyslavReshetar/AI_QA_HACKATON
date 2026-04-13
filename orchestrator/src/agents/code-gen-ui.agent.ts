import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class CodeGenUIAgent implements Agent {
  config: AgentConfig = {
    name: 'code-gen-ui',
    description: 'Generate Playwright UI automation with POM pattern',
    phase: 3,
    systemPromptFile: 'prompts/code-gen-ui.md',
  };

  buildPrompt(context: AgentContext): string {
    const testCases = context.previousOutputs['test-design-ui'] || 'No test cases available';

    return `Based on the following UI manual test cases, generate Playwright TypeScript automation code using the Page Object Model pattern.

## UI Test Cases
${testCases}

## Target Application
- InvenTree Parts module at ${context.inventreeUrl}
- Auth: admin / inventree123
- Playwright with TypeScript

## Required Output Files
Generate ALL of these files using --- FILE: path --- / --- END FILE --- format:

1. automation/ui/pages/base.page.ts — Base page with common methods, self-healing selector support
2. automation/ui/pages/login.page.ts — Login page object
3. automation/ui/pages/parts-list.page.ts — Parts list page object
4. automation/ui/pages/part-detail.page.ts — Part detail page object (all tabs)
5. automation/ui/pages/part-create.page.ts — Part creation form page object
6. automation/ui/pages/categories.page.ts — Categories page object
7. automation/ui/locators/parts.locators.ts — All part-related selectors
8. automation/ui/locators/common.locators.ts — Common/shared selectors
9. automation/ui/fixtures/auth.fixture.ts — Auth fixture with storageState
10. automation/ui/fixtures/test-data.fixture.ts — Test data fixtures
11. automation/ui/helpers/self-healing.ts — Self-healing selector implementation
12. automation/ui/helpers/screenshot-on-fail.ts — Screenshot/DOM capture on failure
13. automation/ui/tests/part-crud.spec.ts — Part CRUD tests
14. automation/ui/tests/part-categories.spec.ts — Category tests
15. automation/ui/tests/part-parameters.spec.ts — Parameter tests
16. automation/ui/tests/part-variants.spec.ts — Template/variant tests
17. automation/ui/tests/part-revisions.spec.ts — Revision tests
18. automation/ui/tests/part-bom.spec.ts — BOM tests
19. automation/ui/tests/part-stock.spec.ts — Stock tests
20. automation/ui/tests/cross-functional-flow.spec.ts — End-to-end cross-functional flow

Each file must be complete, compilable TypeScript. Follow POM strictly.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'automation/ui/tests/generated-output.txt', content: raw }];
    }
    return files;
  }
}
