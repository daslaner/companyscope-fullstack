import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { analytics } from '../product/analytics';
import { CompanyTable } from './CompanyTable';

describe('CompanyTable', () => {
  it('searches and exposes an accessible result count', () => {
    render(<MemoryRouter><CompanyTable /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('100 companies shown');
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'Northstar Berlin Security' } });
    expect(screen.getByRole('link', { name: 'Northstar Berlin Security' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 company shown');
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'does-not-exist' } });
    expect(screen.getByRole('status')).toHaveTextContent('0 companies shown');
  });


  it('emits privacy-minimal search and open events at meaningful interaction points', () => {
    vi.useFakeTimers();
    const track = vi.spyOn(analytics, 'track');
    render(<MemoryRouter><CompanyTable /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'Northstar Berlin Security' } });
    act(() => vi.advanceTimersByTime(300));
    expect(track).toHaveBeenCalledWith({
      name: 'company_searched',
      properties: { queryLength: 25, resultCount: 1 },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Northstar Berlin Security' }));
    expect(track).toHaveBeenCalledWith({
      name: 'company_opened',
      properties: { companyId: 'northstar-berlin-security', source: 'table' },
    });
    vi.useRealTimers();
  });

  it('filters by industry and verification status', () => {
    render(<MemoryRouter><CompanyTable /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Industry'), { target: { value: 'Cybersecurity' } });
    expect(screen.getByRole('status')).toHaveTextContent('20 companies shown');
    fireEvent.change(screen.getByLabelText('Industry'), { target: { value: 'all' } });
    fireEvent.click(screen.getByLabelText('Verified only'));
    expect(screen.getByRole('status')).toHaveTextContent('80 companies shown');
  });

  it.each(['risk', 'employees', 'growth', 'name'] as const)('supports %s sorting', (sort) => {
    render(<MemoryRouter><CompanyTable /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Sort'), { target: { value: sort } });
    expect(screen.getAllByRole('row')).toHaveLength(101);
  });
});
