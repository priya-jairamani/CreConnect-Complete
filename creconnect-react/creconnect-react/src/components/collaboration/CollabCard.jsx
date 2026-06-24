import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import ScoreRing from '@/components/common/ScoreRing';
import { formatPKR } from '@/utils/formatters';
import {
  STAGE_BADGE_VARIANT, PRIORITY_VARIANT, PAYMENT_STATUS_VARIANT,
} from '@/constants/collaborationOptions';

function deadlineLabel(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);
  const dateStr = new Date(deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
  if (days < 0) return { text: `Overdue · ${dateStr}`, danger: true };
  if (days === 0) return { text: `Due today`, danger: true };
  if (days <= 3) return { text: `Due in ${days}d · ${dateStr}`, danger: true };
  return { text: `Due ${dateStr}`, danger: false };
}

export default function CollabCard({ item, intel, onOpen, onMessage, onSubmit, draggable = false, onDragStart, onDragEnd, isDragging = false, compact = false }) {
  const stage = intel.stage;
  const deadline = deadlineLabel(item.deadline);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item); }}
      className="card rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all hover:border-brand-500/40 hover:-translate-y-0.5"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-fg text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{item.campaignTitle}</h3>
          <p className="text-fg-muted text-xs mt-0.5 truncate">{item.brandName} {item.campaignType ? `· ${item.campaignType}` : ''}</p>
        </div>
        <ScoreRing value={intel.matchScore} size={36} strokeWidth={3} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={STAGE_BADGE_VARIANT[stage] ?? 'neutral'} label={stage} />
        <Badge variant={PRIORITY_VARIANT[intel.priority] ?? 'neutral'} label={`${intel.priority} priority`} />
        <Badge variant={PAYMENT_STATUS_VARIANT[intel.paymentStatus] ?? 'neutral'} label={intel.paymentStatus} />
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-fg-muted">Progress</span>
          <span className="text-fg font-medium">{intel.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${intel.progress}%` }} />
        </div>
      </div>

      {/* Footer meta */}
      {!compact && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-400 font-semibold">{formatPKR(item.budget)}</span>
          {deadline && (
            <span className={deadline.danger ? 'text-danger font-medium' : 'text-fg-muted'}>{deadline.text}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-fg-muted truncate">👤 {intel.assignedManager}</span>
        <span className="text-fg-muted flex-shrink-0 ml-2">{intel.lastActivityHours}h ago</span>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 -mb-1">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(item); }}
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-400 border border-brand-500/30 hover:bg-brand-500/10 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMessage?.(item); }}
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-fg-muted border hover:text-fg hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--border)' }}
        >
          💬 Message
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSubmit?.(item); }}
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-fg-muted border hover:text-fg hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--border)' }}
        >
          📤 Submit
        </button>
      </div>
    </div>
  );
}

CollabCard.propTypes = {
  item:        PropTypes.object.isRequired,
  intel:       PropTypes.object.isRequired,
  onOpen:      PropTypes.func.isRequired,
  onMessage:   PropTypes.func,
  onSubmit:    PropTypes.func,
  draggable:   PropTypes.bool,
  onDragStart: PropTypes.func,
  onDragEnd:   PropTypes.func,
  isDragging:  PropTypes.bool,
  compact:     PropTypes.bool,
};
