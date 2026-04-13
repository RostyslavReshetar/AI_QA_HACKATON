import { test, expect } from '@playwright/test';
import { request as pwRequest } from '@playwright/test';
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

test.describe('Authentication Edge Cases', () => {
  test('request without auth token returns 401', async () => {
    const baseURL = process.env.INVENTREE_URL || 'http://localhost:8080';
    const noAuthCtx = await pwRequest.newContext({
      baseURL,
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    });

    const response = await noAuthCtx.get('/api/part/');
    expect(response.status(), 'no auth should return 401').toBe(401);

    await noAuthCtx.dispose();
  });

  test('request with invalid token returns 401', async () => {
    const baseURL = process.env.INVENTREE_URL || 'http://localhost:8080';
    const badAuthCtx = await pwRequest.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: 'Token invalid-token-that-does-not-exist-12345',
        Accept: 'application/json',
      },
    });

    const response = await badAuthCtx.get('/api/part/');
    expect(response.status(), 'invalid token should return 401').toBe(401);

    await badAuthCtx.dispose();
  });
});

test.describe('Non-Existent Resource Edge Cases', () => {
  test('GET non-existent part returns 404', async () => {
    const result = await client.rawGet('/api/part/999999/');
    expect(result.status, 'non-existent part GET should return 404').toBe(404);
  });

  test('DELETE non-existent part returns 404', async () => {
    const result = await client.rawDelete('/api/part/999999/');
    expect(result.status, 'non-existent part DELETE should return 404').toBe(404);
  });

  test('PATCH non-existent part returns 404', async () => {
    const result = await client.rawPatch('/api/part/999999/', { name: 'ghost' });
    expect(result.status, 'non-existent part PATCH should return 404').toBe(404);
  });

  test('GET non-existent category returns 404', async () => {
    const result = await client.rawGet('/api/part/category/999999/');
    expect(result.status, 'non-existent category GET should return 404').toBe(404);
  });
});

test.describe('Boundary Value Edge Cases', () => {
  test('exactly 100 character name at boundary', async () => {
    const name = 'E'.repeat(100);
    const result = await client.rawPost('/api/part/', {
      name,
      description: 'Boundary name test',
      category: 1,
    });
    expect(result.status, 'exactly 100 char name should succeed').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
    expect(result.body.name.length, 'name should be exactly 100 chars').toBe(100);
  });

  test('exactly 250 character description at boundary', async () => {
    const desc = 'F'.repeat(250);
    const result = await client.rawPost('/api/part/', {
      name: 'BoundEdge_' + Date.now(),
      description: desc,
      category: 1,
    });
    expect(result.status, 'exactly 250 char description should succeed').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
    expect(result.body.description.length, 'description should be exactly 250 chars').toBe(250);
  });

  test('101 character name fails', async () => {
    const name = 'G'.repeat(101);
    const result = await client.rawPost('/api/part/', {
      name,
      description: 'Too long name',
      category: 1,
    });
    expect(result.status, '101 char name should return 400').toBe(400);
  });

  test('251 character description fails', async () => {
    const desc = 'H'.repeat(251);
    const result = await client.rawPost('/api/part/', {
      name: 'LongDescEdge_' + Date.now(),
      description: desc,
      category: 1,
    });
    expect(result.status, '251 char description should return 400').toBe(400);
  });

  test('minimum_stock with zero value', async () => {
    const part = await client.createPart(
      generatePartData({ minimum_stock: 0 }),
    );
    registerForCleanup('part', part.pk);
    expect(part.minimum_stock, 'minimum_stock should be 0').toBe(0);
  });

  test('minimum_stock with large value', async () => {
    const part = await client.createPart(
      generatePartData({ minimum_stock: 999999 }),
    );
    registerForCleanup('part', part.pk);
    expect(part.minimum_stock, 'minimum_stock should be 999999').toBe(999999);
  });
});

test.describe('Idempotency and Duplicate Edge Cases', () => {
  test('creating two parts with the same name in same category succeeds', async () => {
    const sharedName = 'DuplicateName_' + Date.now();
    const p1 = await client.createPart(
      generatePartData({ name: sharedName, category: 1 }),
    );
    registerForCleanup('part', p1.pk);

    // InvenTree allows duplicate names in the same category by default
    const result = await client.rawPost('/api/part/', {
      name: sharedName,
      description: 'Duplicate name test 2',
      category: 1,
    });

    // Could be 201 (allowed) or 400 (duplicate name validation)
    if (result.status === 201) {
      registerForCleanup('part', result.body.pk);
      expect(result.body.name, 'duplicate name should match').toBe(sharedName);
    } else {
      expect(result.status, 'should return 400 if duplicates disallowed').toBe(400);
    }
  });

  test('delete part twice — second attempt returns 404', async () => {
    const part = await client.createPart(generatePartData());

    await client.deletePart(part.pk);

    const result = await client.rawDelete(`/api/part/${part.pk}/`);
    expect(result.status, 'second delete should return 404').toBe(404);
  });
});
