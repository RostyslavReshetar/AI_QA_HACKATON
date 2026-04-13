import { test, expect } from '@playwright/test';
import { createAuthContext } from '../helpers/auth.js';
import { ApiClient } from '../helpers/api-client.js';
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

test.describe('Part-Category Relationships', () => {
  test('create part with category populates category_name', async () => {
    // POST response includes category_detail and category_path
    const part = await client.createPart(
      generatePartData({ category: 1 }),
    );
    registerForCleanup('part', part.pk);

    expect(part.category, 'category should be 1').toBe(1);
    expect(part.category_name, 'category_name should be Electronics').toBe('Electronics');
    expect(part.category_detail, 'category_detail should be populated').toBeTruthy();
    expect(part.category_detail.name, 'category_detail.name should be Electronics').toBe('Electronics');
  });

  test('change part category updates category_name', async () => {
    const part = await client.createPart(
      generatePartData({ category: 1 }),
    );
    registerForCleanup('part', part.pk);

    expect(part.category_name, 'initially should be Electronics').toBe('Electronics');

    // PATCH response also includes category_name
    const updated = await client.updatePart(part.pk, { category: 6 });

    expect(updated.category, 'category should now be 6').toBe(6);
    expect(updated.category_name, 'category_name should be Mechanical').toBe('Mechanical');
  });

  test('create part in subcategory has correct category_path', async () => {
    // Resistors is pk=2, child of Electronics pk=1
    // POST response includes category_path
    const part = await client.createPart(
      generatePartData({ category: 2 }),
    );
    registerForCleanup('part', part.pk);

    expect(part.category, 'category should be 2').toBe(2);
    expect(part.category_name, 'category_name should be Resistors').toBe('Resistors');
    expect(Array.isArray(part.category_path), 'category_path should be an array').toBe(true);
    expect(part.category_path.length, 'category_path should have 2 entries').toBe(2);
    expect(part.category_path[0].name, 'first path entry should be Electronics').toBe('Electronics');
    expect(part.category_path[1].name, 'second path entry should be Resistors').toBe('Resistors');
  });

  test('GET detail view includes category_name', async () => {
    const created = await client.createPart(
      generatePartData({ category: 1 }),
    );
    registerForCleanup('part', created.pk);

    const fetched = await client.getPart(created.pk);
    expect(fetched.category_name, 'GET detail should have category_name').toBe('Electronics');
  });
});

test.describe('Template and Variant Relationships', () => {
  test('create template part and variant', async () => {
    const template = await client.createPart(
      generatePartData({
        name: 'TemplPart_' + Date.now(),
        is_template: true,
      }),
    );
    registerForCleanup('part', template.pk);

    expect(template.is_template, 'should be a template').toBe(true);

    const variant = await client.createPart(
      generatePartData({
        name: 'VariantPart_' + Date.now(),
        variant_of: template.pk,
      }),
    );
    registerForCleanup('part', variant.pk);

    expect(variant.variant_of, 'variant_of should reference template pk').toBe(template.pk);
  });

  test('variant_of with non-template part', async () => {
    const regular = await client.createPart(
      generatePartData({ is_template: false }),
    );
    registerForCleanup('part', regular.pk);

    const result = await client.rawPost('/api/part/', {
      ...generatePartData({
        name: 'BadVariant_' + Date.now(),
        variant_of: regular.pk,
      }),
    });

    // InvenTree may allow or reject depending on config
    if (result.status === 201) {
      registerForCleanup('part', result.body.pk);
    }
    expect([201, 400], 'should either succeed or return 400').toContain(result.status);
  });
});

test.describe('Revision Constraints', () => {
  test('create part with revision field', async () => {
    const part = await client.createPart(
      generatePartData({
        name: 'RevisionPart_' + Date.now(),
        revision: 'A',
      }),
    );
    registerForCleanup('part', part.pk);

    expect(part.revision, 'revision should be set to A').toBe('A');
  });

  test('update revision on existing part', async () => {
    const part = await client.createPart(
      generatePartData({ revision: '' }),
    );
    registerForCleanup('part', part.pk);

    const updated = await client.updatePart(part.pk, { revision: 'B' });
    expect(updated.revision, 'revision should be updated to B').toBe('B');
  });

  test('revision_of and revision_count are present', async () => {
    const part = await client.createPart(generatePartData());
    registerForCleanup('part', part.pk);

    expect(part, 'should have revision_of field').toHaveProperty('revision_of');
    expect(part, 'should have revision_count field').toHaveProperty('revision_count');
  });
});
