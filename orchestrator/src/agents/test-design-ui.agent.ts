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
    const reqs = (context.previousOutputs['research'] || '').substring(0, 3000);
    return `Generate UI manual test cases for InvenTree Parts module.

Requirements summary:
${reqs}

Generate markdown with tables: TC-ID | Title | Preconditions | Steps | Expected Result | Priority | Req-ID.
Define shared preconditions (PC-01: logged in as admin, etc). Cover: Part CRUD, Categories, Attributes, Parameters, Templates/Variants, Revisions, negative/boundary cases.
Use --- FILE: test-cases/ui-manual-tests.md --- / --- END FILE --- format.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) return [{ path: 'test-cases/ui-manual-tests.md', content: raw }];
    return files;
  }
}
