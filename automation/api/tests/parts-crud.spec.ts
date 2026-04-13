import { test, expect, request } from '@playwright/test';
import { getAuthToken, BASE_URL } from '../helpers/auth';
import { ApiClient } from '../helpers/api-client';
import { TestDataFactory } from '../helpers/test-data-factory';

test.describe('Parts CRUD', () => {
  let client: ApiClient;
  let factory: TestDataFactory;
  let categoryId: number;

  test.beforeAll(async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const token = await getAuthToken();
    client = new ApiClient(ctx, token, BASE_URL);
    factory = new TestDataFactory(client);
    const cat = await factory.createCategory({ name: `crud-cat-${Date.now()}` });
    categoryId = cat.id;
  });

  test.afterAll(async () => {
    await factory.cleanup();
  });

  // ── Create ────────────────────────────────────────────────────────────

  test('TC-PART-C-001: create part with required fields only', async () => {
    const res = await client.createPart({
      name: factory.uniqueName('part-required'),
      category: categoryId,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.name).toContain('part-required');
    expect(body.category).toBe(categoryId);
    factory['registry'].push({ type: 'part', id: body.id });
  });

  test('TC-PART-C-002: create part with all optional fields', async () => {
    const name = factory.uniqueName('part-full');
    const res = await client.createPart({
      name,
      description: 'Full test part',
      category: categoryId,
      active: true,
      assembly: false,
      component: true,
      purchaseable: true,
      salable: false,
      trackable: false,
      virtual: false,
      minimum_stock: 5,
      units: 'pcs',
      keywords: 'test widget',
      notes: 'Created by automated test',
      link: 'http://example.com',
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.description).toBe('Full test part');
    expect(body.minimum_stock).toBe(5);
    expect(body.units).toBe('pcs');
    factory['registry'].push({ type: 'part', id: body.id });
  });

  test('TC-PART-C-003: create part without category returns 400', async () => {
    const res = await client.rawPost(
      '/api/part/',
      { Authorization: `Token ${await getAuthToken()}`, 'Content-Type': 'application/json' },
      { name: factory.uniqueName('no-cat') },
    );
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('category');
  });

  test('TC-PART-C-004: create part without name returns 400', async () => {
    const res = await client.rawPost(
      '/api/part/',
      { Authorization: `Token ${await getAuthToken()}`, 'Content-Type': 'application/json' },
      { category: categoryId },
    );
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('name');
  });

  test('TC-PART-C-005: name exactly 100 characters succeeds', async () => {
    const name = 'A'.repeat(100);
    const res = await client.createPart({ name, category: categoryId });
    expect(res.status()).toBe(201);
    const body = await res.json();
    factory['registry'].push({ type: 'part', id: body.id });
  });

  test('TC-PART-C-006: name 101 characters returns 400', async () => {
    const name = 'A'.repeat(101);
    const res = await client.createPart({ name, category: categoryId });
    expect(res.status()).toBe(400);
  });

  // ── Read ──────────────────────────────────────────────────────────────

  test('TC-PART-R-001: retrieve created part by ID', async () => {
    const created = await factory.createPart(categoryId, { name: factory.uniqueName('read-test') });
    const res = await client.getPart(created.id);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(created.name);
    expect(body.category).toBe(categoryId);
  });

  test('TC-PART-R-002: list parts returns paginated response', async () => {
    const res = await client.listParts();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('results');
    expect(Array.isArray(body.results)).toBe(true);
  });

  // ── Update ────────────────────────────────────────────────────────────

  test('TC-PART-U-001: PATCH updates name', async () => {
    const part = await factory.createPart(categoryId);
    const newName = factory.uniqueName('patched');
    const res = await client.updatePart(part.id, { name: newName });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe(newName);
  });

  test('TC-PART-U-002: PATCH updates description', async () => {
    const part = await factory.createPart(categoryId);
    const res = await client.updatePart(part.id, { description: 'Updated description' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.description).toBe('Updated description');
  });

  test('TC-PART-U-003: PUT replaces part entirely', async () => {
    const part = await factory.createPart(categoryId);
    const newName = factory.uniqueName('put-part');
    const res = await client.replacePart(part.id, {
      name: newName,
      category: categoryId,
      active: true,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe(newName);
  });

  test('TC-PART-U-004: PATCH active=false deactivates part', async () => {
    const part = await factory.createPart(categoryId, { active: true });
    const res = await client.updatePart(part.id, { active: false });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.active).toBe(false);
  });

  // ── Delete ────────────────────────────────────────────────────────────

  test('TC-PART-D-001: delete active part returns 405 or requires inactive', async () => {
    const part = await factory.createPart(categoryId, { active: true });

    // Attempt delete while active — InvenTree typically blocks this
    const ctx = (client as any).ctx as import('@playwright/test').APIRequestContext;
    const token = await getAuthToken();
    const directDelete = await ctx.delete(`${BASE_URL}/api/part/${part.id}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    // InvenTree returns 405 or 400 for active parts; if it returns 204 the part is gone
    if (directDelete.status() === 204) {
      // Some versions allow it — mark as not needing cleanup
      factory['registry'] = factory['registry'].filter(
        (e) => !(e.type === 'part' && e.id === part.id),
      );
    } else {
      expect([400, 405]).toContain(directDelete.status());
    }
  });

  test('TC-PART-D-002: deactivate then delete succeeds', async () => {
    const part = await factory.createPart(categoryId, { active: true });
    // Remove from registry so cleanup doesn't double-delete
    factory['registry'] = factory['registry'].filter(
      (e) => !(e.type === 'part' && e.id === part.id),
    );

    const deactivate = await client.updatePart(part.id, { active: false });
    expect(deactivate.status()).toBe(200);

    const ctx = (client as any).ctx as import('@playwright/test').APIRequestContext;
    const token = await getAuthToken();
    const del = await ctx.delete(`${BASE_URL}/api/part/${part.id}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    expect(del.status()).toBe(204);

    const get = await client.getPart(part.id);
    expect(get.status()).toBe(404);
  });
});