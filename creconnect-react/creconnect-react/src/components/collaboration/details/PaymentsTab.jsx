import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { formatPKR } from '@/utils/formatters';
import { PAYMENT_STATUS_VARIANT } from '@/constants/collaborationOptions';

export default function PaymentsTab({ payment, intel }) {
  const { budget, paid, pending, escrow, expectedPayout, milestones } = payment;
  const paidPct = budget ? Math.round((paid / budget) * 100) : 0;
  const escrowPct = budget ? Math.round((escrow / budget) * 100) : 0;
  const pendingPct = Math.max(0, 100 - paidPct - escrowPct);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(budget)}</p>
          <p className="text-fg-muted text-[10px] mt-1">Campaign Budget</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-success font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(paid)}</p>
          <p className="text-fg-muted text-[10px] mt-1">Paid Amount</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-warning font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(escrow)}</p>
          <p className="text-fg-muted text-[10px] mt-1">Escrow Balance</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(pending)}</p>
          <p className="text-fg-muted text-[10px] mt-1">Pending Amount</p>
        </div>
      </div>

      {/* Allocation bar */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Payment Status</h4>
          <Badge variant={PAYMENT_STATUS_VARIANT[intel.paymentStatus] ?? 'neutral'} label={intel.paymentStatus} />
        </div>
        <div className="h-3 rounded-full overflow-hidden flex" style={{ background: 'var(--surface)' }}>
          {paidPct > 0 && <div className="h-full bg-success" style={{ width: `${paidPct}%` }} title="Paid" />}
          {escrowPct > 0 && <div className="h-full bg-warning" style={{ width: `${escrowPct}%` }} title="Escrow" />}
          {pendingPct > 0 && <div className="h-full" style={{ width: `${pendingPct}%`, background: 'var(--border)' }} title="Pending" />}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Paid ({paidPct}%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Escrow ({escrowPct}%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border)' }} /> Pending ({pendingPct}%)</span>
        </div>
        <p className="text-fg-muted text-xs mt-3">
          Expected payout: <span className="text-fg font-medium">{formatPKR(escrow + pending)}</span> on{' '}
          <span className="text-fg font-medium">{new Date(expectedPayout).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </p>
      </div>

      {/* Milestones */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <h4 className="text-fg font-semibold text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Milestone Payments</h4>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-fg text-sm font-medium">{m.label}</p>
                <p className="text-fg-muted text-xs mt-0.5">{new Date(m.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-fg font-semibold text-sm">{formatPKR(m.amount)}</p>
                <Badge variant={PAYMENT_STATUS_VARIANT[m.status] ?? 'neutral'} label={m.status} className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

PaymentsTab.propTypes = {
  payment: PropTypes.object.isRequired,
  intel: PropTypes.object.isRequired,
};
