import { useMemo } from 'react';
import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import InsightCard from '@/components/adminDashboard/InsightCard';
import MultiSeriesChart from './MultiSeriesChart';
import FraudAlertCard from './FraudAlertCard';
import { RISK_META } from '@/utils/mockUserIntelligence';
import {
  OVERVIEW_KPIS,
  USER_GROWTH_SERIES,
  VERIFICATION_TRENDS,
  USER_ACTIVITY_TRENDS,
  AI_INSIGHTS,
  FRAUD_ALERTS,
  CREATORS,
  BRANDS,
} from '@/utils/mockUserIntelligence';

/** Overview tab — executive KPIs, growth/verification/activity trends, AI insights, risk & fraud snapshot. */
export default function OverviewTab({ onSelectEntity }) {
  const riskCounts = useMemo(() => {
    const all = [...CREATORS, ...BRANDS];
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    all.forEach((u) => { counts[u.riskLevel] = (counts[u.riskLevel] ?? 0) + 1; });
    return counts;
  }, []);

  const total = CREATORS.length + BRANDS.length;

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {OVERVIEW_KPIS.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Growth / Verification / Activity charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MultiSeriesChart
          title="User Growth"
          data={USER_GROWTH_SERIES}
          series={[
            { key: 'creators', label: 'Creators', color: '#6d5cff' },
            { key: 'brands', label: 'Brands', color: '#f59e0b' },
          ]}
        />
        <MultiSeriesChart
          title="Verification Trends"
          data={VERIFICATION_TRENDS}
          series={[
            { key: 'approved', label: 'Approved', color: '#16b364' },
            { key: 'pending', label: 'Pending', color: '#f5a623' },
            { key: 'rejected', label: 'Rejected', color: '#f0445f' },
          ]}
        />
        <MultiSeriesChart
          title="User Activity Trends"
          data={USER_ACTIVITY_TRENDS}
          series={[
            { key: 'logins', label: 'Logins', color: '#22c1ff' },
            { key: 'campaigns', label: 'Campaigns', color: '#857fff' },
          ]}
        />
      </div>

      {/* Risk Engine snapshot */}
      <div className="card rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Risk Engine Snapshot</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(RISK_META).map(([level, meta]) => {
            const count = riskCounts[level] ?? 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={level} className="rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
                <p className="text-2xl font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>{count}</p>
                <p className="text-xs text-fg-muted mt-0.5">{meta.label}</p>
                <div className="h-1.5 rounded-full bg-surface mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: meta.variant === 'success' ? 'var(--success)' : meta.variant === 'danger' ? 'var(--danger)' : meta.variant === 'warning' ? 'var(--warning)' : 'var(--brand-500)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="text-lg font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>AI Insights Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_INSIGHTS.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      </div>

      {/* Fraud Detection */}
      <div>
        <h3 className="text-lg font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Fraud Detection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FRAUD_ALERTS.slice(0, 6).map((alert) => (
            <FraudAlertCard key={alert.id} alert={alert} onAction={() => onSelectEntity?.(alert.entityId, alert.entityType)} />
          ))}
        </div>
      </div>
    </div>
  );
}
