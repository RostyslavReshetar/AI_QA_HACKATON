import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class TestDesignUIAgent implements Agent {
  config: AgentConfig = {
    name: 'test-design-ui',
    description: 'Generate comprehensive UI manual test cases',
    phase: 2,
    systemPromptFile: 'prompts/test-design-ui.md',
  };

  buildPrompt(context: AgentContext): string {
    const requirements = context.previousOutputs['research'] || 'No requirements available';

    return `Based on the following extracted requirements, generate comprehensive UI manual test cases for the InvenTree Parts module.

## Requirements
${requirements}

## Instructions
- Generate test cases covering ALL areas: Part CRUD, detail view tabs, categories, attributes, parameters, templates/variants, revisions, units, images, negative/boundary scenarios
- Use reusable preconditions (PC-01: Logged in as admin, PC-02: On Parts list page, etc.)
- Apply risk-based prioritization (Critical/High/Medium/Low)
- Include positive, negative, and boundary test cases
- Format as markdown tables with: TC-ID, Title, Preconditions, Steps, Expected Result, Priority, Req-ID
- Quality over quantity — each test case must be meaningful and specific

Output using --- FILE: path --- / --- END FILE --- format.
Generate: test-cases/ui-manual-tests.md`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'test-cases/ui-manual-tests.md', content: raw }];
    }
    return files;
  }
}
