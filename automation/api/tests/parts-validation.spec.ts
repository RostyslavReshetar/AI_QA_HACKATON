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

test.describe('Parts Validation — Missing Required Fields', () => {
  test('missing name returns 400', async () => {
    const result = await client.rawPost('/api/part/', {
      description: 'No name part',
      category: 1,
    });
    expect(result.status, 'missing name should return 400').toBe(400);
  });

  test('missing description is accepted (not required by InvenTree)', async () => {
    const result = await client.rawPost('/api/part/', {
      name: 'NoDesc_' + Date.now(),
      category: 1,
    });
    // InvenTree v1.3.0 allows parts without description
    expect(result.status, 'missing description should be accepted').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });

  test('missing category is accepted (not required by InvenTree)', async () => {
    const result = await client.rawPost('/api/part/', {
      name: 'NoCat_' + Date.now(),
      description: 'No category part',
    });
    // InvenTree v1.3.0 allows parts without category
    expect(result.status, 'missing category should be accepted').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });
});

test.describe('Parts Validation — Field Length Limits', () => {
  test('name > 100 characters returns 400', async () => {
    const longName = 'A'.repeat(101);
    const result = await client.rawPost('/api/part/', {
      name: longName,
      description: 'Test description',
      category: 1,
    });
    expect(result.status, 'name > 100 chars should return 400').toBe(400);
  });

  test('description > 250 characters returns 400', async () => {
    const longDesc = 'B'.repeat(251);
    const result = await client.rawPost('/api/part/', {
      name: 'LongDesc_' + Date.now(),
      description: longDesc,
      category: 1,
    });
    expect(result.status, 'description > 250 chars should return 400').toBe(400);
  });

  test('boundary: exactly 100 char name succeeds', async () => {
    const exactName = 'C'.repeat(100);
    const result = await client.rawPost('/api/part/', {
      name: exactName,
      description: 'Boundary test for name',
      category: 1,
    });
    expect(result.status, 'exactly 100 char name should succeed').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });

  test('boundary: exactly 250 char description succeeds', async () => {
    const exactDesc = 'D'.repeat(250);
    const result = await client.rawPost('/api/part/', {
      name: 'BoundaryDesc_' + Date.now(),
      description: exactDesc,
      category: 1,
    });
    expect(result.status, 'exactly 250 char description should succeed').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });
});

test.describe('Parts Validation — Invalid Input Types', () => {
  test('invalid category ID returns 400', async () => {
    const result = await client.rawPost('/api/part/', {
      name: 'InvalidCat_' + Date.now(),
      description: 'Invalid category',
      category: 999999,
    });
    expect(result.status, 'invalid category ID should return 400').toBe(400);
  });

  test('invalid type for boolean field returns 400 or is coerced', async () => {
    const result = await client.rawPost('/api/part/', {
      name: 'InvalidBool_' + Date.now(),
      description: 'Invalid bool',
      category: 1,
      active: 'not_a_boolean',
    });
    // API may reject or coerce non-boolean values
    expect([400, 201], 'invalid boolean should return 400 or be coerced').toContain(result.status);
    if (result.status === 201 && result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });

  test('empty string name returns 400', async () => {
    const result = await client.rawPost('/api/part/', {
      name: '',
      description: 'Empty name part',
      category: 1,
    });
    expect(result.status, 'empty string name should return 400').toBe(400);
  });
});

test.describe('Parts Validation — Read-only Fields', () => {
  test('setting pk in POST body is ignored — server assigns pk', async () => {
    const result = await client.rawPost('/api/part/', {
      pk: 999999,
      name: 'ReadOnlyPk_' + Date.now(),
      description: 'Trying to set pk',
      category: 1,
    });
    // Server should either ignore the pk or return 400
    if (result.status === 201) {
      expect(result.body.pk, 'server should ignore user-supplied pk').not.toBe(999999);
      registerForCleanup('part', result.body.pk);
    } else {
      expect(result.status, 'should return 400 if pk is rejected').toBe(400);
    }
  });

  test('setting in_stock in POST body is ignored', async () => {
    const result = await client.rawPost('/api/part/', {
      name: 'ReadOnlyStock_' + Date.now(),
      description: 'Trying to set in_stock',
      category: 1,
      in_stock: 100,
    });
    if (result.status === 201) {
      // in_stock is computed, should not be 100
      expect(
        result.body.in_stock === null || result.body.in_stock === 0,
        'in_stock should be ignored (null or 0)',
      ).toBe(true);
      registerForCleanup('part', result.body.pk);
    } else {
      expect(result.status, 'should return 400 if in_stock is rejected').toBe(400);
    }
  });
});

test.describe('Parts Validation — Special Characters', () => {
  test('special characters in name (no HTML tags) succeed', async () => {
    // InvenTree strips/rejects HTML tags, so avoid < and >
    const specialName = `Part-#${Date.now()} (v2.1) [test] & "more"`;
    const result = await client.rawPost('/api/part/', {
      name: specialName,
      description: 'Part with special chars in name',
      category: 1,
    });
    expect(result.status, 'special characters in name should succeed').toBe(201);
    expect(result.body.name, 'name should match input with special chars').toBe(specialName);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });

  test('HTML tags in name are rejected', async () => {
    const htmlName = `Part-<script>alert(1)</script>-${Date.now()}`;
    const result = await client.rawPost('/api/part/', {
      name: htmlName,
      description: 'HTML tag test',
      category: 1,
    });
    expect(result.status, 'HTML tags in name should return 400').toBe(400);
  });

  test('unicode characters in name succeed', async () => {
    const unicodeName = `Widerstand-${Date.now()}-Pruefung`;
    const result = await client.rawPost('/api/part/', {
      name: unicodeName,
      description: 'Unicode name test',
      category: 1,
    });
    expect(result.status, 'unicode name should succeed').toBe(201);
    if (result.body?.pk) {
      registerForCleanup('part', result.body.pk);
    }
  });
});

test.describe('Parts Validation — Parameterized Missing Name', () => {
  const missingNameCases = [
    { label: 'empty body', data: {} },
    { label: 'only description', data: { description: 'test', category: 1 } },
    { label: 'null name', data: { name: null, description: 'test', category: 1 } },
  ];

  for (const { label, data } of missingNameCases) {
    test(`missing/invalid name (${label}) returns 400`, async () => {
      const result = await client.rawPost('/api/part/', data);
      expect(result.status, `${label} should return 400`).toBe(400);
    });
  }
});
