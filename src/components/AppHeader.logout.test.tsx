import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOptionalAuth } from '../auth/AuthProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AppHeader } from './AppHeader';

vi.mock('../auth/AuthProvider', () => ({
  useOptionalAuth: vi.fn(),
}));

const user = {
  id: 'user-1',
  name: 'E2E Engineer',
  email: 'workspace-e2e@example.com',
  company: 'CompanyScope QA',
};

beforeEach(() => {
  vi.mocked(useOptionalAuth).mockReset();
});

describe('AppHeader logout navigation', () => {
  it('leaves protected routes before session refresh can redirect to login', async () => {
    let resolveLogout!: () => void;
    const logout = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLogout = resolve;
        }),
    );

    vi.mocked(useOptionalAuth).mockReturnValue({
      status: 'authenticated',
      user,
      error: null,
      busy: false,
      login: vi.fn(),
      register: vi.fn(),
      logout,
      retry: vi.fn(),
    });

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppHeader />
          <Routes>
            <Route path="/dashboard" element={<p>Protected workspace</p>} />
            <Route path="/" element={<p>Public home</p>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Public home')).toBeInTheDocument();

    resolveLogout();
  });
});
