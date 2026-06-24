import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';
import Badge from '@/components/common/Badge';

export default function PaymentReliabilitySection({ payment }) {
  return (
    <div className="space-y-4">
      {payment.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {payment.badges.map((b) => (
            <Badge key={b.key} variant={b.variant} label={`${b.icon} ${b.label}`} />
          ))}
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={payment.completionRate} size={64} strokeWidth={5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Payment Completion Rate</p>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{payment.avgPayoutDays}d</p>
          <p className="text-fg-muted text-xs">Average Payout Time</p>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{payment.disputes}</p>
          <p className="text-fg-muted text-xs">Open Disputes</p>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{payment.escrowProtected}%</p>
          <p className="text-fg-muted text-xs">Escrow-Protected Payments</p>
        </div>
      </div>
    </div>
  );
}

PaymentReliabilitySection.propTypes = {
  payment: PropTypes.shape({
    completionRate:  PropTypes.number.isRequired,
    avgPayoutDays:   PropTypes.number.isRequired,
    disputes:        PropTypes.number.isRequired,
    escrowProtected: PropTypes.number.isRequired,
    badges:          PropTypes.array,
  }).isRequired,
};
