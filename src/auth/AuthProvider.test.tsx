import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../lib/api';
import { AuthProvider, useAuth } from './AuthProvider';

vi.mock('../lib/api', () => ({
  authApi: {
    getSession: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const user = { id: 'u1', name: 'Deniz', email: 'deniz@example.com', company: 'CompanyScope' };

function consumeAction(action: Promise<unknown>) {
  void action.catch(() => undefined);
}

function Harness() {
  const auth = useAuth();
  return (
    <div>
      <span>{auth.status}</span>
      <span>{auth.user?.email ?? 'no-user'}</span>
      <span>{auth.error?.message ?? 'no-error'}</span>
      <button
        onClick={() => consumeAction(auth.login({ email: user.email, password: 'StrongPassword7' }))}
      >
        login
      </button>
      <button
        onClick={() =>
          consumeAction(
            auth.register({
              name: user.name,
              email: user.email,
              company: user.company,
              password: 'StrongPassword7',
            }),
          )
        }
      >
        register
      </button>
      <button onClick={() => consumeAction(auth.logout())}>logout</button>
      <button onClick={() => consumeAction(auth.retry())}>retry</button>
    </div>
  );
}

function renderProvider() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider><Harness /></AuthProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(authApi.getSession).mockReset();
  vi.mocked(authApi.login).mockReset();
  vi.mocked(authApi.register).mockReset();
  vi.mocked(authApi.logout).mockReset();
});

describe('AuthProvider', () => {
  it('hydrates the authenticated session and refreshes it after login/logout mutations', async () => {
    vi.mocked(authApi.getSession)
      .mockResolvedValueOnce({ status: 'anonymous' })
      .mockResolvedValueOnce({ status: 'authenticated', user })
      .mockResolvedValueOnce({ status: 'anonymous' });
    vi.mocked(authApi.login).mockResolvedValue(user);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    renderProvider();
    expect(await screen.findByText('anonymous')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(await screen.findByText(user.email)).toBeInTheDocument();
    expect(screen.getByText('authenticated')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
    expect(authApi.getSession).toHaveBeenCalledTimes(3);
  });

  it('supports registration and retrying a failed session check', async () => {
    vi.mocked(authApi.getSession)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ status: 'anonymous' })
      .mockResolvedValueOnce({ status: 'authenticated', user });
    vi.mocked(authApi.register).mockResolvedValue(user);

    renderProvider();
    expect(await screen.findByText('error')).toBeInTheDocument();
    expect(screen.getByText('offline')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(await screen.findByText('anonymous')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'register' }));
    expect(await screen.findByText(user.email)).toBeInTheDocument();
    expect(screen.getByText('authenticated')).toBeInTheDocument();
  });

  it('keeps the authenticated session and exposes an error when logout fails', async () => {
    vi.mocked(authApi.getSession).mockResolvedValue({ status: 'authenticated', user });
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network'));

    renderProvider();
    expect(await screen.findByText(user.email)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    expect(await screen.findByText('network')).toBeInTheDocument();
    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(authApi.getSession).toHaveBeenCalledTimes(1);
  });
});
