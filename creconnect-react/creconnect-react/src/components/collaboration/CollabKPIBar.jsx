import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { formatPKR } from '@/utils/formatters';

export default function CollabKPIBar({ summary }) {
  const cards = [
    { icon: '🚀', label: 'Active Collaborations', value: summary.activeCollaborations },
    { icon: '✉️', label: 'Pending Invitations',   value: summary.pendingInvitations   },
    { icon: '🏁', label: 'Completed Campaigns',   value: summary.completedCampaigns   },
    { icon: '💰', label: 'Total Earnings',         value: summary.totalEarnings,        format: formatPKR, highlight: true },
    { icon: '★',  label: 'Avg. Rating',            value: summary.avgRating,            format: (v) => (v > 0 ? v.toFixed(1) : '—') },
    { icon: '✓',  label: 'Success Rate',           value: summary.successRate,          format: (v) => `${Math.round(v)}%` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <StatCard
          key={c.label}
          icon={c.icon}
          label={c.label}
          highlight={c.highlight}
          value={
            <AnimatedCounter
              value={c.value ?? 0}
              format={c.format ?? ((v) => Math.round(v).toLocaleString())}
            />
          }
        />
      ))}
    </div>
  );
}

CollabKPIBar.propTypes = {
  summary: PropTypes.shape({
    activeCollaborations: PropTypes.number,
    pendingInvitations:   PropTypes.number,
    completedCampaigns:   PropTypes.number,
    totalEarnings:        PropTypes.number,
    avgRating:            PropTypes.number,
    successRate:          PropTypes.number,
  }).isRequired,
};
