import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const compiledSchemas = new Map<string, ValidateFunction>();

export function validateSchema<T>(schema: object, data: unknown): { valid: boolean; errors: string[] } {
  const key = JSON.stringify(schema);
  let validate = compiledSchemas.get(key);

  if (!validate) {
    validate = ajv.compile(schema);
    compiledSchemas.set(key, validate);
  }

  const valid = validate(data) as boolean;
  const errors = validate.errors
    ? validate.errors.map((e) => `${e.instancePath} ${e.message}`)
    : [];

  return { valid, errors };
}

export function expectSchema(schema: object, data: unknown): void {
  const { valid, errors } = validateSchema(schema, data);
  if (!valid) {
    throw new Error(`Schema validation failed:\n${errors.join('\n')}`);
  }
}