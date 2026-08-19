import { useEffect, useMemo, useState } from 'react';
import { companies } from '../data/companies';
import { readWatchlist, subscribeWatchlist } from '../lib/watchlist';
import type { Company } from '../types/company';
import { Card } from './ui/Card';

const comparisonRows: ReadonlyArray<[string, (company: Company) => string]> = [
  ['Employees', (company) => company.employees.toLocaleString()],
  ['Growth', (company) => `${company.growthPct > 0 ? '+' : ''}${company.growthPct}%`],
  ['Risk score', (company) => `${company.riskScore}/100`],
  ['Security rating', (company) => `${company.security.rating}/100`],
  ['Open roles', (company) => String(company.people.openRoles)],
];

export function PortfolioComparePanel() {
  const [savedIds, setSavedIds] = useState(readWatchlist);
  useEffect(() => subscribeWatchlist(setSavedIds), []);

  const selected = useMemo(
    () =>
      savedIds
        .map((id) => companies.find((company) => company.id === id))
        .filter((company): company is Company => company !== undefined)
        .slice(0, 3),
    [savedIds],
  );

  return (
    <section aria-labelledby="compare-title" className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-fuchsia-600 dark:text-fuchsia-400">
          Controlled rollout
        </p>
        <h2 id="compare-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
          Portfolio compare
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Compare up to three saved companies across a compact decision set.
        </p>
      </div>

      {selected.length < 2 ? (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Save at least two companies to activate the comparison view.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Comparison of saved companies</caption>
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th scope="col" className="px-4 py-3">Metric</th>
                {selected.map((company) => (
                  <th key={company.id} scope="col" className="px-4 py-3">{company.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([label, format]) => (
                <tr key={label} className="border-t border-slate-100 dark:border-slate-800">
                  <th scope="row" className="px-4 py-3 font-semibold">{label}</th>
                  {selected.map((company) => (
                    <td key={company.id} className="px-4 py-3 tabular-nums">{format(company)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
