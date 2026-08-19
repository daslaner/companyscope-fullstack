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

describe('CompanyDetailAnalytics accessibility contract', () => {
  it.each(tabs)('provides text alternatives for all three %s visualizations', (tab) => {
    const { unmount } = render(<CompanyDetailAnalytics company={company} tab={tab} />);

    const section = screen.getByRole('region', { name: new RegExp(`${tab} signals`, 'i') });
    const figures = section.querySelectorAll('figure');

    expect(figures).toHaveLength(3);

    for (const figure of figures) {
      const titleId = figure.getAttribute('aria-labelledby');
      const describedBy = figure.getAttribute('aria-describedby');
      const summaryId = describedBy?.split(' ').at(-1);

      expect(titleId).toBeTruthy();
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(titleId ?? '')).toHaveTextContent(/.+/);
      expect(document.getElementById(summaryId ?? '')).toHaveClass('sr-only');
      expect(document.getElementById(summaryId ?? '')).toHaveTextContent(/.+/);
    }

    unmount();
  });
});
