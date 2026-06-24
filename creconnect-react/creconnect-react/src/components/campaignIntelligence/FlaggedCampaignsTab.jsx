import { useMemo } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import CampaignRiskBadge from './CampaignRiskBadge';
import DisputeCard from './DisputeCard';
import { FLAGGED_CAMPAIGNS, DISPUTES, HEALTH_META } from '@/utils/mockCampaignIntelligence';

const FLAG_ICON = {
  'Missed Deadline': '⏰',
  'Payment Issue': '💳',
  'Policy Violation': '⚠️',
  'Creator Complaints': '📣',
  'High Dispute Rate': '⚖️',
  'Low Satisfaction': '😕',
};

const RISK_FACTOR_META = [
  { key: 'paymentDelays', label: 'Payment Delays' },
  { key: 'negativeReviews', label: 'Negative Reviews' },
  { key: 'violationReports', label: 'Violation Reports' },
  { key: 'creatorComplaints', label: 'Creator Complaints' },
  { key: 'missedDeliverables', label: 'Missed Deliverables' },
];

function factorColor(value) {
  if (value >= 60) return 'var(--danger)';
  if (value >= 35) return 'var(--warning)';
  return 'var(--success)';
}

/** Moderation workspace — flagged campaigns, risk scoring & the dispute center. */
export default function FlaggedCampaignsTab({ onSelectCampaign }) {
  const disputeCounts = useMemo(() => {
    return {
      open: DISPUTES.filter((d) => d.status === 'Open').length,
      underInvestigation: DISPUTES.filter((d) => d.status === 'Under Investigation').length,
      resolved: DISPUTES.filter((d) => d.status === 'Resolved').length,
      payment: DISPUTES.filter((d) => d.type === 'Payment Dispute').length,
      contract: DISPUTES.filter((d) => d.type === 'Contract Dispute').length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Dispute Center KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Open Disputes', value: disputeCounts.open, accent: 'var(--danger)' },
          { label: 'Under Investigation', value: disputeCounts.underInvestigation, accent: 'var(--warning)' },
          { label: 'Resolved Cases', value: disputeCounts.resolved, accent: 'var(--success)' },
          { label: 'Payment Disputes', value: disputeCounts.payment, accent: 'var(--brand-500)' },
          { label: 'Contract Disputes', value: disputeCounts.contract, accent: 'var(--brand-500)' },
        ].map((kpi) => (
          <div key={kpi.label} className="card rounded-2xl p-4">
            <p className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{kpi.value}</p>
            <p className="text-xs text-fg-muted mt-1">{kpi.label}</p>
            <div className="h-1 rounded-full mt-2" style={{ background: kpi.accent, opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {/* Flagged Campaigns */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Flagged Campaigns</h3>
        {FLAGGED_CAMPAIGNS.length === 0 ? (
          <EmptyState icon="✅" title="No flagged campaigns" message="Everything looks healthy right now." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {FLAGGED_CAMPAIGNS.map((c) => (
              <div key={c.id} className="card rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fg truncate">{c.name}</p>
                    <p className="text-xs text-fg-muted truncate">{c.brand} · {c.industry} · {c.id}</p>
                  </div>
                  <CampaignRiskBadge level={c.riskLevel} />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.flags.map((flag) => (
                    <span key={flag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-danger/10 text-danger">
                      <span>{FLAG_ICON[flag] ?? '⚠️'}</span> {flag}
                    </span>
                  ))}
                  <Badge variant={HEALTH_META[c.healthStatus].variant} label={HEALTH_META[c.healthStatus].label} />
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fg-muted">Campaign Risk Score</span>
                    <span className="text-fg font-bold">{c.riskScore}/100</span>
                  </div>
                  {RISK_FACTOR_META.map((factor) => {
                    const value = Math.round(c.riskFactors[factor.key]);
                    return (
                      <div key={factor.key}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-fg-muted">{factor.label}</span>
                          <span className="text-fg-muted">{value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${value}%`, background: factorColor(value) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-3">
                  <Button variant="secondary" size="xs" onClick={() => onSelectCampaign(c)}>Review Campaign</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispute Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Dispute Center</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DISPUTES.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onAction={(d) => {
                const campaign = FLAGGED_CAMPAIGNS.find((c) => c.id === d.campaignId);
                if (campaign) onSelectCampaign(campaign);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
