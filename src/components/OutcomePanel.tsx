import { isEnabled } from '../product/flags';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

const metrics = [
  ['Activation', '68%', 'Workspace created + first company explored'],
  ['Time to insight', '2m 14s', 'Median search-to-useful-detail time'],
  ['Saved company reuse', '41%', 'Weekly users returning to saved research'],
  ['Trust signal use', '57%', 'Sessions opening verification or risk context'],
] as const;

const releases = [
  ['Saved companies', 'savedViews' as const, 'Shipped'],
  ['Risk explainability', 'riskExplainability' as const, 'Shipped'],
  ['Portfolio compare', 'portfolioCompare' as const, 'Controlled rollout'],
  ['AI explainer', 'explainer' as const, 'Shipped'],
] as const;

export function OutcomePanel() {
  return (
    <section aria-labelledby="outcomes-title" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-600 dark:text-violet-400">
            Product operating system
          </p>
          <h2 id="outcomes-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            Outcomes, flags and rollout
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Instrumented product events are implemented; the KPI values shown below are intentionally illustrative portfolio data.
          </p>
        </div>
        <Badge tone="warning">Demo metrics</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([name, value, detail]) => (
          <Card key={name}>
            <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{name}</p>
            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{detail}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-bold text-slate-950 dark:text-white">Feature delivery state</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {releases.map(([label, flag, state]) => {
            const enabled = isEnabled(flag);
            return (
              <div key={flag} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{label}</span>
                  <Badge tone={enabled ? 'positive' : 'warning'}>{state}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">Effective flag: {String(enabled)}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
