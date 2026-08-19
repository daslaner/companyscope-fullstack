import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { requestCompanyExplainer } from '../lib/api';
import { analytics } from '../product/analytics';
import type { Company, ExplainerFocus } from '../types/company';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const focusOptions: ReadonlyArray<{ id: ExplainerFocus; label: string; hint: string }> = [
  { id: 'executive', label: 'Executive brief', hint: 'Summarize the company for a decision-maker.' },
  { id: 'risk', label: 'Risk review', hint: 'Prioritize material business and operating risks.' },
  { id: 'growth', label: 'Growth lens', hint: 'Explain growth signals and constraints.' },
  { id: 'security', label: 'Security lens', hint: 'Explain the security posture and open questions.' },
];

export function ExplainerPanel({ company }: { company: Company }) {
  const [focus, setFocus] = useState<ExplainerFocus>('executive');
  const mutation = useMutation({
    mutationFn: (requestedFocus: ExplainerFocus) => requestCompanyExplainer(company.id, requestedFocus),
    onMutate: (requestedFocus) => {
      analytics.track({
        name: 'explainer_requested',
        properties: { companyId: company.id, focus: requestedFocus },
      });
    },
  });

  const generate = () => mutation.mutate(focus);
  const result = mutation.data?.explanation ?? '';
  const meta = mutation.data
    ? `${mutation.data.model} · ${new Date(mutation.data.generatedAt).toLocaleString()}`
    : '';
  const error = mutation.error
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Explainer request failed.'
    : '';

  return (
    <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
      <Card>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Explainer focus</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          The API receives only a company ID and an allow-listed focus. The authenticated BFF validates CSRF,
          rate limits the request and builds model input from trusted local data.
        </p>
        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">Choose explainer focus</legend>
          {focusOptions.map((option) => {
            const inputId = `explainer-focus-${option.id}`;
            const hintId = `${inputId}-hint`;
            return (
              <label
                key={option.id}
                htmlFor={inputId}
                className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <span className="sr-only">Explainer focus option</span>
                <input
                  id={inputId}
                  type="radio"
                  name="focus"
                  value={option.id}
                  aria-label={option.label}
                  aria-describedby={hintId}
                  checked={focus === option.id}
                  onChange={() => setFocus(option.id)}
                  className="mt-1 accent-blue-600"
                />
                <span>
                  <span aria-hidden="true" className="block font-semibold text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                  <span id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
                    {option.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
        <Button className="mt-5 w-full" onClick={generate} disabled={mutation.isPending}>
          {mutation.isPending ? 'Generating…' : 'Generate explainer'}
        </Button>
      </Card>

      <Card className="min-h-80">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600 dark:text-blue-400">
              Model-assisted explanation
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{company.name}</h2>
          </div>
          {meta && <span className="text-xs text-slate-500">{meta}</span>}
        </div>

        {error && (
          <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {error}
          </div>
        )}
        {!error && !result && (
          <div className="mt-8 grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            Generate a concise explanation from the classified local company dataset.
          </div>
        )}
        {result && (
          <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
            {result}
          </div>
        )}
      </Card>
    </div>
  );
}
