import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../components/AppHeader';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AuthPage } from './AuthPage';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  retry: vi.fn(),
}));
const authState = vi.hoisted(() => ({
  status: 'anonymous' as 'checking' | 'authenticated' | 'anonymous' | 'error',
  user: null as null | { id: string; name: string; email: string; company: string },
  error: null as Error | null,
  busy: false,
}));
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ ...authState, ...authMocks }),
  useOptionalAuth: () => ({ ...authState, ...authMocks }),
}));

function renderAuth(mode: 'login' | 'register') {
  const path = mode === 'login' ? '/login' : '/register';
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppHeader />
        <Routes>
          <Route path={path} element={<AuthPage mode={mode} />} />
          <Route path="/dashboard" element={<div>dashboard destination</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  Object.values(authMocks).forEach((mock) => mock.mockReset());
  Object.assign(authState, { status: 'anonymous', user: null, error: null, busy: false });
});

describe('AuthPage', () => {
  it('registers validated input and navigates to the workspace', async () => {
    authMocks.register.mockResolvedValue({ id: 'u1' });
    renderAuth('register');
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Deniz Aslaner' } });
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'CompanyScope' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'deniz@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPassword7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() =>
      expect(authMocks.register).toHaveBeenCalledWith({
        name: 'Deniz Aslaner',
        company: 'CompanyScope',
        email: 'deniz@example.com',
        password: 'StrongPassword7',
      }),
    );
    expect(await screen.findByText('dashboard destination')).toBeInTheDocument();
  });

  it('shows registration validation failures without calling the API', async () => {
    renderAuth('register');
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Deniz Aslaner' } });
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'CompanyScope' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'deniz@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weak' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }).closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent(/15 characters/i);
    expect(authMocks.register).not.toHaveBeenCalled();
  });

  it('logs in and reports API errors', async () => {
    authMocks.login.mockRejectedValueOnce(new Error('INVALID_CREDENTIALS')).mockResolvedValueOnce({ id: 'u1' });
    renderAuth('login');
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'deniz@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'WrongPassword7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('INVALID_CREDENTIALS');
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPassword7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('dashboard destination')).toBeInTheDocument();
  });

  it('normalizes non-Error authentication failures', async () => {
    authMocks.login.mockRejectedValueOnce('offline');
    renderAuth('login');
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'deniz@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPassword7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Authentication failed.');
  });

  it('guards empty login input even for programmatic submissions', async () => {
    renderAuth('login');
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
  });


  it('waits for the initial session check and exposes infrastructure state without pretending it is anonymous', () => {
    Object.assign(authState, { status: 'checking', user: null, error: null });
    const first = renderAuth('login');
    expect(screen.getByText('Checking existing session…')).toBeInTheDocument();
    expect(screen.getByText('Checking…')).toBeInTheDocument();
    first.unmount();

    Object.assign(authState, { status: 'error', user: null, error: new Error('offline') });
    renderAuth('login');
    expect(screen.getByText('Session unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('redirects an already authenticated user away from auth screens', async () => {
    Object.assign(authState, {
      status: 'authenticated',
      user: { id: 'u1', name: 'Deniz', email: 'deniz@example.com', company: 'CompanyScope' },
    });
    renderAuth('login');
    expect(await screen.findByText('dashboard destination')).toBeInTheDocument();
  });
});
