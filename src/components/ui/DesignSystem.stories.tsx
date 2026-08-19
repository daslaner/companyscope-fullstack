import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

function DesignSystemShowcase() {
  return (
    <div className="max-w-4xl space-y-8 p-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">CompanyScope primitives</h1>
        <div className="flex flex-wrap gap-2">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Status semantics</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="positive">Positive</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card>
          <h2 className="font-bold text-slate-950 dark:text-white">Card surface</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Shared surface treatment keeps data-heavy layouts visually consistent.
          </p>
        </Card>
        <Card className="border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="font-bold text-slate-950 dark:text-white">Context surface</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The same primitive supports contextual emphasis without adding another component abstraction.
          </p>
        </Card>
      </section>
    </div>
  );
}

const meta = {
  title: 'Design System/Primitives',
  component: DesignSystemShowcase,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DesignSystemShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
