import { Link } from 'react-router-dom';
import { CompanyMap } from '../components/CompanyMap';
import { SecurityPanel } from '../components/SecurityPanel';
import { Card } from '../components/ui/Card';

export function HomePage() {
  return (
    <>
      <main id="main">
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,.12),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(6,182,212,.10),transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                Global company intelligence SaaS
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.045em] text-slate-950 sm:text-6xl dark:text-white">
                Understand companies through one secure, explainable workspace.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Explore 100 local company profiles across 20 markets, map risk signals, compare fundamentals
                and drill into classified insight tabs for financials, operations, security, people and events.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                  to="/register"
                >
                  Create workspace
                </Link>
                <Link
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  to="/dashboard"
                >
                  Explore product
                </Link>
              </div>
            </div>

            <Card className="relative overflow-hidden p-6">
              <div className="absolute right-0 top-0 size-28 translate-x-10 -translate-y-10 rounded-full bg-blue-500/10 blur-2xl" />
              <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">
                Portfolio snapshot
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500">Companies</dt>
                  <dd className="mt-1 text-3xl font-black dark:text-white">100</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Markets</dt>
                  <dd className="mt-1 text-3xl font-black dark:text-white">20</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Insight tabs</dt>
                  <dd className="mt-1 text-3xl font-black dark:text-white">7</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Security controls</dt>
                  <dd className="mt-1 text-3xl font-black dark:text-white">6+</dd>
                </div>
              </dl>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                Synthetic local data keeps the portfolio demo reproducible while the secure explainer route can
                connect to the OpenAI Responses API.
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-14 px-5 py-14 lg:px-8">
          <CompanyMap />
          <SecurityPanel />
        </section>
      </main>
      <footer className="border-t border-slate-200 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
        CompanyScope · Portfolio project by Deniz Aslaner
      </footer>
    </>
  );
}
