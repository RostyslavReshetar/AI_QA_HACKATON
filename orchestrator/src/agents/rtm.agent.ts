import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class RTMAgent implements Agent {
  config: AgentConfig = {
    name: 'rtm',
    description: 'Generate Requirements Traceability Matrix and Risk Matrix',
    phase: 2,
    systemPromptFile: 'prompts/rtm.md',
  };

  buildPrompt(context: AgentContext): string {
    const reqs = (context.previousOutputs['research'] || '').substring(0, 2000);
    const uiTc = (context.previousOutputs['test-design-ui'] || '').substring(0, 2000);
    const apiTc = (context.previousOutputs['test-design-api'] || '').substring(0, 2000);
    return `Generate RTM and Risk Matrix for InvenTree Parts QA.

Requirements (summary): ${reqs}
UI test cases (summary): ${uiTc}
API test cases (summary): ${apiTc}

Generate TWO files:
1. traceability-matrix.md — Req-ID | Requirement | UI-TC | API-TC | Coverage Status. Include gap analysis.
2. risk-matrix.md — Priority | Module | Risk | Impact | Coverage%. 4 phases: Critical/High/Medium/Low.
Use --- FILE: path --- / --- END FILE --- format for each.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) return [{ path: 'traceability-matrix.md', content: raw }];
    return files;
  }
}
