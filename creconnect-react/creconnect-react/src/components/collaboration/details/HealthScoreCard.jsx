import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';
import Badge from '@/components/common/Badge';
import { HEALTH_LABEL_VARIANT } from '@/constants/collaborationOptions';

const FACTOR_LABELS = {
  communication: 'Communication',
  deadlines: 'Deadlines',
  approvals: 'Approvals',
  performance: 'Performance',
  paymentScore: 'Payment Status',
};

export default function HealthScoreCard({ intel }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-4 mb-4">
        <ScoreRing value={intel.healthScore} size={64} strokeWidth={5} />
        <div>
          <h4 className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Collaboration Health</h4>
          <Badge variant={HEALTH_LABEL_VARIANT[intel.healthLabel] ?? 'neutral'} label={intel.healthLabel} className="mt-1" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Object.entries(intel.healthFactors).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-fg-muted">{FACTOR_LABELS[key] ?? key}</span>
              <span className="text-fg font-medium">{value}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

HealthScoreCard.propTypes = {
  intel: PropTypes.object.isRequired,
};
