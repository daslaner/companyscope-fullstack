import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOptionalAuth } from '../auth/AuthProvider';
import { replaceDocument } from '../lib/browserNavigation';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AppHeader } from './AppHeader';

vi.mock('../auth/AuthProvider', () => ({
  useOptionalAuth: vi.fn(),
}));

vi.mock('../lib/browserNavigation', () => ({
  replaceDocument: vi.fn(),
}));

const user = {
  id: 'user-1',
  name: 'E2E Engineer',
  email: 'workspace-e2e@example.com',
  company: 'CompanyScope QA',
};

beforeEach(() => {
  vi.mocked(useOptionalAuth).mockReset();
  vi.mocked(replaceDocument).mockReset();
});

describe('AppHeader logout navigation', () => {
  it('replaces the document only after the server confirms logout', async () => {
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
        </MemoryRouter>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(replaceDocument).not.toHaveBeenCalled();

    resolveLogout();

    await waitFor(() => expect(replaceDocument).toHaveBeenCalledWith('/'));
  });

  it('does not navigate when logout cannot be confirmed', async () => {
    const logout = vi.fn().mockRejectedValue(new Error('network'));

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
        </MemoryRouter>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sign out could not be confirmed: network');
    expect(replaceDocument).not.toHaveBeenCalled();
  });
});
