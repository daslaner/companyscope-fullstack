import { describe, expect, it } from 'vitest';
import {
  clearSessionCookie,
  hashPassword,
  InMemorySessionStore,
  InMemoryUserRepository,
  parseCookies,
  serializeSessionCookie,
  verifyPassword,
} from './auth-core';

describe('auth security core', () => {
  it('hashes passwords with salted scrypt and verifies without storing plaintext', async () => {
    const hashA = await hashPassword('a long secure passphrase');
    const hashB = await hashPassword('a long secure passphrase');
    expect(hashA).toMatch(/^scrypt\$/);
    expect(hashA).not.toBe(hashB);
    expect(hashA).not.toContain('a long secure passphrase');
    await expect(verifyPassword('a long secure passphrase', hashA)).resolves.toBe(true);
    await expect(verifyPassword('wrong secure passphrase', hashA)).resolves.toBe(false);
    await expect(verifyPassword('anything', 'invalid-format')).resolves.toBe(false);
  });

  it('creates unique users, normalizes email lookup and never exposes password hashes', async () => {
    const users = new InMemoryUserRepository();
    const created = await users.create({
      name: 'Deniz Aslaner',
      email: 'DENIZ@example.com',
      company: 'CompanyScope',
      password: 'a long secure passphrase',
    });
    expect(created).toMatchObject({ email: 'deniz@example.com', name: 'Deniz Aslaner' });
    expect(created).not.toHaveProperty('passwordHash');
    expect(users.findByEmail('deniz@example.com')).toHaveProperty('passwordHash');
    expect(users.findById(created!.id)).toEqual(created);
    await expect(users.create({
      name: 'Duplicate',
      email: 'deniz@example.com',
      company: 'Other',
      password: 'another secure passphrase',
    })).resolves.toBeNull();
  });

  it('rejects concurrent registration attempts for the same normalized email', async () => {
    const users = new InMemoryUserRepository();
    const input = {
      name: 'Deniz Aslaner',
      email: 'race@example.com',
      company: 'CompanyScope',
      password: 'a long secure passphrase',
    };
    const [first, second] = await Promise.all([users.create(input), users.create(input)]);
    expect([first, second].filter(Boolean)).toHaveLength(1);
  });

  it('stores opaque session state, verifies CSRF tokens, expires and destroys sessions', () => {
    const sessions = new InMemorySessionStore(1_000);
    const created = sessions.create('user-1', 10_000);
    expect(created.token).not.toBe(created.csrf);
    expect(sessions.get(created.token, 10_500)).toMatchObject({ userId: 'user-1' });
    expect(sessions.verifyCsrf(created.token, created.csrf, 10_500)).toBe(true);
    expect(sessions.verifyCsrf(created.token, 'wrong', 10_500)).toBe(false);
    expect(sessions.get(created.token, 11_000)).toBeNull();

    const second = sessions.create('user-2', 20_000);
    expect(sessions.size()).toBe(1);
    sessions.destroy(second.token);
    expect(sessions.size()).toBe(0);
  });

  it('sweeps expired sessions and parses/serializes hardened cookies', () => {
    const sessions = new InMemorySessionStore(1_000);
    sessions.create('u1', 1_000);
    sessions.create('u2', 1_500);
    sessions.sweep(2_100);
    expect(sessions.size()).toBe(1);

    expect(parseCookies('theme=dark; companyscope.sid=abc%20123')).toEqual({
      theme: 'dark',
      'companyscope.sid': 'abc 123',
    });
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies('companyscope.sid=bad%encoding')).toEqual({
      'companyscope.sid': 'bad%encoding',
    });
    expect(serializeSessionCookie('token', { secure: true, maxAgeSeconds: 120 })).toContain('HttpOnly');
    expect(serializeSessionCookie('token', { secure: true, maxAgeSeconds: 120 })).toContain('Secure');
    expect(clearSessionCookie(false)).toContain('Max-Age=0');
  });
});
