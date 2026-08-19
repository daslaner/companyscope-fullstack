import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { CompanyMap } from '../components/CompanyMap';
import { CompanyTable } from '../components/CompanyTable';
import { MetricCard } from '../components/MetricCard';
import { OutcomePanel } from '../components/OutcomePanel';
import { PortfolioAnalytics } from '../components/PortfolioAnalytics';
import { PortfolioComparePanel } from '../components/PortfolioComparePanel';
import { SavedCompanies } from '../components/SavedCompanies';
import { Button } from '../components/ui/Button';
import { companies } from '../data/companies';
import { isEnabled } from '../product/flags';

export function DashboardPage() {
  const auth = useAuth();
  const metrics = useMemo(
    () => ({
      verified: Math.round((companies.filter((company) => company.verified).length / companies.length) * 100),
      avgRisk: Math.round(companies.reduce((sum, company) => sum + company.riskScore, 0) / companies.length),
      avgGrowth: Math.round(companies.reduce((sum, company) => sum + company.growthPct, 0) / companies.length),
    }),
    [],
  );

  if (auth.status === 'checking') {
    return (
      <main id="main" className="grid min-h-[calc(100vh-65px)] place-items-center text-sm text-slate-500" aria-live="polite">
        Checking workspace…
      </main>
    );
  }

  if (auth.status === 'error') {
    return (
      <main id="main" className="grid min-h-[calc(100vh-65px)] place-items-center px-5">
        <div className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <h1 className="text-xl font-bold">Workspace temporarily unavailable</h1>
          <p className="mt-2 text-sm leading-6">
            Authentication could not be verified. This is different from being signed out, so CompanyScope keeps
            the protected workspace closed until the session check succeeds.
          </p>
          <Button className="mt-4" onClick={() => void auth.retry()}>
            Retry session check
          </Button>
        </div>
      </main>
    );
  }

  if (auth.status === 'anonymous') return <Navigate to="/login" replace />;

  return (
    <main id="main" className="mx-auto max-w-7xl space-y-10 px-5 py-9 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
              Research workspace
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Company intelligence dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              Explore global coverage, classified business signals and security posture from a reproducible local
              dataset.
            </p>
          </div>
          <p className="text-right text-xs text-slate-500">Signed in as {auth.user?.email}</p>
        </div>


        <section aria-label="Portfolio metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Coverage" value="100 companies" note="20 markets" />
          <MetricCard label="Verified" value={`${metrics.verified}%`} note="Portfolio records" />
          <MetricCard label="Average risk" value={`${metrics.avgRisk}/100`} note="Composite demo score" />
          <MetricCard label="Average growth" value={`${metrics.avgGrowth}%`} note="Year-over-year proxy" />
        </section>

        <PortfolioAnalytics />
        {isEnabled('savedViews') && <SavedCompanies />}
        {isEnabled('portfolioCompare') && <PortfolioComparePanel />}
        <CompanyMap alternative="table" />
        <OutcomePanel />
        <CompanyTable />
    </main>
  );
}
