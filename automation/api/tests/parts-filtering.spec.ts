import { test, expect, request } from '@playwright/test';
import { getAuthToken, BASE_URL } from '../helpers/auth';
import { ApiClient } from '../helpers/api-client';
import { TestDataFactory } from '../helpers/test-data-factory';

test.describe('Parts Filtering, Search & Pagination', () => {
  let client: ApiClient;
  let factory: TestDataFactory;
  let categoryA: number;
  let categoryB: number;
  let assemblyPartId: number;
  let componentPartId: number;
  let inactivePartId: number;

  test.beforeAll(async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const token = await getAuthToken();
    client = new ApiClient(ctx, token, BASE_URL);
    factory = new TestDataFactory(client);

    const catA = await factory.createCategory({ name: factory.uniqueName('filter-cat-A') });
    const catB = await factory.createCategory({ name: factory.uniqueName('filter-cat-B') });
    categoryA = catA.id;
    categoryB = catB.id;

    const assembly = await factory.createPart(categoryA, {
      name: factory.uniqueName('assembly-widget'),
      assembly: true,
      active: true,
    });
    assemblyPartId = assembly.id;

    const component = await factory.createPart(categoryB, {
      name: factory.uniqueName('component-resistor'),
      component: true,
      active: true,
    });
    componentPartId = component.id;

    const inactive = await factory.createPart(categoryA, {
      name: factory.uniqueName('inactive-part'),
      active: false,
    });
    inactivePartId = inactive.id;
  });

  test.afterAll(async () => {
    await factory.cleanup();
  });

  // ── Category filter ───────────────────────────────────────────────────

  test('TC-FILTER-001: filter by category returns only that category', async () => {
    const res = await client.listParts({ category: categoryA });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const part of body.results) {
      expect(part.category).toBe(categoryA);
    }
  });

  test('TC-FILTER-002: filter by different category excludes other', async () => {
    const res = await client.listParts({ category: categoryB });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const ids = body.results.map((p: any) => p.id);
    expect(ids).not.toContain(assemblyPartId); // assemblyPartId is in categoryA
  });

  // ── Assembly / Component filters ──────────────────────────────────────

  test('TC-FILTER-003: filter assembly=true returns only assemblies', async () => {
    const res = await client.listParts({ assembly: true });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const part of body.results) {
      expect(part.assembly).toBe(true);
    }
  });

  test('TC-FILTER-004: filter component=true returns only components', async () => {
    const res = await client.listParts({ component: true });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const part of body.results) {
      expect(part.component).toBe(true);
    }
  });

  // ── Active filter ─────────────────────────────────────────────────────

  test('TC-FILTER-005: active=true excludes inactive parts', async () => {
    const res = await client.listParts({ active: true });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const ids = body.results.map((p: any) => p.id);
    expect(ids).not.toContain(inactivePartId);
  });

  test('TC-FILTER-006: active=false returns inactive parts', async () => {
    const res = await client.listParts({ active: false });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const ids = body.results.map((p: any) => p.id);
    expect(ids).toContain(inactivePartId);
  });

  // ── Search ────────────────────────────────────────────────────────────

  test('TC-FILTER-007: search by name substring returns matching parts', async () => {
    const res = await client.listParts({ search: 'assembly-widget' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const found = body.results.some((p: any) => p.id === assemblyPartId);
    expect(found).toBe(true);
  });

  test('TC-FILTER-008: search with no match returns empty results', async () => {
    const res = await client.listParts({ search: 'ZZZNOMATCH999XYZ' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBe(0);
  });

  // ── Combined filters ──────────────────────────────────────────────────

  test('TC-FILTER-009: category + assembly combined filter', async () => {
    const res = await client.listParts({ category: categoryA, assembly: true });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const part of body.results) {
      expect(part.category).toBe(categoryA);
      expect(part.assembly).toBe(true);
    }
  });

  // ── Pagination ────────────────────────────────────────────────────────

  test('TC-FILTER-010: limit parameter restricts result count', async () => {
    const res = await client.listParts({ limit: 2 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBeLessThanOrEqual(2);
  });

  test('TC-FILTER-011: offset parameter skips records', async () => {
    const first = await client.listParts({ limit: 1, offset: 0 });
    const second = await client.listParts({ limit: 1, offset: 1 });

    const firstBody = await first.json();
    const secondBody = await second.json();

    if (firstBody.count >= 2) {
      expect(firstBody.results[0].id).not.toBe(secondBody.results[0].id);
    }
  });

  test('TC-FILTER-012: next/previous links are consistent with pagination', async () => {
    const res = await client.listParts({ limit: 1 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.count > 1) {
      expect(body.next).not.toBeNull();
    }
    expect(body.previous).toBeNull(); // first page has no previous
  });

  // ── Ordering ──────────────────────────────────────────────────────────

  test('TC-FILTER-013: ordering by name ascending', async () => {
    const res = await client.listParts({ ordering: 'name', limit: 10 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const names: string[] = body.results.map((p: any) => p.name as string);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('TC-FILTER-014: ordering by name descending', async () => {
    const res = await client.listParts({ ordering: '-name', limit: 10 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const names: string[] = body.results.map((p: any) => p.name as string);
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });
});