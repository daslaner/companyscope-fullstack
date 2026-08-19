import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type PieSectorShapeProps,
} from 'recharts';
import { buildCompanyDetailCharts } from '../lib/detailChartData';
import { chartColor, formatChartValue } from '../lib/chartPresentation';
import type { Company, CompanyTab } from '../types/company';
import { Card } from './ui/Card';

const axisTick = { fill: 'var(--chart-text)', fontSize: 11 };

const tooltipStyle = {
  background: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-grid)',
  borderRadius: '12px',
  color: 'var(--chart-label)',
  boxShadow: '0 12px 30px rgb(15 23 42 / .14)',
};

function DetailPieSlice({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  index,
}: PieSectorShapeProps) {
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={chartColor(index)}
      stroke="var(--chart-surface)"
      strokeWidth={3}
    />
  );
}

function DetailChartCard({
  id,
  eyebrow,
  title,
  description,
  summary,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <figure aria-labelledby={`${id}-title`} aria-describedby={`${id}-description ${id}-summary`}>
        <figcaption>
          <p className="text-[11px] font-black uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h3 id={`${id}-title`} className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {title}
          </h3>
          <p id={`${id}-description`} className="mt-1 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </figcaption>
        <div className="mt-4 h-64 w-full" data-testid={`detail-chart-${id}`}>
          {children}
        </div>
        <p id={`${id}-summary`} className="sr-only">
          {summary}
        </p>
      </figure>
    </Card>
  );
}

export function CompanyDetailAnalytics({ company, tab }: { company: Company; tab: CompanyTab }) {
  const charts = buildCompanyDetailCharts(company, tab);
  const barSummary = charts.bar.data.map((item) => `${item.label}: ${formatChartValue(item.value, charts.bar.suffix)}`).join('. ');
  const lineSummary = charts.line.data.map((item) => `${item.label}: ${formatChartValue(item.value, charts.line.suffix)}`).join('. ');
  const pieSummary = charts.pie.data.map((item) => `${item.name}: ${formatChartValue(item.value, charts.pie.suffix)}`).join('. ');

  return (
    <section aria-labelledby={`${tab}-analytics-title`} className="mt-8 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            Classified analytics
          </p>
          <h2 id={`${tab}-analytics-title`} className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {company.name} · {tab} signals
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Three views derived from the local company snapshot. Proxy series are explicitly labelled and never presented as reported history.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          3 charts · local data
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DetailChartCard
          id={charts.bar.id}
          eyebrow="Bar chart"
          title={charts.bar.title}
          description={charts.bar.description}
          summary={barSummary}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.bar.data} layout="vertical" margin={{ top: 8, right: 18, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="label" tick={axisTick} width={98} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: 'var(--chart-hover)' }}
                formatter={(value) => [formatChartValue(value, charts.bar.suffix), charts.bar.title]}
              />
              <Bar dataKey="value" name={charts.bar.title} fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DetailChartCard>

        <DetailChartCard
          id={charts.line.id}
          eyebrow="Line chart"
          title={charts.line.title}
          description={charts.line.description}
          summary={lineSummary}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.line.data} margin={{ top: 8, right: 14, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatChartValue(value, charts.line.suffix), charts.line.title]}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={charts.line.title}
                stroke="var(--chart-2)"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </DetailChartCard>

        <DetailChartCard
          id={charts.pie.id}
          eyebrow="Donut chart"
          title={charts.pie.title}
          description={charts.pie.description}
          summary={pieSummary}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.pie.data}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={2}
                shape={DetailPieSlice}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatChartValue(value, charts.pie.suffix), charts.pie.title]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </DetailChartCard>
      </div>
    </section>
  );
}
