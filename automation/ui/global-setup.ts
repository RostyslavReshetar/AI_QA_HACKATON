import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import http from 'http';

const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'storage-state.json');

/**
 * Get session cookie by calling Django login endpoint directly via HTTP.
 * This bypasses the React frontend entirely — works in any CI.
 */
async function getSessionCookie(baseURL: string): Promise<{ csrftoken: string; sessionid: string }> {
  // Step 1: GET /accounts/login/ to get csrftoken cookie
  const loginPageRes = await fetch(`${baseURL}/accounts/login/`, {
    redirect: 'manual',
    headers: { 'Accept': 'text/html' },
  });
  const setCookies = loginPageRes.headers.getSetCookie?.() || [];
  let csrftoken = '';
  for (const c of setCookies) {
    const match = c.match(/csrftoken=([^;]+)/);
    if (match) csrftoken = match[1];
  }
  if (!csrftoken) {
    // Try alternate header format
    const raw = loginPageRes.headers.get('set-cookie') || '';
    const match = raw.match(/csrftoken=([^;]+)/);
    if (match) csrftoken = match[1];
  }
  console.log(`Global setup: got csrftoken=${csrftoken ? 'yes' : 'NO'}`);

  // Step 2: POST /accounts/login/ with form data
  const formBody = new URLSearchParams({
    login: 'admin',
    password: 'inventree123',
    csrfmiddlewaretoken: csrftoken,
  });

  const loginRes = await fetch(`${baseURL}/accounts/login/`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': `csrftoken=${csrftoken}`,
      'Referer': `${baseURL}/accounts/login/`,
    },
    body: formBody.toString(),
  });

  console.log(`Global setup: login POST status=${loginRes.status}`);
  const loginSetCookies = loginRes.headers.getSetCookie?.() || [];
  let sessionid = '';
  let newCsrf = csrftoken;
  for (const c of loginSetCookies) {
    const sMatch = c.match(/sessionid=([^;]+)/);
    if (sMatch) sessionid = sMatch[1];
    const cMatch = c.match(/csrftoken=([^;]+)/);
    if (cMatch) newCsrf = cMatch[1];
  }
  if (!sessionid) {
    const raw = loginRes.headers.get('set-cookie') || '';
    const sMatch = raw.match(/sessionid=([^;]+)/);
    if (sMatch) sessionid = sMatch[1];
  }

  console.log(`Global setup: sessionid=${sessionid ? 'yes' : 'NO'}, csrftoken=${newCsrf ? 'yes' : 'NO'}`);
  return { csrftoken: newCsrf, sessionid };
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';

  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  try {
    // Get session cookies via direct HTTP (no browser needed)
    const { csrftoken, sessionid } = await getSessionCookie(baseURL);

    if (!sessionid) {
      console.error('Global setup: FAILED to get session cookie. UI tests will fail.');
      // Write empty state so tests can at least start
      fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }));
      return;
    }

    // Build storage state with cookies
    const url = new URL(baseURL);
    const storageState = {
      cookies: [
        {
          name: 'csrftoken',
          value: csrftoken,
          domain: url.hostname,
          path: '/',
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        },
        {
          name: 'sessionid',
          value: sessionid,
          domain: url.hostname,
          path: '/',
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax' as const,
        },
      ],
      origins: [],
    };

    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));
    console.log(`Global setup: auth state saved with 2 cookies to ${STORAGE_STATE_PATH}`);
  } catch (error) {
    console.error('Global setup failed:', error);
    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }));
    throw error;
  }
}

export default globalSetup;
export { STORAGE_STATE_PATH };
