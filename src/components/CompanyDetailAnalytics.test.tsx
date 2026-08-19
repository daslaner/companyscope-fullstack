import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { companies } from '../data/companies';
import type { CompanyTab } from '../types/company';
import { CompanyDetailAnalytics } from './CompanyDetailAnalytics';

const company = companies[0];
const tabs: CompanyTab[] = ['overview', 'financials', 'operations', 'security', 'people', 'signals', 'explainer'];

if (!company) {
  throw new Error('Expected the local company dataset to contain at least one company.');
}

describe('CompanyDetailAnalytics', () => {
  it.each(tabs)('renders exactly three accessible chart cards for %s', (tab) => {
    const { unmount } = render(<CompanyDetailAnalytics company={company} tab={tab} />);

    expect(screen.getByRole('heading', { name: new RegExp(`${company.name} · ${tab} signals`, 'i') })).toBeInTheDocument();
    expect(screen.getAllByTestId(/^detail-chart-/)).toHaveLength(3);
    expect(screen.getByText('Bar chart')).toBeInTheDocument();
    expect(screen.getByText('Line chart')).toBeInTheDocument();
    expect(screen.getByText('Donut chart')).toBeInTheDocument();
    expect(document.querySelector('[data-recharts="Sector"]')).toBeInTheDocument();
    expect(screen.getAllByText(/proxy|snapshot|evidence|current|structured/i).length).toBeGreaterThan(0);

    unmount();
  });
});
