import { useMemo } from 'react';
import Badge from '@/components/common/Badge';
import CampaignRiskBadge from './CampaignRiskBadge';
import { CAMPAIGNS, PIPELINE_STAGE_META, HEALTH_META } from '@/utils/mockCampaignIntelligence';
import { formatCompactPKR } from '@/utils/formatters';

/** Campaign Pipeline — kanban board grouping campaigns by lifecycle stage. */
export default function CampaignPipelineTab({ onSelectCampaign }) {
  const columns = useMemo(() => {
    return PIPELINE_STAGE_META.map((stage) => ({
      ...stage,
      campaigns: CAMPAIGNS.filter((c) => c.pipelineStage === stage.id),
    }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Campaign Pipeline</h3>
          <p className="text-xs text-fg-muted mt-0.5">Drag-free kanban view of every campaign by lifecycle stage</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{col.label}</h4>
              <span className="text-xs font-bold text-fg bg-surface-2 rounded-full px-2 py-0.5">{col.campaigns.length}</span>
            </div>
            <div className="space-y-3 min-h-[120px]">
              {col.campaigns.length === 0 ? (
                <div className="card rounded-xl p-4 text-center text-xs text-fg-muted border border-dashed border-border-subtle">
                  No campaigns
                </div>
              ) : (
                col.campaigns.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCampaign(c)}
                    className="card rounded-xl p-3.5 w-full text-left hover:shadow-card-lg hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-fg leading-snug">{c.name}</p>
                      <CampaignRiskBadge level={c.riskLevel} />
                    </div>
                    <p className="text-xs text-fg-muted mb-2">{c.brand} · {c.industry}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-fg-muted">{formatCompactPKR(c.budget)}</span>
                      <span className="text-fg-muted">{c.creatorCount} creators</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={HEALTH_META[c.healthStatus].variant} label={HEALTH_META[c.healthStatus].label} />
                      <span className="text-xs font-bold text-fg">{c.progress}%</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
