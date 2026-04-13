import { test, expect, request } from '@playwright/test';
import { getAuthToken, BASE_URL } from '../helpers/auth';
import { ApiClient } from '../helpers/api-client';
import { TestDataFactory } from '../helpers/test-data-factory';
import { expectSchema } from '../helpers/schema-validator';
import partSchema from '../schemas/part.schema.json';

const paginatedPartSchema = {
  type: 'object',
  required: ['count', 'results'],
  properties: {
    count: { type: 'integer', minimum: 0 },
    next: { type: ['string', 'null'] },
    previous: { type: ['string', 'null'] },
    results: {
      type: 'array',
      items: partSchema,
    },
  },
  additionalProperties: true,
};

const categorySchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'integer', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    description: { type: ['string', 'null'] },
    parent: { type: ['integer', 'null'] },
    pathstring: { type: 'string' },
    part_count: { type: 'integer' },
  },
  additionalProperties: true,
};

test.describe('Schema Contract Validation', () => {
  let client: ApiClient;
  let factory: TestDataFactory;
  let categoryId: number;

  test.beforeAll(async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const token = await getAuthToken();
    client = new ApiClient(ctx, token, BASE_URL);
    factory = new TestDataFactory(client);
    const cat = await factory.createCategory();
    categoryId = cat.id;
  });

  test.afterAll(async () => {
    await factory.cleanup();
  });

  // ── Part schemas ──────────────────────────────────────────────────────

  test('TC-SCHEMA-001: POST /api/part/ response matches Part schema', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('schema-test'),
      category: categoryId,
      active: true,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
    expectSchema(partSchema, body);
  });

  test('TC-SCHEMA-002: GET /api/part/:id response matches Part schema', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.getPart(part.id);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expectSchema(partSchema, body);
  });

  test('TC-SCHEMA-003: GET /api/part/ list response matches paginated schema', async () => {
    const res = await client.listParts({ limit: 5 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expectSchema(paginatedPartSchema, body);
  });

  test('TC-SCHEMA-004: PATCH /api/part/:id response matches Part schema', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.updatePart(part.id, { description: 'patched' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expectSchema(partSchema, body);
  });

  test('TC-SCHEMA-005: PUT /api/part/:id response matches Part schema', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.replacePart(part.id, {
      name: factory.uniqueName('put-schema'),
      category: categoryId,
      active: true,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expectSchema(partSchema, body);
  });

  // ── Category schemas ──────────────────────────────────────────────────

  test('TC-SCHEMA-006: POST /api/part/category/ response matches Category schema', async () => {
    const res = await client.createCategory({ name: factory.uniqueName('cat-schema') });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'category', id: body.id });
    expectSchema(categorySchema, body);
  });

  test('TC-SCHEMA-007: GET /api/part/category/:id response matches Category schema', async () => {
    const res = await client.getCategory(categoryId);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expectSchema(categorySchema, body);
  });

  // ── Required field presence ───────────────────────────────────────────

  test('TC-SCHEMA-008: part response always includes id, name, category, active', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.getPart(part.id);
    const body = await res.json();
    expect(typeof body.id).toBe('number');
    expect(typeof body.name).toBe('string');
    expect(body.category).not.toBeUndefined();
    expect(typeof body.active).toBe('boolean');
  });

  // ── Type integrity ────────────────────────────────────────────────────

  test('TC-SCHEMA-009: boolean fields are booleans not integers', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.getPart(part.id);
    const body = await res.json();
    const boolFields = ['active', 'assembly', 'component', 'purchaseable', 'salable', 'trackable', 'virtual'];
    for (const f of boolFields) {
      if (f in body) {
        expect(typeof body[f]).toBe('boolean');
      }
    }
  });

  test('TC-SCHEMA-010: id is a positive integer not a string', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.getPart(part.id);
    const body = await res.json();
    expect(Number.isInteger(body.id)).toBe(true);
    expect(body.id).toBeGreaterThan(0);
  });
});