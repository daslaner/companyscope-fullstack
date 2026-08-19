import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';
import type { AuthUser } from '../src/shared/auth';

const passwordKeyLength = 64;
const passwordSaltBytes = 16;
const sessionTokenBytes = 32;
const csrfTokenBytes = 24;
const scryptCost = 16_384;
const scryptBlockSize = 8;
const scryptParallelization = 1;
const scryptMaxMemory = 64 * 1024 * 1024;

export type StoredUser = AuthUser & { passwordHash: string };

export type SessionRecord = {
  userId: string;
  csrf: string;
  expiresAt: number;
};

const sha256 = (value: string) => createHash('sha256').update(value).digest('base64url');

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      passwordKeyLength,
      {
        N: scryptCost,
        r: scryptBlockSize,
        p: scryptParallelization,
        maxmem: scryptMaxMemory,
      },
      (error, derivedKey) => (error ? reject(error) : resolve(derivedKey as Buffer)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(passwordSaltBytes);
  const derived = await derivePassword(password, salt);
  return `scrypt$${scryptCost}$${scryptBlockSize}$${scryptParallelization}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, rawCost, rawBlockSize, rawParallelization, saltValue, hashValue] = stored.split('$');
  if (
    algorithm !== 'scrypt' ||
    !rawCost ||
    !rawBlockSize ||
    !rawParallelization ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  const cost = Number(rawCost);
  const blockSize = Number(rawBlockSize);
  const parallelization = Number(rawParallelization);
  if (
    cost !== scryptCost ||
    blockSize !== scryptBlockSize ||
    parallelization !== scryptParallelization
  ) {
    return false;
  }

  const salt = Buffer.from(saltValue, 'base64url');
  const expected = Buffer.from(hashValue, 'base64url');
  const actual = await derivePassword(password, salt);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export class InMemoryUserRepository {
  private readonly usersById = new Map<string, StoredUser>();
  private readonly userIdByEmail = new Map<string, string>();
  private readonly pendingEmails = new Set<string>();

  async create(input: Omit<AuthUser, 'id'> & { password: string }): Promise<AuthUser | null> {
    const email = input.email.toLowerCase();
    if (this.userIdByEmail.has(email) || this.pendingEmails.has(email)) return null;

    this.pendingEmails.add(email);
    try {
      const user: StoredUser = {
        id: randomUUID(),
        name: input.name,
        email,
        company: input.company,
        passwordHash: await hashPassword(input.password),
      };

      this.usersById.set(user.id, user);
      this.userIdByEmail.set(email, user.id);
      return this.toPublicUser(user);
    } finally {
      this.pendingEmails.delete(email);
    }
  }

  findByEmail(email: string): StoredUser | null {
    const id = this.userIdByEmail.get(email.toLowerCase());
    return id ? (this.usersById.get(id) ?? null) : null;
  }

  findById(id: string): AuthUser | null {
    const user = this.usersById.get(id);
    return user ? this.toPublicUser(user) : null;
  }

  private toPublicUser(user: StoredUser): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
    };
  }
}

export class InMemorySessionStore {
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(private readonly ttlMs = 8 * 60 * 60 * 1000) {}

  create(userId: string, now = Date.now()) {
    const token = randomBytes(sessionTokenBytes).toString('base64url');
    const csrf = randomBytes(csrfTokenBytes).toString('base64url');
    this.sessions.set(sha256(token), {
      userId,
      csrf,
      expiresAt: now + this.ttlMs,
    });
    return { token, csrf, expiresAt: now + this.ttlMs };
  }

  get(token: string | undefined, now = Date.now()): SessionRecord | null {
    if (!token) return null;
    const key = sha256(token);
    const session = this.sessions.get(key);
    if (!session) return null;
    if (session.expiresAt <= now) {
      this.sessions.delete(key);
      return null;
    }
    return session;
  }

  verifyCsrf(token: string | undefined, csrf: string | undefined, now = Date.now()): boolean {
    const session = this.get(token, now);
    return Boolean(session && csrf && timingSafeEqualText(session.csrf, csrf));
  }

  destroy(token: string | undefined): void {
    if (token) this.sessions.delete(sha256(token));
  }

  sweep(now = Date.now()): void {
    for (const [key, session] of this.sessions) {
      if (session.expiresAt <= now) this.sessions.delete(key);
    }
  }

  size(): number {
    return this.sessions.size;
  }
}

export function timingSafeEqualText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf('=');
        if (separator < 0) return [part, ''];
        return [part.slice(0, separator), decodeCookieValue(part.slice(separator + 1))];
      }),
  );
}

export function serializeSessionCookie(
  token: string,
  options: { secure: boolean; maxAgeSeconds: number },
): string {
  const parts = [
    `companyscope.sid=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
  ];
  if (options.secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(secure: boolean): string {
  return serializeSessionCookie('', { secure, maxAgeSeconds: 0 });
}
