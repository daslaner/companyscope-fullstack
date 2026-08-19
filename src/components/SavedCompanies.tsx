import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companies } from '../data/companies';
import { readWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { analytics } from '../product/analytics';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export function SavedCompanies() {
  const [savedIds, setSavedIds] = useState(readWatchlist);
  useEffect(() => subscribeWatchlist(setSavedIds), []);

  const saved = useMemo(
    () => savedIds.map((id) => companies.find((company) => company.id === id)).filter(Boolean),
    [savedIds],
  );

  return (
    <section aria-labelledby="saved-companies-title" className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600 dark:text-emerald-400">
          Research shortlist
        </p>
        <h2 id="saved-companies-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
          Saved companies
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Anonymous saves are local to this browser in the portfolio demo; a production account would persist and
          sync them server-side.
        </p>
      </div>

      {saved.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No saved companies yet. Open a company and use “Save company” to build a shortlist.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((company) => {
            if (!company) return null;
            return (
              <Card key={company.id} className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    className="font-bold text-slate-950 hover:text-blue-700 dark:text-white dark:hover:text-blue-400"
                    to={`/companies/${company.id}/overview`}
                    onClick={() =>
                      analytics.track({
                        name: 'company_opened',
                        properties: { companyId: company.id, source: 'saved' },
                      })
                    }
                  >
                    {company.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {company.city}, {company.countryCode}
                  </p>
                </div>
                <Badge tone={company.verified ? 'positive' : 'warning'}>
                  {company.verified ? 'Verified' : 'Review'}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
