import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class TestDesignAPIAgent implements Agent {
  config: AgentConfig = {
    name: 'test-design-api',
    description: 'Generate comprehensive API manual test cases',
    phase: 2,
    systemPromptFile: 'prompts/test-design-api.md',
  };

  buildPrompt(context: AgentContext): string {
    const reqs = (context.previousOutputs['research'] || '').substring(0, 3000);
    return `Generate API manual test cases for InvenTree Parts module.

Requirements:
${reqs}

API: Token auth, endpoints GET/POST /api/part/, GET/PATCH/PUT/DELETE /api/part/{id}/, /api/part/category/ CRUD, /api/part/category/tree/.
Part fields: name(max100), description(max250), category(int), IPN, active, assembly, component, virtual, is_template, trackable, purchaseable, salable, testable, variant_of, revision_of, units, keywords, link, tags.
Filters: active, category, assembly, search, ordering, limit, offset.

Generate markdown: TC-ID | Title | Method | Endpoint | Expected Status | Priority. Cover CRUD, validation, filtering, edge cases.
Use --- FILE: test-cases/api-manual-tests.md --- / --- END FILE --- format.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) return [{ path: 'test-cases/api-manual-tests.md', content: raw }];
    return files;
  }
}
