import { useEffect } from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { CompanyDetailAnalytics } from '../components/CompanyDetailAnalytics';
import { ExplainerPanel } from '../components/ExplainerPanel';
import { MetricCard } from '../components/MetricCard';
import { WatchlistButton } from '../components/WatchlistButton';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { companyTabs, formatCurrency, formatPercent, getCompany, isCompanyTab } from '../lib/company';
import { riskBand, riskTone } from '../lib/risk';
import { analytics } from '../product/analytics';
import { isEnabled } from '../product/flags';
import type { Company, CompanyTab } from '../types/company';

function DefinitionGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <Card key={label} className="p-4">
          <dt className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{label}</dt>
          <dd className="mt-2 text-xl font-black text-slate-950 dark:text-white">{value}</dd>
        </Card>
      ))}
    </dl>
  );
}

function TabContent({ company, tab }: { company: Company; tab: CompanyTab }) {
  switch (tab) {
    case 'overview':
      return (
        <div className="space-y-5">
          <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {company.description}
          </p>
          <DefinitionGrid
            items={[
              ['Founded', String(company.founded)],
              ['Employees', company.employees.toLocaleString()],
              ['Revenue band', company.revenueBand],
              ['Funding', company.fundingStage],
              ['Risk', `${riskBand(company.riskScore)} · ${company.riskScore}/100`],
              ['Verification', company.verified ? 'Verified' : 'Review required'],
            ]}
          />
        </div>
      );
    case 'financials':
      return (
        <DefinitionGrid
          items={[
            ['Estimated revenue', formatCurrency(company.revenueM)],
            ['Revenue band', company.revenueBand],
            ['Growth', formatPercent(company.growthPct)],
            ['Profitability', company.profitability],
            ['Funding stage', company.fundingStage],
            ['Data quality', company.verified ? 'Verified' : 'Review required'],
          ]}
        />
      );
    case 'operations':
      return (
        <DefinitionGrid
          items={[
            ['Offices', String(company.operations.offices)],
            ['Countries', String(company.operations.countries)],
            ['Cloud regions', String(company.operations.cloudRegions)],
            ['Uptime', `${company.operations.uptimePct}%`],
            ['Vendor concentration', `${company.operations.vendorConcentrationPct}%`],
            ['Headquarters', `${company.city}, ${company.country}`],
          ]}
        />
      );
    case 'security':
      return (
        <div className="space-y-5">
          <DefinitionGrid
            items={[
              ['Security rating', `${company.security.rating}/100`],
              ['MFA coverage', `${company.security.mfaCoveragePct}%`],
              ['Open findings', String(company.security.openFindings)],
              ['Critical findings', String(company.security.criticalFindings)],
              ['Incidents / 90d', String(company.security.incidents90d)],
              ['Last assessment', company.security.lastAssessment],
            ]}
          />
          <Card>
            <h2 className="font-bold text-slate-950 dark:text-white">Certifications</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {company.security.certifications.map((certification) => (
                <Badge key={certification} tone="accent">
                  {certification}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      );
    case 'people':
      return (
        <DefinitionGrid
          items={[
            ['Headcount growth', formatPercent(company.people.headcountGrowthPct)],
            ['Engineering share', `${company.people.engineeringSharePct}%`],
            ['Open roles', String(company.people.openRoles)],
            ['Remote policy', company.people.remotePolicy],
            ['Leadership', company.people.leadershipStability],
            ['Employees', company.employees.toLocaleString()],
          ]}
        />
      );
    case 'signals':
      return (
        <div className="grid gap-3">
          {company.signals.map((signal) => (
            <Card key={signal.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-slate-950 dark:text-white">{signal.label}</h2>
                <Badge
                  tone={
                    signal.severity === 'critical'
                      ? 'danger'
                      : signal.severity === 'watch'
                        ? 'warning'
                        : 'accent'
                  }
                >
                  {signal.severity}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{signal.detail}</p>
              <p className="mt-3 text-xs text-slate-500">Observed {signal.observedAt}</p>
            </Card>
          ))}
        </div>
      );
    case 'explainer':
      return <ExplainerPanel company={company} />;
  }
}

export function CompanyDetailPage() {
  const { companyId, tab } = useParams();
  const company = getCompany(companyId);
  const explainerEnabled = isEnabled('explainer');
  const savedViewsEnabled = isEnabled('savedViews');
  const riskExplainabilityEnabled = isEnabled('riskExplainability');
  const availableTabs = companyTabs.filter((item) => item.id !== 'explainer' || explainerEnabled);

  useEffect(() => {
    if (company && tab && isCompanyTab(tab) && (tab !== 'explainer' || explainerEnabled)) {
      analytics.track({
        name: 'company_tab_opened',
        properties: { companyId: company.id, tab },
      });
    }
  }, [company, explainerEnabled, tab]);

  if (!company) return <Navigate to="/dashboard" replace />;
  if (!tab || !isCompanyTab(tab) || (tab === 'explainer' && !explainerEnabled)) {
    return <Navigate to={`/companies/${company.id}/overview`} replace />;
  }

  return (
    <main id="main" className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{company.industry}</Badge>
              <Badge tone={riskTone(company.riskScore)}>{riskBand(company.riskScore)} risk</Badge>
              {company.verified && <Badge tone="positive">Verified</Badge>}
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              {company.name}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {company.city}, {company.country} · {company.domain}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-end">
              {savedViewsEnabled && <WatchlistButton companyId={company.id} />}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <MetricCard label="Employees" value={company.employees.toLocaleString()} />
              <MetricCard label="Growth" value={formatPercent(company.growthPct)} />
              <MetricCard label="Security" value={`${company.security.rating}/100`} />
            </div>
          </div>
        </div>

        <nav
          aria-label="Company detail sections"
          className="mt-8 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
        >
          <div className="flex min-w-max gap-1">
            {availableTabs.map((item) => (
              <NavLink
                key={item.id}
                to={`/companies/${company.id}/${item.id}`}
                className={({ isActive }) =>
                  `border-b-2 px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <section className="py-7">
          {riskExplainabilityEnabled && (tab === 'overview' || tab === 'security') && (
            <Card className="mb-5 border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30">
              <h2 className="font-bold text-slate-950 dark:text-white">Risk methodology</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This synthetic portfolio score is a comparative demo signal, not an external credit or security rating.
                Low = 0–29, Moderate = 30–54 and Elevated = 55–100; structured evidence remains the source of truth.
              </p>
            </Card>
          )}
          <TabContent company={company} tab={tab} />
          <CompanyDetailAnalytics company={company} tab={tab} />
        </section>
    </main>
  );
}
