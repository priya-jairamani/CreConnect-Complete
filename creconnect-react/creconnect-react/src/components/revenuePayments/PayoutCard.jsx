import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { formatCompactPKR } from '@/utils/formatters';

const STATUS_VARIANT = { Active: 'success', 'Under Review': 'warning', Suspended: 'danger' };

/** Creator payout summary card — earnings split between paid and pending amounts. */
export default function PayoutCard({ creator, onClick }) {
  const total = creator.paidAmount + creator.pendingAmount;
  const paidPct = total ? Math.round((creator.paidAmount / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onClick?.(creator)}
      className="card card-hover rounded-2xl p-4 text-left w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar initials={creator.initials} color={creator.color} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg truncate">{creator.name}</p>
          <p className="text-xs text-fg-muted truncate">{creator.campaigns} campaigns · Tax {creator.taxStatus}</p>
        </div>
        <Badge variant={STATUS_VARIANT[creator.status] ?? 'neutral'} label={creator.status} />
      </div>

      <p className="text-lg font-bold text-fg mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{formatCompactPKR(creator.totalEarnings)}</p>

      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-fg-muted">Paid {formatCompactPKR(creator.paidAmount)}</span>
        <span className="text-fg-muted">Pending {formatCompactPKR(creator.pendingAmount)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${paidPct}%`, transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </button>
  );
}

PayoutCard.propTypes = {
  creator: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};
