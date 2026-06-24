import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { formatPKR } from '@/utils/formatters';

export default function OutreachKPIBar({ proposal, pipelineCounts, targetCreatorCount, budgetUtilization, campaignProgress }) {
  const totalInvitations = Object.values(pipelineCounts).reduce((sum, n) => sum + n, 0);
  const sent = totalInvitations - (pipelineCounts.Draft ?? 0);
  const accepted = pipelineCounts.Accepted ?? 0;
  const rejected = pipelineCounts.Rejected ?? 0;
  const pending = (pipelineCounts.Sent ?? 0) + (pipelineCounts.Viewed ?? 0) + (pipelineCounts.Negotiating ?? 0);
  const responded = sent - (pipelineCounts.Sent ?? 0) - (pipelineCounts.Viewed ?? 0);
  const responseRate = sent > 0 ? Math.round((responded / sent) * 100) : 0;
  const acceptanceRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

  const cards = [
    { icon: '✉️', label: 'Pending Invitations', value: pending },
    { icon: '✅', label: 'Accepted Invitations', value: accepted },
    { icon: '❌', label: 'Rejected Invitations', value: rejected },
    { icon: '📊', label: 'Response Rate', value: responseRate, format: (v) => `${Math.round(v)}%` },
    { icon: '🎯', label: 'Campaign Progress', value: campaignProgress, format: (v) => `${Math.round(v)}%` },
    { icon: '💰', label: 'Budget Utilization', value: budgetUtilization, format: (v) => `${Math.round(v)}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 glass" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              Campaign Invitation Center
            </h1>
            <p className="text-fg-muted text-sm mt-0.5">
              Discover, evaluate, and invite creators — build your campaign proposal end to end.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <MetaItem label="Active Campaign" value={proposal.title || 'Untitled Campaign'} />
          <MetaItem label="Budget" value={formatPKR(proposal.budgetTotal || 0)} />
          <MetaItem label="Deadline" value={proposal.timeline?.completion || '—'} />
          <MetaItem label="Target Creators" value={targetCreatorCount} />
          <MetaItem label="Invitations Sent" value={sent} />
          <MetaItem label="Acceptance Rate" value={`${acceptanceRate}%`} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={<AnimatedCounter value={c.value} format={c.format ?? ((v) => Math.round(v).toLocaleString())} />}
          />
        ))}
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <p className="text-fg font-semibold text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className="text-fg-muted text-[11px] mt-0.5">{label}</p>
    </div>
  );
}

MetaItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

OutreachKPIBar.propTypes = {
  proposal: PropTypes.object.isRequired,
  pipelineCounts: PropTypes.object.isRequired,
  targetCreatorCount: PropTypes.number.isRequired,
  budgetUtilization: PropTypes.number.isRequired,
  campaignProgress: PropTypes.number.isRequired,
};
