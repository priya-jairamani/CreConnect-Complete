import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';

export default function BrandHealthScoreSection({ health }) {
  const items = [
    { key: 'overall', label: 'Overall Health', value: health.overall, size: 80 },
    { key: 'growth', label: 'Growth Score', value: health.growthScore },
    { key: 'reputation', label: 'Reputation Score', value: health.reputationScore },
    { key: 'creatorSatisfaction', label: 'Creator Satisfaction', value: health.creatorSatisfactionScore },
    { key: 'paymentTrust', label: 'Payment Trust Score', value: health.paymentTrustScore },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <div key={item.key} className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={item.value} size={item.size ?? 64} strokeWidth={item.size ? 7 : 5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

BrandHealthScoreSection.propTypes = {
  health: PropTypes.shape({
    overall: PropTypes.number.isRequired,
    growthScore: PropTypes.number.isRequired,
    reputationScore: PropTypes.number.isRequired,
    creatorSatisfactionScore: PropTypes.number.isRequired,
    paymentTrustScore: PropTypes.number.isRequired,
  }).isRequired,
};
