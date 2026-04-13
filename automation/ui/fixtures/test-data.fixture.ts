/**
 * Test data helpers for creating/cleaning up test data via API.
 * Uses the InvenTree REST API directly for speed and reliability.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'inventree123';

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const response = await fetch(`${BASE_URL}/api/user/token/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64'),
    },
  });

  const data = await response.json();
  cachedToken = data.token;
  return cachedToken!;
}

async function apiRequest(method: string, path: string, body?: unknown): Promise<any> {
  const token = await getToken();
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, options);
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

/** Create a test part via API and return its pk */
export async function createTestPartViaAPI(overrides?: Record<string, unknown>): Promise<{ pk: number; name: string }> {
  const name = `TestPart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const data = {
    name,
    description: `Auto-generated test part ${name}`,
    category: 1,
    ...overrides,
  };

  const result = await apiRequest('POST', '/api/part/', data);
  return { pk: result.pk, name: result.name };
}

/** Create a test category via API */
export async function createTestCategoryViaAPI(
  name?: string,
  parent?: number,
): Promise<{ pk: number; name: string }> {
  const catName = name || `TestCat-${Date.now()}`;
  const data: Record<string, unknown> = { name: catName, description: `Test category ${catName}` };
  if (parent) data.parent = parent;

  const result = await apiRequest('POST', '/api/part/category/', data);
  return { pk: result.pk, name: result.name };
}

/** Delete a test part via API (deactivate first, then delete) */
export async function deleteTestPartViaAPI(pk: number): Promise<void> {
  await apiRequest('PATCH', `/api/part/${pk}/`, { active: false });
  await apiRequest('DELETE', `/api/part/${pk}/`);
}

/** Delete a test category via API */
export async function deleteTestCategoryViaAPI(pk: number): Promise<void> {
  await apiRequest('DELETE', `/api/part/category/${pk}/`);
}

/**
 * Cleanup registry — tracks resources to clean up after tests.
 */
export class CleanupRegistry {
  private parts: number[] = [];
  private categories: number[] = [];

  registerPart(pk: number): void {
    this.parts.push(pk);
  }

  registerCategory(pk: number): void {
    this.categories.push(pk);
  }

  async cleanupAll(): Promise<void> {
    for (const pk of this.parts) {
      await deleteTestPartViaAPI(pk).catch(() => {});
    }
    for (const pk of this.categories.reverse()) {
      await deleteTestCategoryViaAPI(pk).catch(() => {});
    }
    this.parts = [];
    this.categories = [];
  }
}
