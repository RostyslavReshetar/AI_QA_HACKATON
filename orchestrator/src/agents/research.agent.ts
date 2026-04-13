import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class ResearchAgent implements Agent {
  config: AgentConfig = {
    name: 'research',
    description: 'Parse InvenTree docs and extract structured requirements',
    phase: 1,
    systemPromptFile: 'prompts/research.md',
  };

  buildPrompt(_context: AgentContext): string {
    return `Extract requirements for the InvenTree Parts module. The Parts module covers:
- Part CRUD (name max 100, description max 250, category required)
- Categories (hierarchy, filtering, parametric tables)
- Attributes: Virtual, Template, Assembly, Component, Testable, Trackable, Purchaseable, Salable, Active, Locked
- Parameters (templates with units, selection lists)
- Templates/Variants (variant_of relationship, shared serial numbers)
- Revisions (unique codes, no revision-of-revision, no template revisions)
- Stock tracking, BOM management, Units of measure, Images
- API: 68 endpoints, Token auth, 50+ filter params, pagination via limit/offset

Output a markdown file with requirements table: REQ-ID | Title | Description | Module | Priority (Critical/High/Medium/Low).
Group by module. Use --- FILE: requirements.md --- / --- END FILE --- format.`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'requirements.md', content: raw }];
    }
    return files;
  }
}
