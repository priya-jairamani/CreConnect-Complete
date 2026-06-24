import { useMemo } from 'react';
import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { formatFollowers, formatPKR } from '@/utils/formatters';
import {
  getCampaignForecast, getCampaignCalculatorEstimate, getCreatorOutreachIntel,
} from '@/utils/mockOutreachIntel';
import { RISK_VARIANT } from '@/constants/outreachOptions';

/* ----------------------------------------------------------------------- */
/* Campaign Forecast — AI-estimated outcomes for the current proposal      */
/* ----------------------------------------------------------------------- */

export function CampaignForecastCard({ proposal, selectedCreators }) {
  const forecast = useMemo(() => getCampaignForecast(proposal, selectedCreators), [proposal, selectedCreators]);

  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>📈 Campaign Forecast</h3>
        <div className="flex flex-col items-center gap-1">
          <ScoreRing value={forecast.confidenceScore} size={44} strokeWidth={5} />
          <span className="text-fg-muted text-[10px]">Confidence</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Expected Reach" value={formatFollowers(forecast.expectedReach)} />
        <Metric label="Expected Engagement" value={formatFollowers(forecast.expectedEngagement)} />
        <Metric label="Estimated Conversions" value={forecast.estimatedConversions.toLocaleString()} />
        <Metric label="Estimated ROI" value={`${forecast.estimatedROI}%`} />
      </div>
    </div>
  );
}

CampaignForecastCard.propTypes = {
  proposal: PropTypes.object.isRequired,
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/* ----------------------------------------------------------------------- */
/* Expected Campaign Calculator — Budget → Reach → Engagement → Conversion */
/* ----------------------------------------------------------------------- */

export function CampaignCalculator({ proposal, selectedCreators }) {
  const { avgFollowers, avgEngagementRate } = useMemo(() => {
    if (!selectedCreators.length) {
      return { avgFollowers: 50000, avgEngagementRate: 0.03 };
    }
    let followers = 0;
    let engagement = 0;
    selectedCreators.forEach((creator) => {
      const intel = getCreatorOutreachIntel(creator);
      followers += intel.followers;
      engagement += intel.engagementRate;
    });
    return { avgFollowers: followers / selectedCreators.length, avgEngagementRate: engagement / selectedCreators.length };
  }, [selectedCreators]);

  const budget = Number(proposal.budgetTotal) || 0;
  const estimate = useMemo(
    () => getCampaignCalculatorEstimate({ budget, avgFollowers, avgEngagementRate }),
    [budget, avgFollowers, avgEngagementRate]
  );

  const steps = [
    { icon: '💰', label: 'Budget', value: formatPKR(budget) },
    { icon: '📣', label: 'Estimated Reach', value: formatFollowers(estimate.reach) },
    { icon: '💬', label: 'Estimated Engagement', value: formatFollowers(estimate.engagement) },
    { icon: '🎯', label: 'Estimated Conversions', value: estimate.conversions.toLocaleString() },
  ];

  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>🧮 Expected Campaign Calculator</h3>
      <p className="text-fg-muted text-xs">
        Based on a budget of {formatPKR(budget)} and ~{estimate.creatorCount} creator{estimate.creatorCount === 1 ? '' : 's'} at this profile.
      </p>
      <div className="flex flex-col">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {s.icon}
              </span>
              {i < steps.length - 1 && <span className="w-px h-6" style={{ background: 'var(--border)' }} />}
            </div>
            <div className="pb-2">
              <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{s.value}</p>
              <p className="text-fg-muted text-[11px]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

CampaignCalculator.propTypes = {
  proposal: PropTypes.object.isRequired,
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/* ----------------------------------------------------------------------- */
/* Collaboration Risk Analysis                                              */
/* ----------------------------------------------------------------------- */

export function CollaborationRiskPanel({ selectedCreators }) {
  if (!selectedCreators.length) {
    return (
      <div className="card rounded-2xl p-5">
        <h3 className="font-semibold text-fg text-sm mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>🛡️ Collaboration Risk Analysis</h3>
        <p className="text-fg-muted text-xs">Shortlist creators to see reliability and risk insights.</p>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>🛡️ Collaboration Risk Analysis</h3>
      <div className="space-y-2">
        {selectedCreators.map((creator) => {
          const id = creator.id ?? creator.userId;
          const intel = getCreatorOutreachIntel(creator);
          return (
            <div key={id} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: 'var(--surface-2)' }}>
              <Avatar src={creator.avatarUrl} initials={creator.displayName?.slice(0, 2)?.toUpperCase()} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-fg text-xs font-medium truncate">{creator.displayName}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant={intel.reliability >= 85 ? 'success' : 'warning'} label={`Reliability ${intel.reliability}%`} />
                  <Badge variant={intel.missedDeadlines === 0 ? 'success' : 'warning'} label={`${intel.missedDeadlines} missed deadlines`} />
                  <Badge variant={RISK_VARIANT[intel.fraudRisk] ?? 'neutral'} label={`Fraud risk: ${intel.fraudRisk}`} />
                  <Badge variant={intel.audienceQuality >= 80 ? 'success' : 'warning'} label={`Audience quality ${intel.audienceQuality}%`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

CollaborationRiskPanel.propTypes = {
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/* ----------------------------------------------------------------------- */
/* Payment Settings                                                         */
/* ----------------------------------------------------------------------- */

export function PaymentSettingsPanel({ proposal, onChange }) {
  const payment = proposal.payment ?? {};
  const update = (patch) => onChange({ payment: { ...payment, ...patch } });

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>💳 Payment Settings</h3>
      <label className="flex items-center justify-between gap-2">
        <span className="text-fg-muted text-sm">Escrow enabled</span>
        <input type="checkbox" checked={!!payment.escrowEnabled} onChange={(e) => update({ escrowEnabled: e.target.checked })} className="w-4 h-4 rounded accent-brand-500" />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span className="text-fg-muted text-sm">Milestone payouts</span>
        <input type="checkbox" checked={!!payment.milestonePayouts} onChange={(e) => update({ milestonePayouts: e.target.checked })} className="w-4 h-4 rounded accent-brand-500" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-fg-muted text-xs">Final payout (%)</span>
          <input type="number" value={payment.finalPayoutPercent ?? ''} onChange={(e) => update({ finalPayoutPercent: e.target.value })} placeholder="e.g. 50" className="input-base w-full" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-fg-muted text-xs">Bonuses (PKR)</span>
          <input type="number" value={payment.bonuses ?? ''} onChange={(e) => update({ bonuses: e.target.value })} placeholder="Optional" className="input-base w-full" />
        </label>
      </div>
    </div>
  );
}

PaymentSettingsPanel.propTypes = {
  proposal: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

/* ----------------------------------------------------------------------- */
/* Analytics Preview — projected outcomes before sending                   */
/* ----------------------------------------------------------------------- */

export function AnalyticsPreview({ proposal, selectedCreators }) {
  const forecast = useMemo(() => getCampaignForecast(proposal, selectedCreators), [proposal, selectedCreators]);

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>🔬 Analytics Preview</h3>
      <p className="text-fg-muted text-xs">Projected results if you send this invitation now.</p>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Projected Reach" value={formatFollowers(forecast.expectedReach)} />
        <Metric label="Projected Impressions" value={formatFollowers(forecast.expectedImpressions)} />
        <Metric label="Projected Engagement" value={formatFollowers(forecast.expectedEngagement)} />
        <Metric label="Projected ROI" value={`${forecast.estimatedROI}%`} />
      </div>
    </div>
  );
}

AnalyticsPreview.propTypes = {
  proposal: PropTypes.object.isRequired,
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/* ----------------------------------------------------------------------- */

function Metric({ label, value }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)' }}>
      <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className="text-fg-muted text-[10px] mt-0.5">{label}</p>
    </div>
  );
}

Metric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
