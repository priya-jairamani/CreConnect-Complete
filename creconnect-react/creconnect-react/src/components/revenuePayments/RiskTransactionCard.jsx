import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { formatPKR, timeAgo } from '@/utils/formatters';
import { RISK_LEVEL_META, TRANSACTION_STATUS_META } from '@/utils/mockRevenuePayments';

/** Compact card surfacing a high-risk transaction for AI risk detection panels. */
export default function RiskTransactionCard({ transaction, onClick }) {
  const risk = RISK_LEVEL_META[transaction.riskLevel] ?? RISK_LEVEL_META.low;
  const status = TRANSACTION_STATUS_META[transaction.status] ?? TRANSACTION_STATUS_META.pending;

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className="card card-hover rounded-2xl p-4 text-left w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-fg">{transaction.id}</span>
        <Badge variant={risk.variant} label={risk.label} />
      </div>
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <Avatar initials={transaction.creatorInitials} color={transaction.creatorColor} size="xs" />
        <p className="text-xs text-fg-muted truncate flex-1">{transaction.campaign}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(transaction.amount)}</span>
        <Badge variant={status.variant} label={status.label} />
      </div>
      <p className="text-xs text-fg-muted mt-2">Risk score {transaction.riskScore}/100 · {timeAgo(transaction.date)} ago</p>
    </button>
  );
}

RiskTransactionCard.propTypes = {
  transaction: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};
