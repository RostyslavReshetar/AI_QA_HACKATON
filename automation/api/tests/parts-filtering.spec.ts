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

test.describe('Parts Filtering', () => {
  // Seed data for filtering tests
  let activePart: any;
  let inactivePart: any;
  let assemblyPart: any;
  let templatePart: any;
  let salablePart: any;
  let trackablePart: any;
  let searchablePart: any;

  test.beforeAll(async () => {
    const ts = Date.now();

    activePart = await client.createPart(
      generatePartData({ name: `FilterActive_${ts}`, active: true }),
    );
    registerForCleanup('part', activePart.pk);

    inactivePart = await client.createPart(
      generatePartData({ name: `FilterInactive_${ts}`, active: false }),
    );
    registerForCleanup('part', inactivePart.pk);

    assemblyPart = await client.createPart(
      generatePartData({ name: `FilterAssembly_${ts}`, assembly: true }),
    );
    registerForCleanup('part', assemblyPart.pk);

    templatePart = await client.createPart(
      generatePartData({ name: `FilterTemplate_${ts}`, is_template: true }),
    );
    registerForCleanup('part', templatePart.pk);

    salablePart = await client.createPart(
      generatePartData({ name: `FilterSalable_${ts}`, salable: true }),
    );
    registerForCleanup('part', salablePart.pk);

    trackablePart = await client.createPart(
      generatePartData({ name: `FilterTrackable_${ts}`, trackable: true }),
    );
    registerForCleanup('part', trackablePart.pk);

    searchablePart = await client.createPart(
      generatePartData({ name: `UniqueSearchTerm_XYZ789_${ts}`, description: 'Searchable part' }),
    );
    registerForCleanup('part', searchablePart.pk);
  });

  test('filter by active=true returns only active parts', async () => {
    const list = await client.listParts({ active: 'true', limit: '100' });
    expect(list.results.length, 'should return active parts').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.active, `part ${part.pk} should be active`).toBe(true);
    }
  });

  test('filter by active=false returns only inactive parts', async () => {
    const list = await client.listParts({ active: 'false', limit: '100' });
    expect(list.results.length, 'should return inactive parts').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.active, `part ${part.pk} should be inactive`).toBe(false);
    }
  });

  test('filter by category=1 returns parts in Electronics', async () => {
    const list = await client.listParts({ category: '1', limit: '100' });
    expect(list.results.length, 'should return parts in category 1').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.category, `part ${part.pk} should be in category 1`).toBe(1);
    }
  });

  test('filter by assembly=true returns assembly parts', async () => {
    const list = await client.listParts({ assembly: 'true', limit: '100' });
    expect(list.results.length, 'should return at least one assembly part').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.assembly, `part ${part.pk} should be assembly`).toBe(true);
    }
  });

  test('filter by is_template=true returns template parts', async () => {
    const list = await client.listParts({ is_template: 'true', limit: '100' });
    expect(list.results.length, 'should return at least one template part').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.is_template, `part ${part.pk} should be template`).toBe(true);
    }
  });

  test('filter by purchaseable=true', async () => {
    const list = await client.listParts({ purchaseable: 'true', limit: '100' });
    expect(list.results.length, 'should return purchaseable parts').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.purchaseable, `part ${part.pk} should be purchaseable`).toBe(true);
    }
  });

  test('filter by salable=true', async () => {
    const list = await client.listParts({ salable: 'true', limit: '100' });
    expect(list.results.length, 'should return salable parts').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.salable, `part ${part.pk} should be salable`).toBe(true);
    }
  });

  test('filter by trackable=true', async () => {
    const list = await client.listParts({ trackable: 'true', limit: '100' });
    expect(list.results.length, 'should return trackable parts').toBeGreaterThan(0);
    for (const part of list.results) {
      expect(part.trackable, `part ${part.pk} should be trackable`).toBe(true);
    }
  });

  test('search by name', async () => {
    const list = await client.listParts({ search: 'UniqueSearchTerm_XYZ789', limit: '100' });
    expect(list.results.length, 'search should return at least one result').toBeGreaterThanOrEqual(1);
    const found = list.results.some((p) => p.name.includes('UniqueSearchTerm_XYZ789'));
    expect(found, 'search results should contain the searchable part').toBe(true);
  });

  test('pagination: limit=2 returns correct structure', async () => {
    const list = await client.listParts({ limit: '2' });
    expect(list.results.length, 'results should be at most 2').toBeLessThanOrEqual(2);
    expect(typeof list.count, 'count should be a number').toBe('number');
    if (list.count > 2) {
      expect(list.next, 'next should be a URL when more pages exist').toBeTruthy();
    }
  });

  test('pagination: offset returns subsequent page', async () => {
    const page1 = await client.listParts({ limit: '2', offset: '0' });
    const page2 = await client.listParts({ limit: '2', offset: '2' });

    if (page1.count > 2) {
      expect(page2.results.length, 'page 2 should have results').toBeGreaterThan(0);
      // Ensure no overlap
      const page1Ids = page1.results.map((p) => p.pk);
      const page2Ids = page2.results.map((p) => p.pk);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap.length, 'pages should not overlap').toBe(0);
    }
  });

  test('ordering by name ascending', async () => {
    const list = await client.listParts({ ordering: 'name', limit: '50' });
    const names = list.results.map((p) => p.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names, 'names should be in ascending order').toEqual(sorted);
  });

  test('ordering by name descending', async () => {
    const list = await client.listParts({ ordering: '-name', limit: '50' });
    const names = list.results.map((p) => p.name);
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names, 'names should be in descending order').toEqual(sorted);
  });

  test('combined filters: category + active + search', async () => {
    const list = await client.listParts({
      category: '1',
      active: 'true',
      search: 'FilterActive',
      limit: '100',
    });
    expect(list.results.length, 'combined filter should return results').toBeGreaterThanOrEqual(1);
    for (const part of list.results) {
      expect(part.category, 'part should be in category 1').toBe(1);
      expect(part.active, 'part should be active').toBe(true);
    }
  });
});
