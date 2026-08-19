import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companies, industries } from '../data/companies';
import { riskBand, riskTone } from '../lib/risk';
import { analytics } from '../product/analytics';
import { Badge } from './ui/Badge';

type SortKey = 'name' | 'risk' | 'employees' | 'growth';

export function CompanyTable() {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('name');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return companies
      .filter(
        (company) =>
          !normalized ||
          `${company.name} ${company.industry} ${company.country} ${company.city} ${company.tags.join(' ')}`
            .toLowerCase()
            .includes(normalized),
      )
      .filter((company) => industry === 'all' || company.industry === industry)
      .filter((company) => !verifiedOnly || company.verified)
      .toSorted((a, b) =>
        sort === 'risk'
          ? b.riskScore - a.riskScore
          : sort === 'employees'
            ? b.employees - a.employees
            : sort === 'growth'
              ? b.growthPct - a.growthPct
              : a.name.localeCompare(b.name),
      );
  }, [industry, query, sort, verifiedOnly]);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;
    const timer = window.setTimeout(() => {
      analytics.track({
        name: 'company_searched',
        properties: { queryLength: normalized.length, resultCount: filtered.length },
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filtered.length, query]);

  return (
    <section aria-labelledby="companies-title" className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            Company intelligence
          </p>
          <h2
            id="companies-title"
            className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white"
          >
            Company explorer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Search, classify and compare local portfolio data.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Search
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="field mt-1"
              placeholder="Name, market or tag"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Industry
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="field mt-1"
            >
              <option value="all">All industries</option>
              {industries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="field mt-1"
            >
              <option value="name">Name</option>
              <option value="risk">Highest risk</option>
              <option value="employees">Employees</option>
              <option value="growth">Growth</option>
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 self-end rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="size-4 accent-blue-600"
            />
            Verified only
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <caption className="sr-only">Company insight results</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              {['Company', 'Industry', 'Location', 'Employees', 'Growth', 'Risk', 'Status'].map(
                (heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr
                key={company.id}
                className="border-t border-slate-100 transition hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <th scope="row" className="px-4 py-4">
                  <Link
                    className="font-bold text-slate-950 hover:text-blue-700 dark:text-white dark:hover:text-blue-400"
                    to={`/companies/${company.id}/overview`}
                    onClick={() =>
                      analytics.track({
                        name: 'company_opened',
                        properties: { companyId: company.id, source: 'table' },
                      })
                    }
                  >
                    {company.name}
                  </Link>
                  <div className="text-xs font-normal text-slate-500">{company.domain}</div>
                </th>
                <td className="px-4 py-4">{company.industry}</td>
                <td className="px-4 py-4">
                  {company.city}, {company.countryCode}
                </td>
                <td className="px-4 py-4 tabular-nums">{company.employees.toLocaleString()}</td>
                <td className="px-4 py-4 tabular-nums">
                  {company.growthPct > 0 ? '+' : ''}
                  {company.growthPct}%
                </td>
                <td className="px-4 py-4">
                  <Badge tone={riskTone(company.riskScore)}>
                    {riskBand(company.riskScore)} · {company.riskScore}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge tone={company.verified ? 'positive' : 'warning'}>
                    {company.verified ? 'Verified' : 'Review'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-slate-500 dark:text-slate-400">
        {filtered.length} {filtered.length === 1 ? 'company' : 'companies'} shown
      </p>
    </section>
  );
}
