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
    const requirements = context.previousOutputs['research'] || 'No requirements available';

    return `Based on the following extracted requirements and API schema, generate comprehensive API manual test cases for the InvenTree Parts module.

## Requirements
${requirements}

## API Schema Summary
Endpoints:
- GET/POST /api/part/ — list/create parts
- GET/PATCH/PUT/DELETE /api/part/{id}/ — part CRUD
- GET/POST /api/part/category/ — list/create categories
- DELETE/GET/PATCH/PUT /api/part/category/{id}/ — category CRUD
- GET /api/part/category/tree/ — category tree
- POST /api/part/{id}/bom-copy/ — copy BOM
- GET /api/part/{id}/bom-validate/ — validate BOM
- GET /api/part/{id}/pricing/ — part pricing
- GET /api/part/{id}/serial-numbers/ — serial numbers
- Part parameters, relationships, test templates, stocktake endpoints

Part model key fields (required: name, description, category):
- name (string, max 100), IPN (string, max 100), description (string, max 250)
- category (integer), revision (string), active (boolean, default true)
- assembly, component, virtual, is_template, trackable, purchaseable, salable, testable (booleans)
- variant_of (integer, nullable), revision_of (integer, nullable)
- default_location (integer, nullable), minimum_stock (decimal)
- units (string, max 20), keywords (string, max 250), link (uri, max 2000)
- notes (string, max 50000), tags (array)

Read-only fields: pk, full_name, thumbnail, in_stock, total_in_stock, pricing_min, pricing_max, starred

Auth: Token authentication (header: "Authorization: Token <token>")
Filtering: 50+ query params (active, category, assembly, has_stock, search, ordering, limit, offset, etc.)

## Instructions
- Generate test cases for ALL endpoints
- Cover: CRUD, filtering, pagination, field validation, relational integrity, edge cases
- Include request/response examples
- Format as markdown tables with: TC-ID, Title, Preconditions, Method, Endpoint, Request Body, Expected Status, Expected Response, Priority, Req-ID

Output using --- FILE: path --- / --- END FILE --- format.
Generate: test-cases/api-manual-tests.md`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'test-cases/api-manual-tests.md', content: raw }];
    }
    return files;
  }
}
