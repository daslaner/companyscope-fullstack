import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { loadEnvFile } from 'node:process';
import OpenAI from 'openai';
import { loginSchema, registrationSchema, type AuthUser } from '../src/shared/auth';
import {
  clearSessionCookie,
  InMemorySessionStore,
  InMemoryUserRepository,
  hashPassword,
  parseCookies,
  serializeSessionCookie,
  verifyPassword,
} from './auth-core';
import {
  FixedWindowRateLimiter,
  focusInstructions,
  getTrustedSnapshot,
  maxBodyBytes,
  parseExplainerInput,
  responseHeaders,
} from './explainer-core';

try {
  loadEnvFile();
} catch {
  // .env is optional; shell environment works too.
}

const port = Number(process.env.API_PORT ?? 4100);
const allowedOrigin = process.env.APP_ORIGIN ?? 'http://localhost:5173';
const model = process.env.OPENAI_MODEL ?? 'gpt-5.6';
const isProduction = process.env.NODE_ENV === 'production';
const sessionTtlMs = Math.max(1, Number(process.env.SESSION_TTL_HOURS ?? 8)) * 60 * 60 * 1000;
const sessionCookieName = 'companyscope.sid';
const authBodyBytes = 16_384;

const users = new InMemoryUserRepository();
const sessions = new InMemorySessionStore(sessionTtlMs);
const authLimiter = new FixedWindowRateLimiter(10, 60_000, 5_000);
const explainerLimiter = new FixedWindowRateLimiter(12, 60_000, 5_000);
const dummyPasswordHash = hashPassword('companyscope invalid account timing equalizer');
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15_000, maxRetries: 1 })
  : null;

function headers(origin?: string, extra: Record<string, string> = {}) {
  return { ...responseHeaders(origin, allowedOrigin, isProduction), ...extra };
}

function send(
  res: ServerResponse,
  status: number,
  body: unknown,
  origin?: string,
  extraHeaders: Record<string, string> = {},
) {
  res.writeHead(status, headers(origin, extraHeaders));
  if (status === 204) return res.end();
  res.end(JSON.stringify(body));
}

function clientIp(req: IncomingMessage): string {
  return req.socket.remoteAddress ?? 'unknown';
}

function trustedOrigin(req: IncomingMessage): boolean {
  return req.headers.origin === allowedOrigin;
}

async function readBody(req: IncomingMessage, limit: number): Promise<{ ok: true; raw: string } | { ok: false }> {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw, 'utf8') > limit) return { ok: false };
  }
  return { ok: true, raw };
}

function parseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function sessionToken(req: IncomingMessage): string | undefined {
  return parseCookies(req.headers.cookie)[sessionCookieName];
}

function requireSession(req: IncomingMessage): { user: AuthUser; token: string; csrf: string } | null {
  const token = sessionToken(req);
  const session = sessions.get(token);
  if (!session || !token) return null;
  const user = users.findById(session.userId);
  if (!user) {
    sessions.destroy(token);
    return null;
  }
  return { user, token, csrf: session.csrf };
}

function csrfIsValid(req: IncomingMessage, token: string): boolean {
  const rawHeader = req.headers['x-csrf-token'];
  const csrf = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  return sessions.verifyCsrf(token, csrf);
}

function issueSession(res: ServerResponse, origin: string | undefined, user: AuthUser) {
  const session = sessions.create(user.id);
  return send(
    res,
    200,
    { user, csrf: session.csrf },
    origin,
    {
      'set-cookie': serializeSessionCookie(session.token, {
        secure: isProduction,
        maxAgeSeconds: Math.floor(sessionTtlMs / 1000),
      }),
    },
  );
}

function requireJson(req: IncomingMessage, res: ServerResponse, origin?: string): boolean {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    send(res, 415, { error: 'JSON_REQUIRED' }, origin);
    return false;
  }
  return true;
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = req.url ?? '/';

  if (req.method === 'OPTIONS') {
    if (!trustedOrigin(req)) return send(res, 403, { error: 'UNTRUSTED_ORIGIN' }, origin);
    res.writeHead(204, headers(origin, {
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, x-csrf-token',
      'access-control-max-age': '600',
    }));
    return res.end();
  }

  if (req.method === 'GET' && url === '/api/health') {
    return send(res, 200, { status: 'ok' }, origin);
  }

  if (req.method === 'GET' && url === '/api/me') {
    const current = requireSession(req);
    if (!current) return send(res, 401, { error: 'UNAUTHORIZED' }, origin);
    return send(res, 200, { user: current.user, csrf: current.csrf }, origin);
  }

  if (req.method === 'POST' && url === '/api/auth/register') {
    if (!trustedOrigin(req)) return send(res, 403, { error: 'UNTRUSTED_ORIGIN' }, origin);
    if (!requireJson(req, res, origin)) return;
    if (!authLimiter.allow(`register:${clientIp(req)}`)) return send(res, 429, { error: 'RATE_LIMITED' }, origin);

    const body = await readBody(req, authBodyBytes);
    if (!body.ok) return send(res, 413, { error: 'PAYLOAD_TOO_LARGE' }, origin);
    const parsedJson = parseJson(body.raw);
    if (parsedJson === null) return send(res, 400, { error: 'INVALID_JSON' }, origin);
    const parsed = registrationSchema.safeParse(parsedJson);
    if (!parsed.success) return send(res, 400, { error: 'INVALID_INPUT' }, origin);

    const user = await users.create(parsed.data);
    if (!user) return send(res, 409, { error: 'ACCOUNT_EXISTS' }, origin);
    return issueSession(res, origin, user);
  }

  if (req.method === 'POST' && url === '/api/auth/login') {
    if (!trustedOrigin(req)) return send(res, 403, { error: 'UNTRUSTED_ORIGIN' }, origin);
    if (!requireJson(req, res, origin)) return;
    if (!authLimiter.allow(`login:${clientIp(req)}`)) return send(res, 429, { error: 'RATE_LIMITED' }, origin);

    const body = await readBody(req, authBodyBytes);
    if (!body.ok) return send(res, 413, { error: 'PAYLOAD_TOO_LARGE' }, origin);
    const parsedJson = parseJson(body.raw);
    if (parsedJson === null) return send(res, 400, { error: 'INVALID_JSON' }, origin);
    const parsed = loginSchema.safeParse(parsedJson);
    if (!parsed.success) return send(res, 400, { error: 'INVALID_INPUT' }, origin);

    const stored = users.findByEmail(parsed.data.email);
    const candidateHash = stored?.passwordHash ?? (await dummyPasswordHash);
    const valid = await verifyPassword(parsed.data.password, candidateHash);
    if (!stored || !valid) return send(res, 401, { error: 'INVALID_CREDENTIALS' }, origin);

    const user = users.findById(stored.id);
    if (!user) return send(res, 401, { error: 'INVALID_CREDENTIALS' }, origin);
    return issueSession(res, origin, user);
  }

  if (req.method === 'POST' && url === '/api/auth/logout') {
    if (!trustedOrigin(req)) return send(res, 403, { error: 'UNTRUSTED_ORIGIN' }, origin);
    const current = requireSession(req);
    if (!current) {
      return send(res, 204, null, origin, { 'set-cookie': clearSessionCookie(isProduction) });
    }
    if (!csrfIsValid(req, current.token)) return send(res, 403, { error: 'CSRF_INVALID' }, origin);
    sessions.destroy(current.token);
    return send(res, 204, null, origin, { 'set-cookie': clearSessionCookie(isProduction) });
  }

  if (req.method === 'POST' && url === '/api/explain') {
    if (!trustedOrigin(req)) return send(res, 403, { error: 'UNTRUSTED_ORIGIN' }, origin);
    if (!requireJson(req, res, origin)) return;

    const current = requireSession(req);
    if (!current) return send(res, 401, { error: 'UNAUTHORIZED' }, origin);
    if (!csrfIsValid(req, current.token)) return send(res, 403, { error: 'CSRF_INVALID' }, origin);
    if (!explainerLimiter.allow(`explainer:${current.user.id}`)) {
      return send(res, 429, { error: 'RATE_LIMITED' }, origin);
    }
    if (!client) return send(res, 503, { error: 'OPENAI_API_KEY_NOT_CONFIGURED' }, origin);

    const body = await readBody(req, maxBodyBytes);
    if (!body.ok) return send(res, 413, { error: 'PAYLOAD_TOO_LARGE' }, origin);
    const parsed = parseExplainerInput(body.raw);
    if (!parsed.ok) return send(res, 400, { error: parsed.error }, origin);

    const snapshot = getTrustedSnapshot(parsed.value.companyId);
    if (!snapshot) return send(res, 404, { error: 'COMPANY_NOT_FOUND' }, origin);

    try {
      const response = await client.responses.create({
        model,
        store: false,
        max_output_tokens: 650,
        instructions: `Use only the trusted CompanyScope snapshot. Never invent external facts, people, news, customers, vulnerabilities, or financial data. Label uncertainty. ${focusInstructions[parsed.value.focus]}`,
        input: JSON.stringify(snapshot),
      });
      const explanation = response.output_text.trim();
      if (!explanation) throw new Error('EMPTY_RESPONSE');
      return send(
        res,
        200,
        { explanation, model, generatedAt: new Date().toISOString() },
        origin,
      );
    } catch {
      return send(res, 503, { error: 'EXPLAINER_UNAVAILABLE' }, origin);
    }
  }

  return send(res, 404, { error: 'NOT_FOUND' }, origin);
});

const sweepTimer = setInterval(() => sessions.sweep(), 15 * 60 * 1000);
sweepTimer.unref();

server.listen(port, '127.0.0.1', () => {
  console.log(`CompanyScope BFF listening on http://127.0.0.1:${port}`);
});
