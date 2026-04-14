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
    const testCases = (context.previousOutputs['test-design-ui'] || '').substring(0, 3000);
    return `Generate Playwright TypeScript UI tests for InvenTree Parts (${context.inventreeUrl}).
Login: admin/inventree123. URL pattern: /web/. Login page: /web/login (fields: login-username, login-password).

Test cases to automate:
${testCases}

Generate these files using --- FILE: path --- / --- END FILE --- format. IMPORTANT: place raw TypeScript code directly between markers — do NOT wrap in markdown code fences (no \`\`\`typescript, no \`\`\`).
1. automation/ui/pages/base.page.ts — BasePage class
2. automation/ui/pages/login.page.ts — login at /web/login
3. automation/ui/pages/parts-list.page.ts — navigate to /web/part/category/index/parts
4. automation/ui/pages/part-detail.page.ts — navigate to /web/part/{id}/details
5. automation/ui/fixtures/auth.fixture.ts — auth via storageState
6. automation/ui/helpers/self-healing.ts — multi-strategy selector fallback
7. automation/ui/tests/part-crud.spec.ts — create, read, update, delete part
8. automation/ui/tests/part-categories.spec.ts — category navigation
9. automation/ui/tests/cross-functional-flow.spec.ts — e2e flow

Use POM pattern. InvenTree uses Mantine UI. Forms open in dialogs. Part creation via "action-menu-add-parts" button > "Create Part" menuitem.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) return [{ path: 'automation/ui/tests/generated.spec.ts', content: raw }];
    return files;
  }
}
