import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';

const SCORES = [
  { key: 'trustScore', label: 'Trust Score', description: 'Overall reliability as perceived by creators' },
  { key: 'satisfactionScore', label: 'Creator Satisfaction', description: 'Average satisfaction rating from past collaborations' },
  { key: 'paymentReliability', label: 'Payment Reliability', description: 'On-time payments and escrow completion rate' },
  { key: 'campaignSuccessScore', label: 'Campaign Success Score', description: 'Share of campaigns meeting their goals' },
];

export default function ReputationSection({ scores }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {SCORES.map((s) => (
        <div key={s.key} className="card rounded-2xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)' }}>
          <ScoreRing value={scores[s.key] ?? 0} size={64} strokeWidth={6} />
          <p className="text-fg font-medium text-sm">{s.label}</p>
          <p className="text-fg-muted text-xs">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

ReputationSection.propTypes = {
  scores: PropTypes.object.isRequired,
};
