import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../theme/ThemeProvider';
import { DashboardPage } from './DashboardPage';

const authMocks = vi.hoisted(() => ({ logout: vi.fn(), retry: vi.fn(), login: vi.fn(), register: vi.fn() }));
const authState = vi.hoisted(() => ({
  status: 'authenticated' as 'checking' | 'authenticated' | 'anonymous' | 'error',
  user: { id: 'u1', name: 'Deniz', email: 'deniz@example.com', company: 'CompanyScope' } as null | {
    id: string; name: string; email: string; company: string;
  },
  error: null as Error | null,
  busy: false,
}));
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ ...authState, ...authMocks }),
  useOptionalAuth: () => ({ ...authState, ...authMocks }),
}));

function renderDashboard() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<div>login destination</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  Object.values(authMocks).forEach((mock) => mock.mockReset());
  Object.assign(authState, {
    status: 'authenticated',
    user: { id: 'u1', name: 'Deniz', email: 'deniz@example.com', company: 'CompanyScope' },
    error: null,
    busy: false,
  });
  localStorage.clear();
});

describe('DashboardPage', () => {
  it('renders the authenticated dashboard', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Company intelligence dashboard' })).toBeInTheDocument();
    expect(screen.getByText('100 companies')).toBeInTheDocument();
    expect(screen.getByText(/Signed in as deniz@example.com/)).toBeInTheDocument();
  });

  it('shows a retryable infrastructure state instead of pretending the user is logged out', () => {
    Object.assign(authState, { status: 'error', user: null, error: new Error('offline') });
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Workspace temporarily unavailable' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry session check' }));
    expect(authMocks.retry).toHaveBeenCalledTimes(1);
  });

  it('renders the portfolio comparison only when its rollout flag is enabled', () => {
    vi.stubEnv('VITE_FLAG_PORTFOLIO_COMPARE', 'true');
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Portfolio compare' })).toBeInTheDocument();
  });

  it('shows the checking state and redirects only a confirmed anonymous visitor', async () => {
    Object.assign(authState, { status: 'checking', user: null });
    const view = renderDashboard();
    expect(screen.getByText('Checking workspace…')).toBeInTheDocument();
    view.unmount();

    Object.assign(authState, { status: 'anonymous', user: null });
    renderDashboard();
    expect(await screen.findByText('login destination')).toBeInTheDocument();
  });
});
