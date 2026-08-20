import { expect, test, type Page } from '@playwright/test';

const password = 'correct horse battery staple';

async function registerWorkspace(page: Page, email: string) {
  await page.goto('/register');
  await page.getByLabel('Full name').fill('E2E Engineer');
  await page.getByLabel('Company').fill('CompanyScope QA');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Company intelligence dashboard' })).toBeVisible();
}

test('production shell serves deep links and hardened responses', async ({ page }) => {
  const response = await page.goto('/companies/northstar-berlin-security/security');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Northstar Berlin Security' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Risk methodology' })).toBeVisible();

  const headers = response?.headers() ?? {};
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
});

test('critical workspace journey covers registration, session, save and logout', async ({ page }) => {
  await registerWorkspace(page, 'workspace-e2e@example.com');

  const sessionResponse = await page.request.get('/api/me');
  expect(sessionResponse.status()).toBe(200);
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === 'companyscope.sid');
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain('companyscope.sid');

  await page.getByRole('link', { name: 'Sample company' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Northstar Berlin Security' })).toBeVisible();
  await page.getByRole('button', { name: 'Save company' }).click();
  await expect(page.getByRole('button', { name: 'Saved locally' })).toBeVisible();

  await page.getByRole('link', { name: 'Workspace' }).click();
  const savedSection = page.getByRole('region', { name: 'Saved companies' });
  await expect(savedSection.getByRole('link', { name: 'Northstar Berlin Security' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
});

test('BFF rejects state-changing requests from an untrusted origin', async ({ request }) => {
  const response = await request.post('/api/auth/register', {
    headers: {
      origin: 'https://evil.example',
      'content-type': 'application/json',
    },
    data: {
      name: 'Untrusted Origin',
      company: 'Evil Corp',
      email: 'origin-e2e@example.com',
      password,
    },
  });

  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({ error: 'UNTRUSTED_ORIGIN' });
});
