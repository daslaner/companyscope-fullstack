import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useOptionalAuth } from '../auth/AuthProvider';
import { replaceDocument } from '../lib/browserNavigation';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
      : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
  }`;

export function AppHeader() {
  const auth = useOptionalAuth();
  const [logoutError, setLogoutError] = useState('');

  const signOut = async () => {
    if (!auth || auth.status !== 'authenticated') return;

    setLogoutError('');
    try {
      await auth.logout();
      replaceDocument('/');
    } catch (cause) {
      setLogoutError(
        cause instanceof Error
          ? `Sign out could not be confirmed: ${cause.message}`
          : 'Sign out could not be confirmed. Please retry.',
      );
    }
  };

  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 lg:px-8">
        <Link
          to="/"
          className="mr-auto flex items-center gap-2 font-black tracking-tight text-slate-950 dark:text-white"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-sm text-white shadow-sm"
          >
            CS
          </span>
          CompanyScope
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/dashboard" className={navClass}>
            Explorer
          </NavLink>
          <NavLink to="/companies/northstar-berlin-security/overview" className={navClass}>
            Sample company
          </NavLink>
        </div>

        <ThemeToggle />

        <div className="flex min-w-fit items-center gap-2">
          {auth?.status === 'authenticated' ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:inline-flex dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Workspace
              </Link>
              <Button
                variant="secondary"
                className="min-w-[6.75rem]"
                onClick={() => void signOut()}
                disabled={auth.busy}
              >
                {auth.busy ? 'Signing out…' : 'Sign out'}
              </Button>
            </>
          ) : auth?.status === 'checking' ? (
            <span className="min-w-[6.75rem] px-3 py-2 text-center text-sm text-slate-500" aria-live="polite">
              Checking…
            </span>
          ) : auth?.status === 'error' ? (
            <span
              className="min-w-[6.75rem] px-3 py-2 text-center text-sm font-semibold text-amber-700 dark:text-amber-300"
              title="Session status could not be verified"
            >
              Session unavailable
            </span>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-11 min-w-[6.75rem] items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {logoutError && (
        <div
          role="alert"
          className="mx-auto max-w-7xl px-5 pb-3 text-right text-xs font-medium text-amber-700 lg:px-8 dark:text-amber-300"
        >
          {logoutError}
        </div>
      )}
    </header>
  );
}
