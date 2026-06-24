import { useMemo } from 'react';
import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import CampaignPerformanceChart from './CampaignPerformanceChart';
import CampaignHealthRing from './CampaignHealthRing';
import CampaignRiskBadge from './CampaignRiskBadge';
import CampaignInsightCard from './CampaignInsightCard';
import PipelineFunnel from './PipelineFunnel';
import Badge from '@/components/common/Badge';
import {
  OVERVIEW_KPIS, CAMPAIGNS, PIPELINE_STAGES, AI_INSIGHTS, AI_RISK_DETECTION,
  CAMPAIGN_GROWTH_SERIES, HEALTH_META,
} from '@/utils/mockCampaignIntelligence';

const HEALTH_PROGRESS_COLOR = {
  excellent: 'var(--success)',
  healthy: 'var(--brand-500)',
  warning: 'var(--warning)',
  critical: 'var(--danger)',
};

/** Executive overview — KPIs, campaign health center, pipeline funnel & AI insights. */
export default function OverviewTab({ onSelectCampaign }) {
  const healthCounts = useMemo(() => {
    const counts = { excellent: 0, healthy: 0, warning: 0, critical: 0 };
    CAMPAIGNS.forEach((c) => { counts[c.healthStatus] += 1; });
    return counts;
  }, []);

  const avgHealth = useMemo(() => {
    return Math.round(CAMPAIGNS.reduce((s, c) => s + c.healthScore, 0) / CAMPAIGNS.length);
  }, []);

  const total = CAMPAIGNS.length;

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_KPIS.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Campaign growth chart */}
      <CampaignPerformanceChart
        title="Campaign Growth"
        subtitle="Created vs. completed campaigns over time"
        data={CAMPAIGN_GROWTH_SERIES}
        series={[
          { key: 'created', label: 'Created', color: '#6d5cff' },
          { key: 'completed', label: 'Completed', color: '#16b364' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Campaign Health Center */}
        <div className="card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Campaign Health Center</h3>
          <div className="flex items-center justify-center mb-4">
            <CampaignHealthRing score={avgHealth} size={120} strokeWidth={9} label="Platform Average" />
          </div>
          <div className="space-y-3">
            {Object.entries(healthCounts).map(([key, count]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-fg-muted">{HEALTH_META[key].label}</span>
                  <span className="text-fg font-medium">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / total) * 100}%`, background: HEALTH_PROGRESS_COLOR[key], transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Campaign Pipeline Overview</h3>
          <PipelineFunnel stages={PIPELINE_STAGES} />
        </div>
      </div>

      {/* AI Insights Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Insights Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_INSIGHTS.map((insight) => <CampaignInsightCard key={insight.id} insight={insight} />)}
        </div>
      </div>

      {/* AI Risk Detection */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Risk Detection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_RISK_DETECTION.map((risk) => (
            <div key={risk.id} className="card rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-danger/12 text-danger flex items-center justify-center text-lg flex-shrink-0">⚠️</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-fg truncate">{risk.campaign}</p>
                  <CampaignRiskBadge level={risk.riskLevel} />
                </div>
                <p className="text-xs text-fg-muted mt-1">{risk.brand}</p>
                <p className="text-xs text-fg-muted mt-1.5 leading-snug">{risk.reason}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <Badge variant={HEALTH_META[risk.healthStatus].variant} label={HEALTH_META[risk.healthStatus].label} />
                  <button
                    type="button"
                    onClick={() => onSelectCampaign?.(risk.campaignId)}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Investigate →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
