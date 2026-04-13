import Ajv, { ErrorObject } from 'ajv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ajv = new Ajv({ allErrors: true, strict: false });

// Load the part schema
const partSchemaPath = resolve(__dirname, '..', 'schemas', 'part.schema.json');
const partSchema = JSON.parse(readFileSync(partSchemaPath, 'utf-8'));

// Compile validators
const validatePart = ajv.compile(partSchema);

// List response schema (built dynamically)
const listSchema = {
  type: 'object',
  required: ['count', 'next', 'previous', 'results'],
  properties: {
    count: { type: 'integer' },
    next: { type: ['string', 'null'] },
    previous: { type: ['string', 'null'] },
    results: {
      type: 'array',
      items: partSchema,
    },
  },
  additionalProperties: false,
};

const validateList = ajv.compile(listSchema);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[] | null;
  errorMessages: string[];
}

/**
 * Validates a single part response against the Part JSON Schema.
 */
export function validatePartResponse(data: unknown): ValidationResult {
  const valid = validatePart(data) as boolean;
  const errors = validatePart.errors ?? null;
  const errorMessages = errors
    ? errors.map((e) => `${e.instancePath || '/'} ${e.message} ${JSON.stringify(e.params)}`)
    : [];
  return { valid, errors, errorMessages };
}

/**
 * Validates a paginated list response containing parts.
 */
export function validateListResponse(data: unknown): ValidationResult {
  const valid = validateList(data) as boolean;
  const errors = validateList.errors ?? null;
  const errorMessages = errors
    ? errors.map((e) => `${e.instancePath || '/'} ${e.message} ${JSON.stringify(e.params)}`)
    : [];
  return { valid, errors, errorMessages };
}
