import { z } from 'zod';
import { companies } from '../src/data/companies';
import type { Company, ExplainerFocus } from '../src/types/company';

export const maxBodyBytes = 4_096;

export const inputSchema = z
  .object({
    companyId: z.string().min(3).max(160).regex(/^[a-z0-9-]+$/),
    focus: z.enum(['executive', 'risk', 'growth', 'security']),
  })
  .strict();

export type ExplainerInput = z.infer<typeof inputSchema>;

export const focusInstructions: Record<ExplainerFocus, string> = {
  executive:
    'Summarize the company for an executive: profile, strengths, material risks, and three follow-up questions.',
  risk:
    'Prioritize business and operating risks. Separate observations from interpretation and identify missing evidence.',
  growth: 'Explain growth indicators, constraints, and what would change the assessment.',
  security:
    'Explain the security posture for a non-specialist executive and identify follow-up questions.',
};

export function responseHeaders(
  origin: string | undefined,
  allowedOrigin: string,
  production = false,
) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'cross-origin-resource-policy': 'same-site',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    ...(production ? { 'strict-transport-security': 'max-age=31536000; includeSubDomains' } : {}),
    ...(origin === allowedOrigin
      ? {
          'access-control-allow-origin': allowedOrigin,
          'access-control-allow-credentials': 'true',
          vary: 'Origin',
        }
      : {}),
  } as const;
}

export class FixedWindowRateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private operations = 0;

  constructor(
    private readonly limit = 12,
    private readonly windowMs = 60_000,
    private readonly maxKeys = 10_000,
  ) {}

  allow(key: string, now = Date.now()) {
    this.operations += 1;
    if (this.operations % 128 === 0 || this.hits.size >= this.maxKeys) this.sweep(now);

    const current = this.hits.get(key);

    if (!current || current.resetAt <= now) {
      if (this.hits.size >= this.maxKeys) return false;
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (current.count >= this.limit) return false;

    current.count += 1;
    return true;
  }

  sweep(now = Date.now()) {
    for (const [key, value] of this.hits) {
      if (value.resetAt <= now) this.hits.delete(key);
    }
  }

  size() {
    return this.hits.size;
  }
}

export function parseExplainerInput(raw: string):
  | { ok: true; value: ExplainerInput }
  | { ok: false; error: 'INVALID_JSON' | 'INVALID_INPUT' } {
  let json: unknown;

  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'INVALID_JSON' };
  }

  const parsed = inputSchema.safeParse(json);
  return parsed.success
    ? { ok: true, value: parsed.data }
    : { ok: false, error: 'INVALID_INPUT' };
}

export function buildTrustedSnapshot(company: Company) {
  return {
    name: company.name,
    industry: company.industry,
    location: `${company.city}, ${company.country}`,
    founded: company.founded,
    employees: company.employees,
    revenueBand: company.revenueBand,
    growthPct: company.growthPct,
    profitability: company.profitability,
    riskScore: company.riskScore,
    operations: company.operations,
    security: company.security,
    people: company.people,
    signals: company.signals,
  };
}

export function getTrustedSnapshot(companyId: string) {
  const company = companies.find((candidate) => candidate.id === companyId);
  return company ? buildTrustedSnapshot(company) : null;
}
