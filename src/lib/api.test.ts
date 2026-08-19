import { beforeEach, describe, expect, it, vi } from 'vitest';

const user = { id: 'user-1', email: 'deniz@example.com', name: 'Deniz Aslaner', company: 'CompanyScope' };
const registration = { email: user.email, password: 'StrongPassword7', name: user.name, company: user.company };
const login = { email: user.email, password: registration.password };
const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  sessionStorage.clear();
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe('frontend API boundary', () => {
  it('supports token-free local demo authentication with an explicit session model', async () => {
    const { authApi } = await import('./api');
    expect(await authApi.getSession()).toEqual({ status: 'anonymous' });

    const registeredUser = await authApi.register(registration);
    expect(registeredUser).toEqual({ ...user, id: 'demo-user' });
    expect(await authApi.getSession()).toEqual({ status: 'authenticated', user: registeredUser });

    await authApi.logout();
    expect(await authApi.getSession()).toEqual({ status: 'anonymous' });

    const loggedInUser = await authApi.login(login);
    expect(await authApi.getSession()).toEqual({ status: 'authenticated', user: loggedInUser });
  });

  it('uses credentialed remote auth with a session-bound CSRF token', async () => {
    vi.stubEnv('VITE_REMOTE_AUTH', 'true');
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example/');
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ user, csrf: 'csrf-login' }))
      .mockResolvedValueOnce(jsonResponse({ user, csrf: 'csrf-register' }))
      .mockResolvedValueOnce(jsonResponse({ user, csrf: 'csrf-session' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const { authApi } = await import('./api');

    await authApi.login(login);
    expect(sessionStorage.getItem('companyscope.csrf')).toBe('csrf-login');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example/api/auth/login');
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('x-csrf-token')).toBeNull();

    await authApi.register(registration);
    expect(sessionStorage.getItem('companyscope.csrf')).toBe('csrf-register');

    // Simulate a new tab: the HttpOnly cookie survives, tab-scoped CSRF state does not.
    sessionStorage.clear();
    expect(sessionStorage.getItem('companyscope.csrf')).toBeNull();
    expect(await authApi.getSession()).toEqual({ status: 'authenticated', user });
    expect(sessionStorage.getItem('companyscope.csrf')).toBe('csrf-session');
    await authApi.logout();
    expect(sessionStorage.getItem('companyscope.csrf')).toBeNull();
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('x-csrf-token')).toBe('csrf-session');
  });

  it('maps only a 401 session check to anonymous and preserves infrastructure failures', async () => {
    vi.stubEnv('VITE_REMOTE_AUTH', 'true');
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ error: 'UNAUTHORIZED' }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: 'UPSTREAM_UNAVAILABLE' }, 503));
    vi.stubGlobal('fetch', fetchMock);
    const { authApi } = await import('./api');

    sessionStorage.setItem('companyscope.csrf', 'stale-csrf');
    expect(await authApi.getSession()).toEqual({ status: 'anonymous' });
    expect(sessionStorage.getItem('companyscope.csrf')).toBeNull();
    await expect(authApi.getSession()).rejects.toMatchObject({ status: 503, message: 'UPSTREAM_UNAVAILABLE' });
  });

  it('uses typed API errors and safe fallback messages for explainer failures', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('upstream failed', { status: 503, headers: { 'content-type': 'text/plain' } }))
      .mockResolvedValueOnce(new Response('{broken', { status: 502, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const { ApiError, requestCompanyExplainer } = await import('./api');

    await expect(requestCompanyExplainer('northstar-berlin-security', 'risk')).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      message: 'Request failed (503)',
    });
    await expect(requestCompanyExplainer('northstar-berlin-security', 'executive')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed (502)',
    });
    expect(ApiError.prototype).toBeInstanceOf(Error);
    expect(fetchMock.mock.calls[1]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('keeps CSRF state when logout cannot be confirmed, but clears it when the server reports no session', async () => {
    vi.stubEnv('VITE_REMOTE_AUTH', 'true');
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ user, csrf: 'csrf-value' }))
      .mockResolvedValueOnce(jsonResponse({ error: 'UPSTREAM_UNAVAILABLE' }, 503))
      .mockResolvedValueOnce(jsonResponse({ error: 'UNAUTHORIZED' }, 401));
    vi.stubGlobal('fetch', fetchMock);
    const { authApi } = await import('./api');

    await authApi.login(login);
    await expect(authApi.logout()).rejects.toThrow('UPSTREAM_UNAVAILABLE');
    expect(sessionStorage.getItem('companyscope.csrf')).toBe('csrf-value');
    await expect(authApi.logout()).resolves.toBeUndefined();
    expect(sessionStorage.getItem('companyscope.csrf')).toBeNull();
  });
});
