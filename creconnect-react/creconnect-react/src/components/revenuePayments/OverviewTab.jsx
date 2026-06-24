import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import FinancialHealthRing from './FinancialHealthRing';
import RevenueChart from './RevenueChart';
import GMVChart from './GMVChart';
import {
  OVERVIEW_KPIS, FINANCIAL_HEALTH_SCORE, FINANCIAL_HEALTH_FACTORS, FINANCIAL_HEALTH_TREND,
  REVENUE_SNAPSHOT, TIME_FILTERS, getRevenueSeries, REVENUE_BREAKDOWN,
} from '@/utils/mockRevenuePayments';
import { formatCompactPKR } from '@/utils/formatters';

const PIE_COLORS = ['#6d5cff', '#857fff', '#16b364', '#f59e0b', '#f0445f', '#0ea5e9', '#d946ef', '#10b981', '#f97316'];

function factorColor(value) {
  if (value >= 85) return 'var(--success)';
  if (value >= 70) return 'var(--brand-500)';
  if (value >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

const HEALTH_TREND_DATA = FINANCIAL_HEALTH_TREND.map((score, i) => ({ label: `D${i + 1}`, score }));

const SNAPSHOT_PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

function DonutBreakdown({ title, data }) {
  return (
    <div className="card rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <div className="flex items-center gap-4">
        <div style={{ width: 120, height: 120 }} className="flex-shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={32} outerRadius={56} paddingAngle={2} animationDuration={600}>
                {data.map((entry, i) => <Cell key={entry.label} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCompactPKR(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center justify-between text-xs gap-2">
              <span className="flex items-center gap-1.5 text-fg-muted truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.label}
              </span>
              <span className="text-fg font-medium flex-shrink-0">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarBreakdown({ title, data }) {
  return (
    <div className="card rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={d.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-fg-muted">{d.label}</span>
              <span className="text-fg font-medium">{d.pct}% · {formatCompactPKR(d.value)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: PIE_COLORS[i % PIE_COLORS.length], transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Financial executive dashboard — KPIs, health score, revenue snapshot, trend charts & breakdowns. */
export default function OverviewTab() {
  const [snapshotPeriod, setSnapshotPeriod] = useState('month');
  const [range, setRange] = useState('30D');

  const snapshot = REVENUE_SNAPSHOT[snapshotPeriod];
  const series = getRevenueSeries(range);

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_KPIS.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Financial Health Center */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Financial Health Center</h3>
          <div className="flex items-center justify-center mb-4">
            <FinancialHealthRing score={FINANCIAL_HEALTH_SCORE} size={120} strokeWidth={9} label="Overall Health" />
          </div>
          <div className="space-y-3">
            {FINANCIAL_HEALTH_FACTORS.map((factor) => (
              <div key={factor.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-fg-muted">{factor.label}</span>
                  <span className="text-fg font-medium">{factor.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${factor.score}%`, background: factorColor(factor.score), transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <RevenueChart
          title="Financial Health Trend"
          subtitle="Composite financial health score over the last 14 days"
          data={HEALTH_TREND_DATA}
          series={[{ key: 'score', label: 'Health Score', color: '#16b364' }]}
          currency={false}
        />
      </div>

      {/* Revenue Snapshot */}
      <div className="card rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h3 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Revenue Snapshot</h3>
          <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 overflow-x-auto">
            {SNAPSHOT_PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSnapshotPeriod(p.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  snapshotPeriod === p.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Revenue', value: formatCompactPKR(snapshot.revenue) },
            { label: 'Transactions', value: snapshot.transactions.toLocaleString() },
            { label: 'Growth', value: `+${snapshot.growthPct}%`, positive: true },
            { label: 'Active Payers', value: snapshot.activePayers.toLocaleString() },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs text-fg-muted">{item.label}</p>
              <p className={`text-lg font-bold mt-1 ${item.positive ? 'text-success' : 'text-fg'}`} style={{ fontFamily: 'Sora, sans-serif' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Charts */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Revenue Charts</h3>
          <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1">
            {TIME_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setRange(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  range === f ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueChart title="Revenue Growth" subtitle="Total platform revenue" data={series} series={[{ key: 'revenue', label: 'Revenue', color: '#6d5cff' }]} />
          <GMVChart title="GMV Trend" subtitle="Gross marketplace volume" data={series} series={[{ key: 'gmv', label: 'GMV', color: '#857fff' }]} />
          <RevenueChart title="Platform Revenue Trend" subtitle="Platform take-rate revenue" data={series} series={[{ key: 'platformRevenue', label: 'Platform Revenue', color: '#16b364' }]} />
          <RevenueChart title="Creator Earnings Trend" subtitle="Total creator payouts" data={series} series={[{ key: 'creatorEarnings', label: 'Creator Earnings', color: '#f59e0b' }]} />
          <GMVChart title="Brand Spend Trend" subtitle="Total brand spending" data={series} series={[{ key: 'brandSpend', label: 'Brand Spend', color: '#0ea5e9' }]} />
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Revenue Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DonutBreakdown title="Revenue by Industry" data={REVENUE_BREAKDOWN.byIndustry} />
          <DonutBreakdown title="Revenue by Region" data={REVENUE_BREAKDOWN.byRegion} />
          <BarBreakdown title="Revenue by Campaign Type" data={REVENUE_BREAKDOWN.byCampaignType} />
          <BarBreakdown title="Revenue by Creator Category" data={REVENUE_BREAKDOWN.byCreatorCategory} />
          <BarBreakdown title="Revenue by Brand Tier" data={REVENUE_BREAKDOWN.byBrandTier} />
        </div>
      </div>
    </div>
  );
}
