import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';
import AnimatedCounter from '@/components/common/AnimatedCounter';

export default function OpportunityOverview({ overview }) {
  const cards = [
    { key: 'recommendedBrands', icon: '✨', label: 'Recommended Brands', value: overview.recommendedBrands, highlight: true },
    { key: 'activeCampaigns', icon: '📣', label: 'Active Campaigns', value: overview.activeCampaigns },
    { key: 'openInvitations', icon: '✉️', label: 'Open Invitations', value: overview.openInvitations },
    { key: 'matchingNiche', icon: '🎯', label: 'Brands Matching My Niche', value: overview.matchingNiche },
    { key: 'highBudget', icon: '💰', label: 'High Budget Opportunities', value: overview.highBudget },
    { key: 'trending', icon: '🔥', label: 'Trending Brands', value: overview.trending },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => (
        <StatCard
          key={c.key}
          icon={c.icon}
          label={c.label}
          highlight={c.highlight}
          value={<AnimatedCounter value={c.value} />}
        />
      ))}
    </div>
  );
}

OpportunityOverview.propTypes = {
  overview: PropTypes.shape({
    recommendedBrands: PropTypes.number.isRequired,
    activeCampaigns:   PropTypes.number.isRequired,
    openInvitations:   PropTypes.number.isRequired,
    matchingNiche:     PropTypes.number.isRequired,
    highBudget:        PropTypes.number.isRequired,
    trending:          PropTypes.number.isRequired,
  }).isRequired,
};
