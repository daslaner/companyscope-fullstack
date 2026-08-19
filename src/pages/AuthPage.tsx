import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/ui/Button';
import { isRemoteAuthEnabled } from '../lib/api';
import { registrationSchema } from '../lib/validation';
import { analytics } from '../product/analytics';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState('');

  if (auth.status === 'authenticated') return <Navigate to="/dashboard" replace />;
  if (auth.status === 'checking') {
    return (
      <main id="main" className="grid min-h-[calc(100vh-65px)] place-items-center text-sm text-slate-500" aria-live="polite">
        Checking existing session…
      </main>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      if (mode === 'register') {
        const result = registrationSchema.safeParse(data);
        if (!result.success) throw new Error(result.error.issues[0]?.message ?? 'Check your details');
        await auth.register(result.data);
        analytics.track({ name: 'workspace_created', properties: { source: 'registration' } });
      } else {
        const email = String(data.email ?? '').trim().toLowerCase();
        const password = String(data.password ?? '');
        if (!email || !password) throw new Error('Email and password are required.');
        await auth.login({ email, password });
      }

      navigate('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed.');
    }
  };

  return (
    <main
        id="main"
        className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:px-8"
      >
        <section>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            Secure workspace
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            {mode === 'login' ? 'Welcome back.' : 'Create your research workspace.'}
          </h1>
          <p className="mt-4 max-w-lg leading-7 text-slate-600 dark:text-slate-300">
            {isRemoteAuthEnabled
              ? 'This repo’s local BFF uses an opaque HttpOnly session cookie plus a session-bound CSRF token. Passwords are hashed server-side with scrypt.'
              : 'Demo auth is enabled for a zero-backend portfolio preview. Set VITE_REMOTE_AUTH=true to use the secure local BFF included in this repository.'}
          </p>
        </section>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <>
                <label className="field-label">
                  Full name
                  <input name="name" autoComplete="name" required className="field mt-1" />
                </label>
                <label className="field-label">
                  Company
                  <input name="company" autoComplete="organization" required className="field mt-1" />
                </label>
              </>
            )}

            <label className="field-label">
              Email
              <input name="email" type="email" autoComplete="email" required className="field mt-1" />
            </label>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                aria-describedby={mode === 'register' ? 'password-requirements' : undefined}
                {...(mode === 'register' ? { minLength: 15, maxLength: 128 } : { maxLength: 128 })}
                className="field mt-1"
              />
              {mode === 'register' && (
                <p id="password-requirements" className="mt-1 text-xs text-slate-500">
                  15–128 characters. Passphrases and spaces are welcome; common passwords are blocked.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={auth.busy}>
              {auth.busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <Link className="font-semibold text-blue-700 underline dark:text-blue-400" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <>
                Already registered?{' '}
                <Link className="font-semibold text-blue-700 underline dark:text-blue-400" to="/login">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
    </main>
  );
}
