import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { toggleWatchlist } from '../lib/watchlist';
import { PortfolioComparePanel } from './PortfolioComparePanel';

beforeEach(() => {
  localStorage.clear();
});

describe('PortfolioComparePanel', () => {
  it('requires two saved companies before comparison', () => {
    render(<PortfolioComparePanel />);
    expect(screen.getByRole('heading', { name: 'Portfolio compare' })).toBeInTheDocument();
    expect(screen.getByText(/Save at least two companies/i)).toBeInTheDocument();
  });

  it('compares a bounded set of saved companies', () => {
    toggleWatchlist('northstar-berlin-security');
    toggleWatchlist('aurora-berlin-payments');
    render(<PortfolioComparePanel />);
    expect(screen.getByRole('table', { name: 'Comparison of saved companies' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Northstar Berlin Security' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Security rating' })).toBeInTheDocument();
  });
});
