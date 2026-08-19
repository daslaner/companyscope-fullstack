import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../theme/ThemeProvider';
import { CompanyDetailPage } from './CompanyDetailPage';

function renderRoute(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/companies/:companyId/:tab?" element={<CompanyDetailPage />} />
            <Route path="/dashboard" element={<div>dashboard redirect</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('CompanyDetailPage', () => {
  it.each([
    ['overview', 'Founded', 'definition'],
    ['financials', 'Estimated revenue', 'definition'],
    ['operations', 'Cloud regions', 'definition'],
    ['security', 'MFA coverage', 'definition'],
    ['people', 'Headcount growth', 'definition'],
    ['signals', 'Hiring activity', 'heading'],
    ['explainer', 'Explainer focus', 'heading'],
  ] as const)('routes directly to the %s classification', (tab, expected, markerKind) => {
    renderRoute(`/companies/northstar-berlin-security/${tab}`);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Northstar Berlin Security' }),
    ).toBeInTheDocument();

    if (markerKind === 'definition') {
      expect(screen.getByText(expected, { selector: 'dt' })).toBeInTheDocument();
    } else {
      expect(screen.getByRole('heading', { name: expected })).toBeInTheDocument();
    }

    expect(screen.getByRole('link', { name: new RegExp(tab, 'i') })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByTestId(/^detail-chart-/)).toHaveLength(3);
  });

  it('shows verification state for a verified company', () => {
    renderRoute('/companies/aurora-berlin-payments/overview');
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
  });

  it('normalizes a missing/invalid tab and redirects missing companies', () => {
    const first = renderRoute('/companies/northstar-berlin-security');
    expect(screen.getByText('Founded', { selector: 'dt' })).toBeInTheDocument();
    first.unmount();
    const second = renderRoute('/companies/northstar-berlin-security/not-a-tab');
    expect(screen.getByText('Founded', { selector: 'dt' })).toBeInTheDocument();
    second.unmount();
    renderRoute('/companies/does-not-exist/overview');
    expect(screen.getByText('dashboard redirect')).toBeInTheDocument();
  });


  it('keeps risk semantics visible while feature-flagging the deeper methodology panel', () => {
    const first = renderRoute('/companies/northstar-berlin-security/overview');
    expect(screen.getByRole('heading', { name: 'Risk methodology' })).toBeInTheDocument();
    expect(screen.getByText(/Low risk/i)).toBeInTheDocument();
    first.unmount();
    vi.stubEnv('VITE_FLAG_RISK_EXPLAINABILITY', 'false');
    renderRoute('/companies/northstar-berlin-security/overview');
    expect(screen.queryByRole('heading', { name: 'Risk methodology' })).not.toBeInTheDocument();
    expect(screen.getByText(/Low risk/i)).toBeInTheDocument();
  });

  it('removes and redirects the explainer route when its runtime flag is disabled', () => {
    vi.stubEnv('VITE_FLAG_EXPLAINER', 'false');
    renderRoute('/companies/northstar-berlin-security/explainer');
    expect(screen.getByText('Founded', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /explainer/i })).not.toBeInTheDocument();
  });
});
