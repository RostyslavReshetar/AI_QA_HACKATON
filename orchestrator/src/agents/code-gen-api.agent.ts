import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class CodeGenAPIAgent implements Agent {
  config: AgentConfig = {
    name: 'code-gen-api',
    description: 'Generate Playwright API automation with contract testing',
    phase: 3,
    systemPromptFile: 'prompts/code-gen-api.md',
  };

  buildPrompt(context: AgentContext): string {
    const testCases = (context.previousOutputs['test-design-api'] || '').substring(0, 3000);
    return `Generate Playwright API tests for InvenTree (${context.inventreeUrl}).
Auth: GET /api/user/token/ with Basic Auth admin:inventree123 → Token header.

API test cases:
${testCases}

Generate files using --- FILE: path --- / --- END FILE --- format:
1. automation/api/helpers/auth.ts — token management
2. automation/api/helpers/api-client.ts — typed client for Part/Category CRUD
3. automation/api/helpers/test-data-factory.ts — unique data + cleanup registry
4. automation/api/helpers/schema-validator.ts — ajv JSON Schema validation
5. automation/api/schemas/part.schema.json — Part model schema
6. automation/api/tests/parts-crud.spec.ts — full CRUD cycle
7. automation/api/tests/parts-filtering.spec.ts — search, filter, pagination
8. automation/api/tests/parts-validation.spec.ts — field validation, boundaries
9. automation/api/tests/schema-contract.spec.ts — response schema validation
10. automation/api/tests/edge-cases.spec.ts — 401, 404, invalid payloads

Use Playwright APIRequestContext. Data-driven patterns. Cleanup in afterAll. Note: parts must be set active:false before DELETE.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) return [{ path: 'automation/api/tests/generated.spec.ts', content: raw }];
    return files;
  }
}
