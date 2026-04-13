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
    const summary = Object.entries(context.previousOutputs)
      .map(([name, output]) => `## ${name}\n${output.substring(0, 1000)}`)
      .join('\n\n');
    return `Review these QA artifacts for InvenTree Parts module:

${summary}

Check: test coverage completeness, code quality, POM compliance, assertion quality, missing edge cases.
Output a review report with: severity (Critical/Major/Minor), finding, recommendation.
Use --- FILE: review-report.md --- / --- END FILE --- format.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) return [{ path: 'review-report.md', content: raw }];
    return files;
  }
}
