import { z } from 'zod';

const blockedPasswords = new Set([
  '123456789012345',
  'companyscope2026!',
  'letmeinletmeinlet',
  'passwordpassword',
  'qwertyuiopasdfgh',
]);

const codePointLength = (value: string) => Array.from(value).length;

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .transform((value) => value.normalize('NFC'))
  .superRefine((value, context) => {
    const length = codePointLength(value);

    if (length < 15) context.addIssue({ code: 'custom', message: 'Use at least 15 characters' });
    if (length > 128) context.addIssue({ code: 'custom', message: 'Password is too long' });
    if (blockedPasswords.has(value.toLowerCase())) {
      context.addIssue({ code: 'custom', message: 'Choose a less common password' });
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128).transform((value) => value.normalize('NFC')),
}).strict();

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  company: z.string().trim().min(2).max(120),
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  company: string;
};
