import { test, expect, request } from '@playwright/test';
import { getAuthToken, BASE_URL } from '../helpers/auth';
import { ApiClient } from '../helpers/api-client';
import { TestDataFactory } from '../helpers/test-data-factory';

test.describe('Parts Field Validation & Boundaries', () => {
  let client: ApiClient;
  let factory: TestDataFactory;
  let categoryId: number;
  let token: string;

  test.beforeAll(async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    token = await getAuthToken();
    client = new ApiClient(ctx, token, BASE_URL);
    factory = new TestDataFactory(client);
    const cat = await factory.createCategory();
    categoryId = cat.id;
  });

  test.afterAll(async () => {
    await factory.cleanup();
  });

  // ── Name boundaries ───────────────────────────────────────────────────

  test('TC-VAL-001: name of 1 character succeeds', async () => {
    const res = await client.createPart({ name: 'X', category: categoryId });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
  });

  test('TC-VAL-002: name of 100 characters succeeds', async () => {
    const res = await client.createPart({ name: 'B'.repeat(100), category: categoryId });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
  });

  test('TC-VAL-003: name of 101 characters rejected', async () => {
    const res = await client.createPart({ name: 'C'.repeat(101), category: categoryId });
    expect(res.status()).toBe(400);
  });

  test('TC-VAL-004: empty string name rejected', async () => {
    const res = await client.createPart({ name: '', category: categoryId });
    expect(res.status()).toBe(400);
  });

  // ── Description boundaries ────────────────────────────────────────────

  test('TC-VAL-005: description of 250 characters succeeds', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('desc-250'),
      description: 'D'.repeat(250),
      category: categoryId,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
  });

  test('TC-VAL-006: description null is accepted', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('desc-null'),
      description: undefined,
      category: categoryId,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
  });

  // ── Boolean fields ─────────────────────────────────────────────────────

  const booleanFields = ['active', 'assembly', 'component', 'purchaseable', 'salable', 'trackable', 'virtual'];

  for (const field of booleanFields) {
    test(`TC-VAL-BOOL: ${field}=true sets correctly`, async () => {
      const res = await client.createPart({
        name: factory.uniqueName(`bool-${field}-true`),
        category: categoryId,
        [field]: true,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body[field]).toBe(true);
      factory['registry'].push({ type: 'part', id: body.id });
    });

    test(`TC-VAL-BOOL: ${field}=false sets correctly`, async () => {
      const res = await client.createPart({
        name: factory.uniqueName(`bool-${field}-false`),
        category: categoryId,
        [field]: false,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body[field]).toBe(false);
      factory['registry'].push({ type: 'part', id: body.id });
    });
  }

  // ── minimum_stock ─────────────────────────────────────────────────────

  test('TC-VAL-007: minimum_stock=0 is valid', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('stock-zero'),
      category: categoryId,
      minimum_stock: 0,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
    expect(body.minimum_stock).toBe(0);
  });

  test('TC-VAL-008: minimum_stock=9999 is valid', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('stock-large'),
      category: categoryId,
      minimum_stock: 9999,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
    expect(body.minimum_stock).toBe(9999);
  });

  test('TC-VAL-009: minimum_stock negative rejected', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('stock-neg'),
      category: categoryId,
      minimum_stock: -1,
    });
    expect(res.status()).toBe(400);
  });

  // ── Category reference ─────────────────────────────────────────────────

  test('TC-VAL-010: non-existent category ID rejected', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('bad-cat'),
      category: 999999999,
    });
    expect(res.status()).toBe(400);
  });

  // ── Duplicate name in same category ───────────────────────────────────

  test('TC-VAL-011: duplicate name in same category behavior', async () => {
    const name = factory.uniqueName('dupe-part');
    const first = await client.createPart({ name, category: categoryId });
    expect(first.status()).toBe(201);
    const firstBody = await first.json();
    factory['registry'].push({ type: 'part', id: firstBody.id });

    // InvenTree may or may not enforce unique names — test documents actual behavior
    const second = await client.createPart({ name, category: categoryId });
    if (second.status() === 201) {
      const secondBody = await second.json();
      factory['registry'].push({ type: 'part', id: secondBody.id });
      // Duplicate allowed — different IDs
      expect(secondBody.id).not.toBe(firstBody.id);
    } else {
      expect(second.status()).toBe(400);
    }
  });

  // ── PATCH validation ──────────────────────────────────────────────────

  test('TC-VAL-012: PATCH with empty name rejected', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.updatePart(part.id, { name: '' });
    expect(res.status()).toBe(400);
  });

  test('TC-VAL-013: PATCH with name too long rejected', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.updatePart(part.id, { name: 'Z'.repeat(101) });
    expect(res.status()).toBe(400);
  });
});