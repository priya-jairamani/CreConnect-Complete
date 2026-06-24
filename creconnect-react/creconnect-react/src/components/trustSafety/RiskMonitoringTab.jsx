import Avatar from '@/components/common/Avatar';
import ViolationChart from './ViolationChart';
import {
  RISK_HEATMAP, VIOLATION_TREND_SERIES, REPORT_VOLUME_SERIES, FRAUD_INCIDENT_SERIES,
  DISPUTE_FREQUENCY_SERIES, RESOLUTION_TIME_SERIES, TRUST_INTELLIGENCE,
} from '@/utils/mockTrustSafety';

function riskColor(level) {
  if (level === 'critical') return 'var(--danger)';
  if (level === 'high') return 'var(--warning)';
  if (level === 'medium') return 'var(--brand-500)';
  return 'var(--success)';
}

function HeatmapBlock({ title, data }) {
  return (
    <div className="card rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <div className="space-y-2.5">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-fg-muted">{item.label}</span>
              <span className="text-fg font-medium">{item.riskScore}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.riskScore}%`, background: riskColor(item.riskLevel), transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustLeaderboard({ title, items, showDelta = false }) {
  return (
    <div className="card rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <Avatar initials={item.initials} color={item.color} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg truncate">{item.name}</p>
              <p className="text-xs text-fg-muted truncate">{item.type} · {item.handle}</p>
            </div>
            <span className="text-sm font-bold text-fg">{item.trustScore}</span>
            {showDelta && (
              <span className={`text-xs ${item.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                {item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Platform-wide risk analytics — heatmaps, violation trends & trust intelligence leaderboards. */
export default function RiskMonitoringTab() {
  return (
    <div className="space-y-6">
      {/* Risk heatmaps */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Risk Heatmap</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HeatmapBlock title="Risk by Industry" data={RISK_HEATMAP.byIndustry} />
          <HeatmapBlock title="Risk by Campaign Type" data={RISK_HEATMAP.byCampaignType} />
          <HeatmapBlock title="Risk by Geography" data={RISK_HEATMAP.byGeography} />
          <HeatmapBlock title="Risk by User Category" data={RISK_HEATMAP.byUserCategory} />
        </div>
      </div>

      {/* Violation analytics */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Violation Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ViolationChart
            title="Violation Trends"
            subtitle="Total policy violations over the last 8 months"
            data={VIOLATION_TREND_SERIES}
            series={[{ key: 'violations', label: 'Violations', color: '#f0445f' }]}
          />
          <ViolationChart
            title="Report Volume"
            subtitle="New reports filed per week"
            data={REPORT_VOLUME_SERIES}
            series={[{ key: 'reports', label: 'Reports', color: '#6d5cff' }]}
          />
          <ViolationChart
            title="Fraud Incidents"
            subtitle="Detected fraud incidents per week"
            data={FRAUD_INCIDENT_SERIES}
            series={[{ key: 'incidents', label: 'Incidents', color: '#f59e0b' }]}
          />
          <ViolationChart
            title="Dispute Frequency"
            subtitle="Disputes opened per month"
            data={DISPUTE_FREQUENCY_SERIES}
            series={[{ key: 'disputes', label: 'Disputes', color: '#857fff' }]}
          />
          <ViolationChart
            title="Resolution Times"
            subtitle="Average case resolution time (hours)"
            data={RESOLUTION_TIME_SERIES}
            series={[{ key: 'hours', label: 'Avg. Hours', color: '#16b364' }]}
            type="line"
          />
        </div>
      </div>

      {/* Trust intelligence */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Trust Intelligence</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TrustLeaderboard title="Top Trusted Creators" items={TRUST_INTELLIGENCE.topTrustedCreators} />
          <TrustLeaderboard title="Top Trusted Brands" items={TRUST_INTELLIGENCE.topTrustedBrands} />
          <TrustLeaderboard title="Most Improved Trust Scores" items={TRUST_INTELLIGENCE.mostImproved} showDelta />
        </div>
      </div>
    </div>
  );
}
