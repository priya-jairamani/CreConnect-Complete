import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatters';

const STATUS_VARIANT = {
  'Open': 'danger',
  'Under Investigation': 'warning',
  'Resolved': 'success',
};

const TYPE_ICON = {
  'Payment Dispute': '💳',
  'Contract Dispute': '📄',
  'Policy Violation': '⚠️',
};

/** Dispute case card used in the Dispute Center. */
export default function DisputeCard({ dispute, onAction }) {
  return (
    <div className="card rounded-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">
        {TYPE_ICON[dispute.type] ?? '📋'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-fg">{dispute.campaign}</p>
          <Badge variant={STATUS_VARIANT[dispute.status] ?? 'neutral'} label={dispute.status} />
        </div>
        <p className="text-xs text-fg-muted mt-1">{dispute.type} · {dispute.party}</p>
        <p className="text-xs text-fg-muted mt-1.5 leading-snug">{dispute.summary}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-fg-muted">Opened {timeAgo(dispute.opened)} ago · {dispute.id}</span>
          {onAction && dispute.status !== 'Resolved' && (
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
    campaign: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    party: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    opened: PropTypes.string.isRequired,
  }).isRequired,
  onAction: PropTypes.func,
};
