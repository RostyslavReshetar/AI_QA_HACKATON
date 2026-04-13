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
    const testCases = context.previousOutputs['test-design-api'] || 'No test cases available';

    return `Based on the following API manual test cases, generate Playwright API automation code with contract testing.

## API Test Cases
${testCases}

## Target Application
- InvenTree API at ${context.inventreeUrl}/api/
- Auth: Token-based (get token via GET /api/user/token/ with Basic auth admin:inventree123)
- Playwright APIRequestContext with TypeScript

## Required Output Files
Generate ALL of these files using --- FILE: path --- / --- END FILE --- format:

1. automation/api/helpers/auth.ts — Auth token management
2. automation/api/helpers/api-client.ts — Typed API client wrapper for Part, Category endpoints
3. automation/api/helpers/schema-validator.ts — JSON Schema validation using ajv
4. automation/api/helpers/test-data-factory.ts — Test data generation + cleanup registry
5. automation/api/schemas/part.schema.json — JSON Schema for Part model (based on API docs)
6. automation/api/tests/parts-crud.spec.ts — Full CRUD cycle tests
7. automation/api/tests/parts-filtering.spec.ts — Search, filter, pagination, ordering
8. automation/api/tests/parts-validation.spec.ts — Field validation (required, max length, types, read-only)
9. automation/api/tests/parts-categories.spec.ts — Category CRUD and tree
10. automation/api/tests/parts-relations.spec.ts — Category assignment, variant_of, revision_of
11. automation/api/tests/schema-contract.spec.ts — Contract testing: validate every response against schema
12. automation/api/tests/edge-cases.spec.ts — Unauthorized, duplicates, inactive restrictions, conflicts

Each file must be complete, compilable TypeScript. Use data-driven patterns where appropriate.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'automation/api/tests/generated-output.txt', content: raw }];
    }
    return files;
  }
}
