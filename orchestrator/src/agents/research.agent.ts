import type { Agent, AgentContext, AgentConfig, OutputFile } from '../types.js';
import { parseFileBlocks } from './utils.js';

export class ResearchAgent implements Agent {
  config: AgentConfig = {
    name: 'research',
    description: 'Parse InvenTree docs and extract structured requirements',
    phase: 1,
    systemPromptFile: 'prompts/research.md',
  };

  buildPrompt(context: AgentContext): string {
    return `Analyze the InvenTree Parts module documentation and extract all requirements.

The InvenTree Parts module documentation covers:
- Parts: CRUD operations, attributes (Virtual, Template, Assembly, Component, Testable, Trackable, Purchaseable, Salable), Active/Inactive, Locked parts
- Part Categories: hierarchy, filtering, parametric tables
- Part Parameters: templates, units, selection lists, parametric sorting
- Part Templates/Variants: template parts, creating variants, stock reporting across variants
- Part Revisions: creation, constraints (no template revisions, no revision-of-revision, unique codes, circular reference prevention)
- Part Views: detail tabs (Stock, BOM, Allocated, Build Orders, Parameters, Variants, Revisions, Attachments, Related Parts, Test Templates, Suppliers, Purchase Orders, Sales Orders)
- Part Creation: manual entry, import from file, import from supplier
- Units of Measure: custom units, physical units, supplier part units
- Part Images: upload, thumbnails, API upload
- Stock Items: quantity tracking, serial numbers, batch codes, locations, history
- BOM Management: line items, substitutes, inherited items, consumables, multi-level BOMs, validation

API endpoints (68 total):
- GET/POST /api/part/ — list/create parts (65+ fields)
- GET/PATCH/PUT/DELETE /api/part/{id}/ — single part CRUD
- GET/POST /api/part/category/ — list/create categories
- /api/part/{id}/bom-copy/, bom-validate/, pricing/, requirements/, serial-numbers/
- Part parameters, pricing, relationships, stocktake, test templates, thumbnails

Key Part fields: pk, name (max 100), IPN (max 100), description (max 250), revision, category, active, locked, is_template, assembly, component, virtual, purchaseable, salable, testable, trackable, variant_of, revision_of, default_location, minimum_stock, units (max 20), keywords (max 250), notes (max 50000), link (uri, max 2000), image, tags

Key filters (50+): active, assembly, category, component, has_stock, is_template, is_variant, purchaseable, salable, trackable, search, ordering, limit, offset

Output the requirements as a structured markdown document with tables grouped by module.
Use the --- FILE: path --- / --- END FILE --- format for each output file.

Generate: requirements.md`;
  }

  parseOutput(raw: string): OutputFile[] {
    const files = parseFileBlocks(raw);
    if (files.length === 0) {
      return [{ path: 'requirements.md', content: raw }];
    }
    return files;
  }
}
