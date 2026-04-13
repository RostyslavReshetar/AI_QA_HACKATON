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
    const requirements = context.previousOutputs['research'] || 'No requirements available';
    const uiTestCases = context.previousOutputs['test-design-ui'] || '';
    const apiTestCases = context.previousOutputs['test-design-api'] || '';

    return `Generate a Requirements Traceability Matrix and Risk-Based Test Prioritization Matrix.

## Requirements
${requirements}

## UI Test Cases
${uiTestCases.substring(0, 10000)}

## API Test Cases
${apiTestCases.substring(0, 10000)}

## Instructions
Generate TWO files:

1. **traceability-matrix.md** — Full RTM with columns: Req-ID, Requirement, UI-TC IDs, API-TC IDs, UI Automation, API Automation, Coverage Status
   - Map every requirement to its test cases
   - Include gap analysis section: which requirements have no coverage
   - Include summary statistics

2. **risk-matrix.md** — Risk-based prioritization:
   - Priority levels: Critical, High, Medium, Low
   - Columns: Priority, Module/Area, Risk Description, Business Impact, Test Coverage %
   - Recommended test execution order

Output using --- FILE: path --- / --- END FILE --- format.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [
        { path: 'traceability-matrix.md', content: raw },
      ];
    }
    return files;
  }
}
