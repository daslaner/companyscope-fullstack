const key = 'companyscope.watchlist';
const changeEvent = 'companyscope:watchlist-changed';
const maxSavedCompanies = 50;

export const readWatchlist = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((item): item is string => typeof item === 'string' && item.length > 0))].slice(
          0,
          maxSavedCompanies,
        )
      : [];
  } catch {
    return [];
  }
};

function publish(next: string[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<string[]>(changeEvent, { detail: next }));
  }
}

export const toggleWatchlist = (companyId: string) => {
  const normalized = companyId.trim();
  if (!normalized) return readWatchlist();

  const current = new Set(readWatchlist());
  if (current.has(normalized)) current.delete(normalized);
  else if (current.size < maxSavedCompanies) current.add(normalized);

  const next = [...current];
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Keep the UI usable when storage is unavailable.
  }
  publish(next);
  return next;
};

export function subscribeWatchlist(listener: (companyIds: string[]) => void) {
  const onChange = (event: Event) => {
    const detail = event instanceof CustomEvent && Array.isArray(event.detail) ? event.detail : readWatchlist();
    listener(detail as string[]);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener(readWatchlist());
  };

  window.addEventListener(changeEvent, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
