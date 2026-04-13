import { test, expect } from '@playwright/test';
import { createAuthContext } from '../helpers/auth.js';
import { ApiClient } from '../helpers/api-client.js';
import { validatePartResponse, validateListResponse } from '../helpers/schema-validator.js';
import {
  generatePartData,
  registerForCleanup,
  cleanupAll,
} from '../helpers/test-data-factory.js';

let client: ApiClient;

test.beforeAll(async () => {
  const baseURL = process.env.INVENTREE_URL || 'http://localhost:8080';
  const ctx = await createAuthContext(baseURL);
  client = new ApiClient(ctx);
});

test.afterAll(async () => {
  await cleanupAll(client);
});

test.describe('Schema Contract Tests', () => {
  let testPartId: number;
  let createdPartResponse: any;

  test.beforeAll(async () => {
    createdPartResponse = await client.createPart(
      generatePartData({ name: 'SchemaContract_' + Date.now() }),
    );
    testPartId = createdPartResponse.pk;
    registerForCleanup('part', testPartId);
  });

  test('GET /api/part/ list response has correct pagination structure', async () => {
    const list = await client.listParts({ limit: '5' });

    expect(list, 'should have count').toHaveProperty('count');
    expect(list, 'should have next').toHaveProperty('next');
    expect(list, 'should have previous').toHaveProperty('previous');
    expect(list, 'should have results').toHaveProperty('results');
    expect(typeof list.count, 'count should be number').toBe('number');
    expect(Array.isArray(list.results), 'results should be array').toBe(true);
  });

  test('GET /api/part/ list items validate against part schema', async () => {
    const list = await client.listParts({ limit: '5' });
    expect(list.results.length, 'should have results to validate').toBeGreaterThan(0);

    for (const item of list.results) {
      const result = validatePartResponse(item);
      expect(result.valid, `List item ${item.pk} schema validation failed: ${result.errorMessages.join('; ')}`).toBe(true);
    }
  });

  test('POST /api/part/ response validates against part schema', async () => {
    const part = await client.createPart(
      generatePartData({ name: 'SchemaPost_' + Date.now() }),
    );
    registerForCleanup('part', part.pk);

    const result = validatePartResponse(part);
    expect(result.valid, `POST response schema validation failed: ${result.errorMessages.join('; ')}`).toBe(true);
  });

  test('GET /api/part/{id}/ response validates against part schema', async () => {
    const part = await client.getPart(testPartId);
    const result = validatePartResponse(part);
    expect(result.valid, `GET detail schema validation failed: ${result.errorMessages.join('; ')}`).toBe(true);
  });

  test('all boolean fields have correct type (from POST response)', async () => {
    const part = createdPartResponse;
    const booleanFields = [
      'active', 'assembly', 'component', 'is_template',
      'purchaseable', 'salable', 'trackable', 'testable',
      'virtual', 'locked', 'starred',
    ] as const;

    for (const field of booleanFields) {
      expect(
        typeof (part as any)[field],
        `${field} should be boolean, got ${typeof (part as any)[field]}`,
      ).toBe('boolean');
    }
  });

  test('all numeric fields have correct type', async () => {
    const part = createdPartResponse;

    expect(typeof part.pk, 'pk should be number').toBe('number');
    expect(typeof part.category, 'category should be number').toBe('number');
    expect(typeof part.minimum_stock, 'minimum_stock should be number').toBe('number');
    expect(typeof part.default_expiry, 'default_expiry should be number').toBe('number');
  });

  test('all string fields have correct type', async () => {
    const part = createdPartResponse;
    const stringFields = [
      'name', 'description', 'full_name', 'units', 'revision', 'barcode_hash',
    ] as const;

    for (const field of stringFields) {
      expect(
        typeof (part as any)[field],
        `${field} should be string, got ${typeof (part as any)[field]}`,
      ).toBe('string');
    }
  });

  test('nullable fields are properly nullable', async () => {
    const part = createdPartResponse;
    const nullableFields = [
      'keywords', 'link', 'variant_of', 'revision_of',
      'default_location', 'image', 'responsible',
      'pricing_min', 'pricing_max', 'pricing_updated',
      'in_stock',
    ] as const;

    for (const field of nullableFields) {
      const value = (part as any)[field];
      const isValidType = value === null || typeof value === 'string' || typeof value === 'number';
      expect(
        isValidType,
        `${field} should be null, string, or number — got ${typeof value}`,
      ).toBe(true);
    }
  });

  test('array fields are arrays (from POST response)', async () => {
    const part = createdPartResponse;

    expect(Array.isArray(part.tags), 'tags should be an array').toBe(true);
    expect(Array.isArray(part.parameters), 'parameters should be an array').toBe(true);
    expect(Array.isArray(part.category_path), 'category_path should be an array').toBe(true);
    expect(Array.isArray(part.price_breaks), 'price_breaks should be an array').toBe(true);
  });
});
