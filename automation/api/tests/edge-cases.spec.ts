import { test, expect, request } from '@playwright/test';
import { getAuthToken, BASE_URL, authHeaders, invalidAuthHeaders } from '../helpers/auth';
import { ApiClient } from '../helpers/api-client';
import { TestDataFactory } from '../helpers/test-data-factory';

test.describe('Edge Cases — Auth, 404, Invalid Payloads', () => {
  let client: ApiClient;
  let factory: TestDataFactory;
  let categoryId: number;
  let rawCtx: import('@playwright/test').APIRequestContext;

  test.beforeAll(async () => {
    rawCtx = await request.newContext({ baseURL: BASE_URL });
    const token = await getAuthToken();
    client = new ApiClient(rawCtx, token, BASE_URL);
    factory = new TestDataFactory(client);
    const cat = await factory.createCategory();
    categoryId = cat.id;
  });

  test.afterAll(async () => {
    await factory.cleanup();
    await rawCtx.dispose();
  });

  // ── Authentication edge cases ─────────────────────────────────────────

  test('TC-AUTH-001: GET /api/part/ with no Authorization header → 401', async () => {
    const res = await rawCtx.get(`${BASE_URL}/api/part/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('detail');
  });

  test('TC-AUTH-002: GET /api/part/ with invalid token → 401', async () => {
    const res = await rawCtx.get(`${BASE_URL}/api/part/`, {
      headers: invalidAuthHeaders(),
    });
    expect(res.status()).toBe(401);
  });

  test('TC-AUTH-003: GET /api/part/ with valid token → 200', async () => {
    const res = await client.listParts();
    expect(res.status()).toBe(200);
  });

  test('TC-AUTH-004: POST /api/part/ with no auth → 401', async () => {
    const res = await rawCtx.post(`${BASE_URL}/api/part/`, {
      headers: { 'Content-Type': 'application/json' },
      data: { name: 'should-fail', category: categoryId },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-AUTH-005: DELETE /api/part/:id with no auth → 401', async () => {
    const part = await factory.createPart(categoryId);
    const res = await rawCtx.delete(`${BASE_URL}/api/part/${part.id}/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-AUTH-006: token endpoint rejects missing basic auth', async () => {
    const res = await rawCtx.get(`${BASE_URL}/api/user/token/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect([401, 403]).toContain(res.status());
  });

  // ── 404 / Not Found ────────────────────────────────────────────────────

  test('TC-404-001: GET /api/part/999999999/ → 404', async () => {
    const res = await client.getPart(999999999);
    expect(res.status()).toBe(404);
  });

  test('TC-404-002: PATCH /api/part/999999999/ → 404', async () => {
    const res = await client.updatePart(999999999, { name: 'ghost' });
    expect(res.status()).toBe(404);
  });

  test('TC-404-003: DELETE /api/part/999999999/ → 404', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.delete(`${BASE_URL}/api/part/999999999/`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('TC-404-004: GET /api/part/category/999999999/ → 404', async () => {
    const res = await client.getCategory(999999999);
    expect(res.status()).toBe(404);
  });

  // ── Invalid payload types ──────────────────────────────────────────────

  test('TC-INVALID-001: category as string rejected', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.post(`${BASE_URL}/api/part/`, {
      headers: authHeaders(token),
      data: { name: 'bad-cat-type', category: 'not-an-int' },
    });
    expect(res.status()).toBe(400);
  });

  test('TC-INVALID-002: minimum_stock as string rejected', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.post(`${BASE_URL}/api/part/`, {
      headers: authHeaders(token),
      data: { name: factory['uniqueName']('bad-stock'), category: categoryId, minimum_stock: 'lots' },
    });
    expect(res.status()).toBe(400);
  });

  test('TC-INVALID-003: empty request body returns 400', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.post(`${BASE_URL}/api/part/`, {
      headers: authHeaders(token),
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('TC-INVALID-004: malformed JSON content type mismatch returns error', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.post(`${BASE_URL}/api/part/`, {
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'text/plain' },
      data: 'this is not json',
    });
    expect([400, 415]).toContain(res.status());
  });

  // ── Method not allowed ─────────────────────────────────────────────────

  test('TC-METHOD-001: PATCH /api/part/ (list endpoint) → 405', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.patch(`${BASE_URL}/api/part/`, {
      headers: authHeaders(token),
      data: { name: 'oops' },
    });
    expect(res.status()).toBe(405);
  });

  test('TC-METHOD-002: DELETE /api/part/ (list endpoint) → 405', async () => {
    const token = await getAuthToken();
    const res = await rawCtx.delete(`${BASE_URL}/api/part/`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(405);
  });

  // ── Cross-resource referential integrity ──────────────────────────────

  test('TC-REF-001: variant_of points to valid part', async () => {
    const template = await factory.createPart(categoryId, {
      name: factory.uniqueName('template'),
      is_template: true,
    });
    const variant = await factory.createPart(categoryId, {
      name: factory.uniqueName('variant'),
      variant_of: template.id,
    });
    const res = await client.getPart(variant.id);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.variant_of).toBe(template.id);
  });

  test('TC-REF-002: variant_of with non-existent part ID rejected', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('bad-variant'),
      category: categoryId,
      variant_of: 999999999,
    });
    expect(res.status()).toBe(400);
  });

  // ── Concurrent creation ────────────────────────────────────────────────

  test('TC-CONCUR-001: simultaneous part creation requests all succeed', async () => {
    const names = Array.from({ length: 5 }, (_, i) => factory.uniqueName(`concurrent-${i}`));
    const results = await Promise.all(
      names.map((name) => client.createPart({ name, category: categoryId })),
    );
    for (const res of results) {
      expect(res.status()).toBe(201);
      const body = await res.json();
      factory['registry'].push({ type: 'part', id: body.id });
    }
    // All IDs should be unique
    const ids = await Promise.all(results.map((r) => r.json().then((b: any) => b.id)));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
  });
});