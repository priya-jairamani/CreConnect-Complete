import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import ScoreRing from '@/components/common/ScoreRing';

const STATIC_BADGES = [
  { key: 'verified', icon: '✓', label: 'Verified Brand' },
  { key: 'topEmployer', icon: '🏆', label: 'Top Employer' },
];

export default function TrustReputationSection({ brand, intel, payment }) {
  const badges = [
    ...(brand.isVerified ? [STATIC_BADGES[0]] : []),
    ...(intel.badges ?? []),
    ...(payment.badges ?? []),
    ...(intel.satisfactionScore >= 85 ? [STATIC_BADGES[1]] : []),
  ];

  const retentionRate = Math.round(
    intel.totalCreatorsHired > 0
      ? (intel.repeatCollaborations / intel.totalCreatorsHired) * 100
      : 0
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={intel.trustScore ?? 0} size={64} strokeWidth={5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Brand Trust Score</p>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={payment.completionRate ?? 0} size={64} strokeWidth={5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Payment Reliability</p>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={intel.responseRate ?? 0} size={64} strokeWidth={5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Response Rate</p>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={intel.campaignSuccessRate ?? 0} size={64} strokeWidth={5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Campaign Completion Rate</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg-muted text-sm">Average Response Time</p>
          <p className="text-fg text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{intel.avgResponseTimeHours}h</p>
        </div>
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg-muted text-sm">Creator Retention Rate</p>
          <p className="text-fg text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{retentionRate}%</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <Badge key={b.key} variant={b.variant ?? 'brand'} label={`${b.icon} ${b.label}`} />
          ))}
        </div>
      )}
    </div>
  );
}

TrustReputationSection.propTypes = {
  brand: PropTypes.object.isRequired,
  intel: PropTypes.object.isRequired,
  payment: PropTypes.object.isRequired,
};
