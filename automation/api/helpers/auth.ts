import { APIRequestContext, request } from '@playwright/test';

const BASE_URL = process.env.INVENTREE_URL ?? 'http://localhost:8080';
const USERNAME = process.env.INVENTREE_USER ?? 'admin';
const PASSWORD = process.env.INVENTREE_PASS ?? 'inventree123';

let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const ctx = await request.newContext({ baseURL: BASE_URL });
  const res = await ctx.get('/api/user/token/', {
    headers: {
      Authorization: `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`,
    },
  });

  if (!res.ok()) {
    throw new Error(`Auth failed: ${res.status()} ${await res.text()}`);
  }

  const body = await res.json();
  cachedToken = body.token as string;
  await ctx.dispose();
  return cachedToken;
}

export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };
}

export function invalidAuthHeaders(): Record<string, string> {
  return {
    Authorization: 'Token invalidtoken000000000000000000000000',
    'Content-Type': 'application/json',
  };
}

export function basicAuthHeaders(): Record<string, string> {
  return {
    Authorization: `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };
}

export { BASE_URL };