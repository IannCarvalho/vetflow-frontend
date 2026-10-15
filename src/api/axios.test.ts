import type { AxiosAdapter } from 'axios';

import { AxiosError, AxiosHeaders } from 'axios';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import api from './axios';

// Adapter that answers every request with HTTP 401, the way the backend does
// for wrong credentials, an invalid invite code or an expired session.
const unauthorized: AxiosAdapter = (config) =>
  Promise.reject(
    new AxiosError(
      'Request failed with status code 401',
      AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      {
        status: 401,
        statusText: 'Unauthorized',
        data: { error: 'invalid credentials' },
        headers: new AxiosHeaders(),
        config,
      }
    )
  );

describe('axios 401 interceptor', () => {
  let location: { href: string };

  beforeEach(() => {
    location = { href: 'http://localhost/sign-in' };
    vi.stubGlobal('location', location);
    localStorage.setItem('auth_token', 'stale-token');
    localStorage.setItem('auth_user', '{"id":"u1"}');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it.each(['/auth/login', '/auth/register'])(
    'leaves a 401 from %s to the screen (no redirect, so no page reload)',
    async (url) => {
      await expect(api.post(url, {}, { adapter: unauthorized })).rejects.toMatchObject({
        response: { status: 401 },
      });

      expect(location.href).toBe('http://localhost/sign-in');
      expect(localStorage.getItem('auth_token')).toBe('stale-token');
    }
  );

  it('still ends the session and redirects on a 401 from a protected endpoint', async () => {
    await expect(api.get('/pets', { adapter: unauthorized })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(location.href).toBe('/sign-in');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
