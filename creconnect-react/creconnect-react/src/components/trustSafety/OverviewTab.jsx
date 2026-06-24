import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import TrustScoreRing from './TrustScoreRing';
import SafetyInsightCard from './SafetyInsightCard';
import ViolationChart from './ViolationChart';
import {
  OVERVIEW_KPIS, SAFETY_FACTORS, PLATFORM_SAFETY_SCORE, SAFETY_SCORE_TREND,
  AI_SAFETY_INSIGHTS, MODERATOR_OPS,
} from '@/utils/mockTrustSafety';

function factorColor(value) {
  if (value >= 85) return 'var(--success)';
  if (value >= 70) return 'var(--brand-500)';
  if (value >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

const SAFETY_TREND_DATA = SAFETY_SCORE_TREND.map((score, i) => ({ label: `D${i + 1}`, score }));

/** Trust & Safety Executive Dashboard — KPIs, platform safety score & AI insights. */
export default function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_KPIS.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Platform Safety Score */}
        <div className="card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Platform Safety Score</h3>
          <div className="flex items-center justify-center mb-4">
            <TrustScoreRing score={PLATFORM_SAFETY_SCORE} size={120} strokeWidth={9} label="Overall Score" />
          </div>
          <div className="space-y-3">
            {SAFETY_FACTORS.map((factor) => (
              <div key={factor.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-fg-muted">{factor.label}</span>
                  <span className="text-fg font-medium">{factor.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${factor.score}%`, background: factorColor(factor.score), transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety score trend */}
        <ViolationChart
          title="Safety Score Trend"
          subtitle="Platform safety score over the last 14 days"
          data={SAFETY_TREND_DATA}
          series={[{ key: 'score', label: 'Safety Score', color: '#16b364' }]}
        />
      </div>

      {/* AI Safety Insights */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Safety Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_SAFETY_INSIGHTS.map((insight) => <SafetyInsightCard key={insight.id} insight={insight} />)}
        </div>
      </div>

      {/* Moderator Operations */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Moderator Operations</h3>
        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Moderator</th>
                  <th className="px-3 py-3 text-center">Cases Assigned</th>
                  <th className="px-3 py-3 text-center">Cases Resolved</th>
                  <th className="px-3 py-3 text-center">Avg. Resolution Time</th>
                  <th className="px-3 py-3 text-center">Pending Reviews</th>
                  <th className="px-3 py-3 text-center">Escalated Cases</th>
                </tr>
              </thead>
              <tbody>
                {MODERATOR_OPS.map((m) => (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: m.color }}>
                          {m.initials}
                        </span>
                        <span className="text-fg font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-fg">{m.casesAssigned}</td>
                    <td className="px-3 py-3 text-center text-fg">{m.casesResolved}</td>
                    <td className="px-3 py-3 text-center text-fg-muted">{m.avgResolutionHours}h</td>
                    <td className="px-3 py-3 text-center text-fg-muted">{m.pendingReviews}</td>
                    <td className="px-3 py-3 text-center text-fg-muted">{m.escalatedCases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
