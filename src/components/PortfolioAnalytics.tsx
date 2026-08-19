import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type PieSectorShapeProps,
} from 'recharts';
import { companies } from '../data/companies';
import {
  buildFoundingCohorts,
  buildPortfolioHealth,
  buildProfitabilityMix,
  buildRiskDistribution,
  buildRevenueGrowthScatter,
  buildTrustCoverage,
} from '../lib/chartData';
import { chartColor } from '../lib/chartPresentation';
import { Card } from './ui/Card';

const tooltipStyle = {
  background: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-grid)',
  borderRadius: '12px',
  color: 'var(--chart-label)',
  boxShadow: '0 12px 30px rgb(15 23 42 / .14)',
};

function ProfitabilitySlice({
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

function ChartCard({
  id,
  eyebrow,
  title,
  description,
  summary,
  children,
  wide = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Card className={wide ? 'lg:col-span-2' : undefined}>
      <figure aria-labelledby={`${id}-title`} aria-describedby={`${id}-description ${id}-summary`}>
        <figcaption>
          <p className="text-[11px] font-black uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h3 id={`${id}-title`} className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {title}
          </h3>
          <p id={`${id}-description`} className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </figcaption>
        <div className="mt-5 h-72 w-full" data-testid={`chart-${id}`}>
          {children}
        </div>
        <p id={`${id}-summary`} className="sr-only">
          {summary}
        </p>
      </figure>
    </Card>
  );
}

const axisTick = { fill: 'var(--chart-text)', fontSize: 11 };

export function PortfolioAnalytics() {
  const profitabilityMix = buildProfitabilityMix(companies);
  const riskDistribution = buildRiskDistribution(companies);
  const foundingCohorts = buildFoundingCohorts(companies);
  const revenueGrowthScatter = buildRevenueGrowthScatter(companies);
  const portfolioHealth = buildPortfolioHealth(companies);
  const trustCoverage = buildTrustCoverage(companies);

  return (
    <section aria-labelledby="portfolio-analytics-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            Visual analytics
          </p>
          <h2 id="portfolio-analytics-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Seven ways to interrogate the portfolio
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Interactive, keyboard-accessible views derived entirely from the same 100-company local dataset.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Recharts · 7 chart families
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          id="risk-bands"
          eyebrow="Bar chart"
          title="Risk band distribution"
          description="Company count across low, moderate and elevated composite-risk bands."
          summary={riskDistribution.map((item) => `${item.name}: ${item.value} companies`).join('. ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskDistribution} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
              <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={axisTick} width={72} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--chart-hover)' }} />
              <Bar dataKey="value" name="Companies" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="profitability-mix"
          eyebrow="Donut chart"
          title="Profitability mix"
          description="Portfolio composition by operating profile."
          summary={profitabilityMix.map((item) => `${item.name}: ${item.value}`).join('. ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={profitabilityMix}
                dataKey="value"
                nameKey="name"
                innerRadius="56%"
                outerRadius="82%"
                paddingAngle={3}
                shape={ProfitabilitySlice}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="growth-cohort"
          eyebrow="Line chart"
          title="Growth by founding cohort"
          description="Average growth proxy for three-year founding cohorts."
          summary={`The dataset is grouped into ${foundingCohorts.length} ordered three-year founding cohorts.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={foundingCohorts} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="year" tick={axisTick} />
              <YAxis tick={axisTick} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Average growth']} />
              <Line type="monotone" dataKey="avgGrowthPct" name="Average growth" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="revenue-cohort"
          eyebrow="Area chart"
          title="Revenue by founding cohort"
          description="Estimated aggregate revenue represented by each company cohort."
          summary={`Peak cohort revenue is €${Math.max(0, ...foundingCohorts.map((item) => item.revenueM))}M.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={foundingCohorts} margin={{ top: 8, right: 12, bottom: 0, left: -6 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="year" tick={axisTick} />
              <YAxis tick={axisTick} tickFormatter={(value) => `€${Math.round(Number(value) / 1000)}kM`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`€${Number(value).toLocaleString()}M`, 'Revenue']} />
              <Area type="monotone" dataKey="revenueM" name="Revenue" stroke="var(--chart-3)" strokeWidth={2.5} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="revenue-growth"
          eyebrow="Scatter chart"
          title="Revenue vs. growth"
          description="All 100 companies plotted by estimated revenue and growth proxy."
          summary={`Scatter plot contains ${revenueGrowthScatter.length} company observations.`}
          wide
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" />
              <XAxis type="number" dataKey="revenueM" name="Revenue" unit="M" tick={axisTick} />
              <YAxis type="number" dataKey="growthPct" name="Growth" unit="%" tick={axisTick} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ strokeDasharray: '4 4', stroke: 'var(--chart-text)' }}
                formatter={(value, name) => [name === 'Revenue' ? `€${value}M` : `${value}%`, name]}
              />
              <Scatter name="Companies" data={revenueGrowthScatter} fill="var(--chart-4)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="portfolio-health"
          eyebrow="Radar chart"
          title="Portfolio health"
          description="Normalized operating, security, verification and growth signals."
          summary={portfolioHealth.map((item) => `${item.metric}: ${item.value} out of 100`).join('. ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={portfolioHealth} outerRadius="72%">
              <PolarGrid stroke="var(--chart-grid)" />
              <PolarAngleAxis dataKey="metric" tick={axisTick} />
              <Radar dataKey="value" name="Health score" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2.5} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}/100`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="trust-coverage"
          eyebrow="Radial bar chart"
          title="Trust coverage"
          description="Verification, MFA adoption and strong-security coverage at a glance."
          summary={trustCoverage.map((item) => `${item.name}: ${item.value}%`).join('. ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart data={trustCoverage} innerRadius="22%" outerRadius="92%" startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" name="Coverage" fill="var(--chart-5)" background={{ fill: 'var(--chart-hover)' }} cornerRadius={8} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Coverage']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </section>
  );
}
