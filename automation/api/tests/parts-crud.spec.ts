import { test, expect } from '@playwright/test';
import { createAuthContext } from '../helpers/auth.js';
import { ApiClient } from '../helpers/api-client.js';
import {
  generatePartData,
  generateCategoryData,
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

test.describe('Parts CRUD Operations', () => {
  test('POST /api/part/ — create part with minimum required fields', async () => {
    const data = generatePartData();
    const part = await client.createPart(data);

    registerForCleanup('part', part.pk);

    expect(part.pk, 'pk should be a positive integer').toBeGreaterThan(0);
    expect(part.name, 'name should match input').toBe(data.name);
    expect(part.description, 'description should match input').toBe(data.description);
    expect(part.category, 'category should match input').toBe(data.category);
    expect(part.active, 'active should default to true').toBe(true);
  });

  test('POST /api/part/ — create part with all fields populated', async () => {
    const data = generatePartData({
      IPN: 'IPN-001',
      active: true,
      assembly: true,
      component: false,
      is_template: false,
      purchaseable: true,
      salable: true,
      trackable: true,
      testable: true,
      virtual: false,
      keywords: 'test,automation',
      link: 'https://example.com/part',
      minimum_stock: 10,
      default_expiry: 30,
      units: 'pcs',
    });

    const part = await client.createPart(data);
    registerForCleanup('part', part.pk);

    expect(part.IPN, 'IPN should match input').toBe('IPN-001');
    expect(part.assembly, 'assembly should match input').toBe(true);
    expect(part.component, 'component should match input').toBe(false);
    expect(part.salable, 'salable should match input').toBe(true);
    expect(part.trackable, 'trackable should match input').toBe(true);
    expect(part.testable, 'testable should match input').toBe(true);
    expect(part.keywords, 'keywords should match input').toBe('test,automation');
    expect(part.link, 'link should match input').toBe('https://example.com/part');
    expect(part.minimum_stock, 'minimum_stock should match input').toBe(10);
    expect(part.default_expiry, 'default_expiry should match input').toBe(30);
    expect(part.units, 'units should match input').toBe('pcs');

    // Read-only fields should be populated
    expect(part.full_name, 'full_name should be populated').toBeTruthy();
    expect(part.creation_date, 'creation_date should be populated').toBeTruthy();
    expect(part.category_name, 'category_name should be populated').toBeTruthy();
  });

  test('GET /api/part/{id}/ — get single part with all fields present', async () => {
    const created = await client.createPart(generatePartData());
    registerForCleanup('part', created.pk);

    const part = await client.getPart(created.pk);

    expect(part.pk, 'pk should match').toBe(created.pk);
    expect(part.name, 'name should match').toBe(created.name);
    expect(part.description, 'description should be present').toBeDefined();
    expect(part.category, 'category should be present').toBeDefined();
    expect(part.category_name, 'category_name should be populated').toBeTruthy();
    expect(typeof part.active, 'active should be boolean').toBe('boolean');
    expect(typeof part.assembly, 'assembly should be boolean').toBe('boolean');
    expect(typeof part.component, 'component should be boolean').toBe('boolean');
    expect(typeof part.purchaseable, 'purchaseable should be boolean').toBe('boolean');
    expect(typeof part.salable, 'salable should be boolean').toBe('boolean');
    expect(typeof part.trackable, 'trackable should be boolean').toBe('boolean');
    expect(part.full_name, 'full_name should be present').toBeTruthy();
    expect(part.creation_date, 'creation_date should be present').toBeTruthy();
  });

  test('GET /api/part/ — list parts with pagination structure', async () => {
    // Create a few parts so the list is non-empty
    const p1 = await client.createPart(generatePartData());
    const p2 = await client.createPart(generatePartData());
    registerForCleanup('part', p1.pk);
    registerForCleanup('part', p2.pk);

    const list = await client.listParts({ limit: '25' });

    expect(typeof list.count, 'count should be a number').toBe('number');
    expect(list.count, 'count should be >= 2').toBeGreaterThanOrEqual(2);
    expect(Array.isArray(list.results), 'results should be an array').toBe(true);
    expect(list.results.length, 'results should have items').toBeGreaterThan(0);
    expect(list, 'response should have next field').toHaveProperty('next');
    expect(list, 'response should have previous field').toHaveProperty('previous');
  });

  test('PATCH /api/part/{id}/ — update single field', async () => {
    const created = await client.createPart(generatePartData());
    registerForCleanup('part', created.pk);

    const newDescription = 'Updated description via PATCH';
    const updated = await client.updatePart(created.pk, { description: newDescription });

    expect(updated.description, 'description should be updated').toBe(newDescription);
    expect(updated.name, 'name should remain unchanged').toBe(created.name);
    expect(updated.category, 'category should remain unchanged').toBe(created.category);
    expect(updated.active, 'active should remain unchanged').toBe(created.active);
  });

  test('PUT /api/part/{id}/ — full update', async () => {
    const created = await client.createPart(generatePartData());
    registerForCleanup('part', created.pk);

    const fullData = {
      name: created.name,
      description: 'Fully replaced description',
      category: created.category,
      active: false,
      assembly: true,
      salable: true,
    };

    const updated = await client.updatePart(created.pk, fullData, 'PUT');

    expect(updated.description, 'description should be updated').toBe('Fully replaced description');
    expect(updated.active, 'active should be updated to false').toBe(false);
    expect(updated.assembly, 'assembly should be updated to true').toBe(true);
    expect(updated.salable, 'salable should be updated to true').toBe(true);
  });

  test('DELETE /api/part/{id}/ — deactivate, delete, verify 404 on GET', async () => {
    const created = await client.createPart(generatePartData());

    // InvenTree requires part to be inactive before deletion
    const deleteStatus = await client.deletePart(created.pk);
    expect(deleteStatus, 'delete should return 204').toBe(204);

    // Verify the part is gone
    try {
      await client.getPart(created.pk);
      expect(false, 'GET after delete should have thrown').toBe(true);
    } catch (err: any) {
      expect(err.status, 'GET after delete should return 404').toBe(404);
    }
  });

  test('POST + DELETE /api/part/category/ — create and delete category', async () => {
    const catData = generateCategoryData();
    const category = await client.createCategory(catData);

    expect(category.pk, 'category pk should be positive').toBeGreaterThan(0);
    expect(category.name, 'category name should match').toBe(catData.name);
    expect(category.description, 'category description should match').toBe(catData.description);

    const deleteStatus = await client.deleteCategory(category.pk);
    expect([204, 200], 'category delete should return 204 or 200').toContain(deleteStatus);
  });
});
