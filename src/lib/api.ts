import type { AuthUser, LoginInput, RegistrationInput } from '../shared/auth';
import type { ExplainerFocus } from '../types/company';

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const remoteAuth = import.meta.env.VITE_REMOTE_AUTH === 'true';
const explainerBase = (import.meta.env.VITE_EXPLAINER_API_URL ?? apiBase).replace(/\/$/, '');
const demoSessionKey = 'companyscope.demo.authenticated';
const demoUserKey = 'companyscope.demo.user';
const csrfKey = 'companyscope.csrf';
const requestTimeoutMs = 12_000;

type ExplainerResponse = { explanation: string; model: string; generatedAt: string };
type ErrorPayload = { error?: unknown };
type SessionPayload = { user: AuthUser; csrf: string };
type AuthMutationPayload = SessionPayload;

export type AuthSession =
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'anonymous' };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;
  return response.json().catch(() => null);
}

async function jsonRequest<T>(
  base: string,
  path: string,
  init: RequestInit,
  options: { csrf?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set('content-type', 'application/json');
  if (options.csrf !== false) {
    const csrf = sessionStorage.getItem(csrfKey);
    if (csrf) headers.set('x-csrf-token', csrf);
  }

  const response = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...init,
    headers,
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const body = await parseJson(response);
  if (!response.ok) {
    const candidate = body as ErrorPayload | null;
    const message =
      typeof candidate?.error === 'string'
        ? candidate.error
        : `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return body as T;
}

function demoUser(email: string, name = 'Demo User', company = 'CompanyScope Demo'): AuthUser {
  return { id: 'demo-user', email: email.toLowerCase(), name, company };
}

function setDemoSession(user: AuthUser) {
  sessionStorage.setItem(demoSessionKey, 'true');
  sessionStorage.setItem(demoUserKey, JSON.stringify(user));
}

function clearClientSession() {
  sessionStorage.removeItem(demoSessionKey);
  sessionStorage.removeItem(demoUserKey);
  sessionStorage.removeItem(csrfKey);
}

function readDemoUser(): AuthUser {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(demoUserKey) ?? 'null') as Partial<AuthUser> | null;
    if (
      parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.company === 'string'
    ) {
      return parsed as AuthUser;
    }
  } catch {
    // Fall back to a deterministic demo identity.
  }
  return demoUser('demo@companyscope.dev');
}

export const authApi = {
  async login(payload: LoginInput): Promise<AuthUser> {
    if (!remoteAuth) {
      const user = demoUser(payload.email);
      setDemoSession(user);
      return user;
    }
    const result = await jsonRequest<AuthMutationPayload>(
      apiBase,
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(payload) },
      { csrf: false },
    );
    sessionStorage.setItem(csrfKey, result.csrf);
    return result.user;
  },

  async register(payload: RegistrationInput): Promise<AuthUser> {
    if (!remoteAuth) {
      const user = demoUser(payload.email, payload.name, payload.company);
      setDemoSession(user);
      return user;
    }
    const result = await jsonRequest<AuthMutationPayload>(
      apiBase,
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
      { csrf: false },
    );
    sessionStorage.setItem(csrfKey, result.csrf);
    return result.user;
  },

  async logout(): Promise<void> {
    if (!remoteAuth) {
      clearClientSession();
      return;
    }

    try {
      await jsonRequest(apiBase, '/api/auth/logout', { method: 'POST' });
      clearClientSession();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        clearClientSession();
        return;
      }
      throw cause;
    }
  },

  async getSession(): Promise<AuthSession> {
    if (!remoteAuth) {
      return sessionStorage.getItem(demoSessionKey) === 'true'
        ? { status: 'authenticated', user: readDemoUser() }
        : { status: 'anonymous' };
    }

    try {
      const result = await jsonRequest<SessionPayload>(apiBase, '/api/me', { method: 'GET' });
      sessionStorage.setItem(csrfKey, result.csrf);
      return { status: 'authenticated', user: result.user };
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        sessionStorage.removeItem(csrfKey);
        return { status: 'anonymous' };
      }
      throw cause;
    }
  },
};

export const isRemoteAuthEnabled = remoteAuth;

export async function requestCompanyExplainer(
  companyId: string,
  focus: ExplainerFocus,
): Promise<ExplainerResponse> {
  return jsonRequest<ExplainerResponse>(explainerBase, '/api/explain', {
    method: 'POST',
    body: JSON.stringify({ companyId, focus }),
  });
}
