import { APIRequestContext, request as pwRequest } from '@playwright/test';

let cachedToken: string | null = null;

/**
 * Fetches an auth token via Basic Auth from InvenTree.
 */
export async function getAuthToken(
  request: APIRequestContext,
  baseURL: string,
  user: string = 'admin',
  pass: string = 'inventree123',
): Promise<string> {
  if (cachedToken) return cachedToken;

  const credentials = Buffer.from(`${user}:${pass}`).toString('base64');
  const response = await request.get(`${baseURL}/api/user/token/`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to get auth token: ${response.status()} ${response.statusText()}`);
  }

  const body = await response.json();
  cachedToken = body.token;
  return cachedToken!;
}

/**
 * Creates an APIRequestContext pre-configured with the InvenTree auth token.
 */
export async function createAuthContext(
  baseURL: string,
  user: string = 'admin',
  pass: string = 'inventree123',
): Promise<APIRequestContext> {
  // First get the token using a temporary context
  const tempContext = await pwRequest.newContext({ baseURL });
  const token = await getAuthToken(tempContext, baseURL, user, pass);
  await tempContext.dispose();

  // Create a new context with the auth header
  const authContext = await pwRequest.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return authContext;
}

/**
 * Resets the cached token (useful for testing auth failures).
 */
export function resetTokenCache(): void {
  cachedToken = null;
}
