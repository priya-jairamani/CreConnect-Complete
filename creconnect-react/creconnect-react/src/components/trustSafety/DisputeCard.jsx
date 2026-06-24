import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { DISPUTE_STAGE_VARIANT } from '@/utils/mockTrustSafety';
import { formatPKR, timeAgo } from '@/utils/formatters';

const TYPE_ICON = {
  'Payment Dispute': '💳',
  'Contract Dispute': '📄',
  'Deliverable Dispute': '📦',
  'Campaign Dispute': '📋',
  'Content Approval Dispute': '🖼️',
};

/** Dispute case card used in the Dispute Resolution Center. */
export default function DisputeCard({ dispute, onAction }) {
  const stageId = dispute.stage;
  const isClosed = stageId === 'resolved' || stageId === 'closed';
  return (
    <div className="card rounded-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">
        {TYPE_ICON[dispute.type] ?? '⚖️'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-fg">{dispute.creator} vs {dispute.brand}</p>
          <Badge variant={DISPUTE_STAGE_VARIANT[stageId] ?? 'neutral'} label={dispute.status} />
        </div>
        <p className="text-xs text-fg-muted mt-1">{dispute.type} · {dispute.campaign}</p>
        <p className="text-xs text-fg-muted mt-1.5 leading-snug">{dispute.reason}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-fg-muted">
            {formatPKR(dispute.amount)} · Opened {timeAgo(dispute.openedDate)} ago · {dispute.id}
          </span>
          {onAction && !isClosed && (
            <button
              type="button"
              onClick={() => onAction(dispute)}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Review →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

DisputeCard.propTypes = {
  dispute: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    campaign: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    stage: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    openedDate: PropTypes.string.isRequired,
  }).isRequired,
  onAction: PropTypes.func,
};
