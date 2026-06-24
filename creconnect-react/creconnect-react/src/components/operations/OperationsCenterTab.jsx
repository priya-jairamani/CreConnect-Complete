import PropTypes from 'prop-types';
import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import Badge from '@/components/common/Badge';
import OperationsHealthRing from './OperationsHealthRing';
import OpsChart from './OpsChart';
import {
  OVERVIEW_KPIS, OPERATIONS_HEALTH_SCORE, OPERATIONS_HEALTH_FACTORS, OPERATIONS_HEALTH_TREND,
  TODAYS_PRIORITIES, PRIORITY_META,
} from '@/utils/mockOperations';

function factorColor(value) {
  if (value >= 85) return 'var(--success)';
  if (value >= 70) return 'var(--brand-500)';
  if (value >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

/** Executive operational overview — KPIs, operations health score & today's AI-generated priority queue. */
export default function OperationsCenterTab({ onSelectPriority }) {
  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_KPIS.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Operations Health Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Operations Health Score</h3>
        <div className="card rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
          <OperationsHealthRing score={OPERATIONS_HEALTH_SCORE} size={120} strokeWidth={9} label="Platform Operations Score" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OPERATIONS_HEALTH_FACTORS.map((f) => (
              <div key={f.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-fg-muted">{f.label}</p>
                  <span className="text-sm font-bold text-fg">{f.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.value}%`, background: factorColor(f.value), transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
                </div>
                <p className="text-xs text-fg-muted mt-1.5">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <OpsChart
            title="Operations Health Trend"
            subtitle="14-day operations health score history"
            data={OPERATIONS_HEALTH_TREND}
            series={[{ key: 'score', label: 'Health Score', color: '#6d5cff' }]}
            type="line"
            height={180}
          />
        </div>
      </div>

      {/* Today's Priorities */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Today&apos;s Priorities</h3>
        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 880 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Priority Item</th>
                  <th className="px-3 py-3 text-center">Priority</th>
                  <th className="px-3 py-3 text-left">Impact</th>
                  <th className="px-3 py-3 text-center">Est. Resolution</th>
                  <th className="px-3 py-3 text-left">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {TODAYS_PRIORITIES.map((p) => {
                  const meta = PRIORITY_META[p.priority] ?? PRIORITY_META.medium;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderTop: '1px solid var(--border)', cursor: onSelectPriority ? 'pointer' : 'default' }}
                      onClick={() => onSelectPriority?.(p)}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-fg max-w-[280px]">{p.title}</td>
                      <td className="px-3 py-3 text-center"><Badge variant={meta.variant} label={meta.label} /></td>
                      <td className="px-3 py-3 text-fg-muted max-w-[220px]">{p.impact}</td>
                      <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{p.eta}</td>
                      <td className="px-3 py-3 text-fg-muted max-w-[240px]">{p.recommendedAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

OperationsCenterTab.propTypes = {
  onSelectPriority: PropTypes.func,
};
