import { useEffect, useState } from 'react';
import { readWatchlist, subscribeWatchlist, toggleWatchlist } from '../lib/watchlist';
import { analytics } from '../product/analytics';
import { Button } from './ui/Button';

export function WatchlistButton({ companyId }: { companyId: string }) {
  const [saved, setSaved] = useState(() => readWatchlist().includes(companyId));

  useEffect(
    () => subscribeWatchlist((companyIds) => setSaved(companyIds.includes(companyId))),
    [companyId],
  );

  const toggle = () => {
    const nextSaved = toggleWatchlist(companyId).includes(companyId);
    setSaved(nextSaved);
    analytics.track({ name: 'company_saved', properties: { companyId, saved: nextSaved } });
  };

  return (
    <Button variant="secondary" aria-pressed={saved} onClick={toggle}>
      <span aria-hidden="true">{saved ? '★' : '☆'}</span>
      {saved ? 'Saved locally' : 'Save company'}
    </Button>
  );
}
