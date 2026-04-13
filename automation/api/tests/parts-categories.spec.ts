import { test, expect } from '@playwright/test';
import { createAuthContext } from '../helpers/auth.js';
import { ApiClient } from '../helpers/api-client.js';
import {
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

test.describe('Category Operations', () => {
  test('create root category', async () => {
    const data = generateCategoryData({ parent: null });
    const category = await client.createCategory(data);
    registerForCleanup('category', category.pk);

    expect(category.pk, 'pk should be positive').toBeGreaterThan(0);
    expect(category.name, 'name should match').toBe(data.name);
    expect(category.description, 'description should match').toBe(data.description);
    expect(category.parent, 'parent should be null for root').toBeNull();
    expect(category.level, 'level should be 0 for root').toBe(0);
  });

  test('create subcategory with parent', async () => {
    // Create parent first
    const parentData = generateCategoryData({ parent: null });
    const parent = await client.createCategory(parentData);
    registerForCleanup('category', parent.pk);

    // Create child
    const childData = generateCategoryData({ parent: parent.pk });
    const child = await client.createCategory(childData);
    registerForCleanup('category', child.pk);

    expect(child.parent, 'child parent should match parent pk').toBe(parent.pk);
    expect(child.level, 'child level should be 1').toBe(1);
    expect(child.pathstring, 'pathstring should contain parent name').toContain(parent.name);
  });

  test('get category tree — root categories have depth 0', async () => {
    const tree = await client.getCategoryTree();

    expect(Array.isArray(tree), 'tree should be an array').toBe(true);
    expect(tree.length, 'tree should have categories').toBeGreaterThan(0);

    // All returned categories at depth 0 should have level 0
    for (const cat of tree) {
      expect(cat.level, 'root categories should have level 0').toBe(0);
    }
  });

  test('list categories returns seeded categories', async () => {
    const categories = await client.listCategories();

    expect(Array.isArray(categories), 'should return an array').toBe(true);

    const names = categories.map((c) => c.name);
    expect(names, 'should include Electronics').toContain('Electronics');
    expect(names, 'should include Mechanical').toContain('Mechanical');
  });

  test('list categories with parent filter', async () => {
    // Children of Electronics (pk=1)
    const children = await client.listCategories({ parent: 1 });

    expect(Array.isArray(children), 'should return an array').toBe(true);
    expect(children.length, 'Electronics should have subcategories').toBeGreaterThanOrEqual(4);

    for (const child of children) {
      expect(child.parent, `${child.name} should have parent=1`).toBe(1);
    }
  });

  test('get single category by ID', async () => {
    const category = await client.getCategory(1);

    expect(category.pk, 'pk should be 1').toBe(1);
    expect(category.name, 'name should be Electronics').toBe('Electronics');
    expect(category.parent, 'Electronics should be root').toBeNull();
  });

  test('delete category', async () => {
    const data = generateCategoryData();
    const created = await client.createCategory(data);

    const deleteStatus = await client.deleteCategory(created.pk);
    expect([200, 204], 'delete should return 200 or 204').toContain(deleteStatus);

    // Verify deletion
    try {
      await client.getCategory(created.pk);
      expect(false, 'get after delete should throw').toBe(true);
    } catch (err: any) {
      expect(err.status, 'should return 404 after deletion').toBe(404);
    }
  });

  test('create structural category', async () => {
    const data = generateCategoryData({ structural: true });
    const category = await client.createCategory(data);
    registerForCleanup('category', category.pk);

    expect(category.structural, 'should be structural').toBe(true);
  });
});
