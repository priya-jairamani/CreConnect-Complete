import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';

const LABELS = {
  creatorScore: 'Overall Creator Score',
  authenticityScore: 'Authenticity Score',
  trustScore: 'Trust Score',
  brandSafetyScore: 'Brand Safety Score',
  collaborationScore: 'Collaboration Score',
  audienceQualityScore: 'Audience Quality Score',
};

export default function ScorecardPanel({ scorecard }) {
  const { metrics, trends } = scorecard;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(LABELS).map(([key, label]) => {
        const value = metrics[key];
        const trend = trends[key];
        const isPositive = trend >= 0;
        return (
          <div
            key={key}
            className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ScoreRing value={value} size={72} strokeWidth={6} />
            <p className="text-fg text-sm font-semibold mt-1">{label}</p>
            <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(trend)} pts vs. last month
            </span>
          </div>
        );
      })}
    </div>
  );
}

ScorecardPanel.propTypes = {
  scorecard: PropTypes.shape({
    metrics: PropTypes.object.isRequired,
    trends: PropTypes.object.isRequired,
  }).isRequired,
};
