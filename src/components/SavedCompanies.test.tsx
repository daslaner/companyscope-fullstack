import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toggleWatchlist } from '../lib/watchlist';
import { analytics } from '../product/analytics';
import { SavedCompanies } from './SavedCompanies';

beforeEach(() => localStorage.clear());

describe('SavedCompanies', () => {
  it('shows an actionable empty state', () => {
    render(<MemoryRouter><SavedCompanies /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Saved companies' })).toBeInTheDocument();
    expect(screen.getByText(/No saved companies yet/i)).toBeInTheDocument();
  });

  it('renders saved research as navigable company cards', () => {
    toggleWatchlist('northstar-berlin-security');
    render(<MemoryRouter><SavedCompanies /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'Northstar Berlin Security' });
    expect(link).toHaveAttribute('href', '/companies/northstar-berlin-security/overview');
    expect(screen.getByText(/Berlin, DE/)).toBeInTheDocument();
    const track = vi.spyOn(analytics, 'track');
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith({
      name: 'company_opened',
      properties: { companyId: 'northstar-berlin-security', source: 'saved' },
    });
  });
});
