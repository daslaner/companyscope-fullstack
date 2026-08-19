import { describe, expect, it } from 'vitest';
import { emailSchema, loginSchema, passwordSchema, registrationSchema } from './validation';

describe('authentication validation', () => {
  it('normalizes valid registration input while allowing passphrases', () => {
    expect(
      registrationSchema.parse({
        name: '  Deniz Aslaner ',
        company: ' CompanyScope ',
        email: ' deniz@example.com ',
        password: 'a long memorable passphrase',
      }),
    ).toEqual({
      name: 'Deniz Aslaner',
      company: 'CompanyScope',
      email: 'deniz@example.com',
      password: 'a long memorable passphrase',
    });
  });

  it('does not impose uppercase, lowercase, number or symbol composition rules', () => {
    expect(passwordSchema.safeParse('all lowercase words are allowed').success).toBe(true);
    expect(passwordSchema.safeParse('UPPERCASE PASSPHRASE ONLY').success).toBe(true);
  });

  it.each([
    ['too short', 'short password'],
    ['known common password', 'passwordpassword'],
    ['context-specific password', 'CompanyScope2026!'],
    ['over maximum length', 'a'.repeat(129)],
  ])('rejects %s', (_label, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });

  it('normalizes Unicode to NFC before returning the password', () => {
    const decomposed = `Cafe\u0301 ${'secure passphrase'.repeat(2)}`;
    const parsed = passwordSchema.parse(decomposed);
    expect(parsed).toContain('Café');
    expect(parsed).not.toContain('e\u0301');
  });


  it('normalizes login email while accepting existing non-empty passwords up to the server limit', () => {
    expect(loginSchema.parse({ email: ' DENIZ@EXAMPLE.COM ', password: 'legacy-password' })).toEqual({
      email: 'deniz@example.com',
      password: 'legacy-password',
    });
    expect(loginSchema.safeParse({ email: 'deniz@example.com', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'deniz@example.com', password: 'x'.repeat(129) }).success).toBe(false);
  });

  it('enforces input bounds and email shape', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(emailSchema.safeParse(`${'a'.repeat(250)}@x.io`).success).toBe(false);
    expect(
      registrationSchema.safeParse({
        name: 'D',
        company: 'C',
        email: 'deniz@example.com',
        password: 'a sufficiently long passphrase',
      }).success,
    ).toBe(false);
  });
});
