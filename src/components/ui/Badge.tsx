import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

type Tone = 'neutral' | 'positive' | 'warning' | 'danger' | 'accent';

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: Tone }>) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', {
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200': tone === 'neutral',
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200':
          tone === 'positive',
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200': tone === 'warning',
        'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200': tone === 'danger',
        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200': tone === 'accent',
      })}
    >
      {children}
    </span>
  );
}
