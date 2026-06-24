import PropTypes from 'prop-types';
import { formatCompactPKR, formatPKR } from '@/utils/formatters';

const SEGMENTS = [
  { key: 'spent', label: 'Spent', color: 'var(--brand-500)' },
  { key: 'escrow', label: 'In Escrow', color: 'var(--warning)' },
  { key: 'remaining', label: 'Remaining', color: 'var(--success)' },
];

/** Visual budget allocation tracker — spent / escrow / remaining bar + financial breakdown. */
export default function BudgetTracker({ budget, spent, escrow, remaining, creatorPayments, pendingPayments, refunds }) {
  const free = Math.max(0, remaining - escrow);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-fg-muted">Total Budget</span>
          <span className="text-lg font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>{formatPKR(budget)}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-surface-2">
          <div style={{ width: `${(spent / budget) * 100}%`, background: SEGMENTS[0].color }} />
          <div style={{ width: `${(escrow / budget) * 100}%`, background: SEGMENTS[1].color }} />
          <div style={{ width: `${(free / budget) * 100}%`, background: SEGMENTS[2].color }} />
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {SEGMENTS.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Spent', value: spent },
          { label: 'Remaining', value: remaining },
          { label: 'In Escrow', value: escrow },
          { label: 'Creator Payments', value: creatorPayments },
          { label: 'Pending Payments', value: pendingPayments },
          { label: 'Refunds', value: refunds },
        ].map((item) => (
          <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
            <p className="text-xs text-fg-muted">{item.label}</p>
            <p className="text-sm font-semibold text-fg mt-1">{formatCompactPKR(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

BudgetTracker.propTypes = {
  budget: PropTypes.number.isRequired,
  spent: PropTypes.number.isRequired,
  escrow: PropTypes.number.isRequired,
  remaining: PropTypes.number.isRequired,
  creatorPayments: PropTypes.number.isRequired,
  pendingPayments: PropTypes.number.isRequired,
  refunds: PropTypes.number.isRequired,
};
