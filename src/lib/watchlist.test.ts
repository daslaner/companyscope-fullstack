import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readWatchlist, subscribeWatchlist, toggleWatchlist } from './watchlist';

beforeEach(() => {
  localStorage.clear();
});

describe('watchlist persistence', () => {
  it('adds, removes, trims and ignores empty identifiers', () => {
    expect(toggleWatchlist(' northstar-berlin-security ')).toEqual(['northstar-berlin-security']);
    expect(toggleWatchlist('northstar-berlin-security')).toEqual([]);
    expect(toggleWatchlist('   ')).toEqual([]);
  });

  it('defensively parses, deduplicates and caps persisted data', () => {
    localStorage.setItem('companyscope.watchlist', '{bad-json');
    expect(readWatchlist()).toEqual([]);
    localStorage.setItem('companyscope.watchlist', JSON.stringify({ nope: true }));
    expect(readWatchlist()).toEqual([]);
    localStorage.setItem('companyscope.watchlist', JSON.stringify(['a', 'a', 7, '', ...Array.from({ length: 60 }, (_, index) => `c-${index}`)]));
    const values = readWatchlist();
    expect(values).toHaveLength(50);
    expect(values[0]).toBe('a');
    expect(values.filter((value) => value === 'a')).toHaveLength(1);
    expect(toggleWatchlist('new-over-cap')).not.toContain('new-over-cap');
  });


  it('notifies same-tab and storage listeners so saved research stays synchronized', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeWatchlist(listener);
    toggleWatchlist('company-a');
    expect(listener).toHaveBeenLastCalledWith(['company-a']);
    window.dispatchEvent(new StorageEvent('storage', { key: 'companyscope.watchlist' }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    toggleWatchlist('company-b');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('fails safely when browser storage reads are blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readWatchlist()).toEqual([]);
  });

  it('keeps working when browser storage writes are blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(toggleWatchlist('company-a')).toEqual(['company-a']);
  });
});
