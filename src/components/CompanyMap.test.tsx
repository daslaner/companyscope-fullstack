import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { analytics } from '../product/analytics';
import { CompanyMap } from './CompanyMap';

describe('CompanyMap', () => {
  it('renders all local companies as a visual map plus a keyboard-accessible list alternative', () => {
    render(<MemoryRouter><CompanyMap /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Global company footprint' })).toBeInTheDocument();
    expect(screen.getAllByTestId('leaflet-marker')).toHaveLength(100);
    expect(screen.getByText(/company list below provides the keyboard-accessible equivalent/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse the map as an accessible company list/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(100);
    const track = vi.spyOn(analytics, 'track');
    fireEvent.click(screen.getByRole('link', { name: /Northstar Berlin Security/i }));
    expect(track).toHaveBeenCalledWith({
      name: 'company_opened',
      properties: { companyId: 'northstar-berlin-security', source: 'map' },
    });
  });

  it('can defer its accessible equivalent to the dashboard table', () => {
    render(<MemoryRouter><CompanyMap alternative="table" /></MemoryRouter>);
    expect(screen.getByText(/company table below provides the keyboard-accessible equivalent/i)).toBeInTheDocument();
    expect(screen.queryByText(/Browse the map as an accessible company list/i)).not.toBeInTheDocument();
  });
});
