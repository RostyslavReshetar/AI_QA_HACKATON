import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class ReviewerAgent implements Agent {
  config: AgentConfig = {
    name: 'reviewer',
    description: 'Review all generated code and test cases for quality',
    phase: 4,
    systemPromptFile: 'prompts/reviewer.md',
  };

  buildPrompt(context: AgentContext): string {
    const allOutputs = Object.entries(context.previousOutputs)
      .map(([name, output]) => `## Agent: ${name}\n${output.substring(0, 5000)}`)
      .join('\n\n---\n\n');

    return `Review all generated QA artifacts for quality, completeness, and correctness.

## Generated Artifacts
${allOutputs}

## Review Criteria
1. **Test Case Quality**: Are test cases specific, actionable, with clear expected results?
2. **Coverage Completeness**: Are all requirements covered? Any gaps?
3. **Code Quality**: Does automation code follow best practices (POM, proper waits, assertions)?
4. **Contract Testing**: Is schema validation comprehensive?
5. **Self-Healing**: Are selector strategies robust?
6. **Risk Prioritization**: Is prioritization logical and consistent?

Output a structured review report using --- FILE: path --- / --- END FILE --- format.
Generate: review-report.md`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'review-report.md', content: raw }];
    }
    return files;
  }
}
