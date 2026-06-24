import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatters';

/** Change-management audit trail — every settings change with who/when/old→new/reason, plus rollback. */
export default function AuditTimeline({ entries, onRollback }) {
  return (
    <div>
      {entries.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: 'var(--brand-500)' }} />
            {i < entries.length - 1 && (
              <span className="w-px flex-1" style={{ minHeight: 36, background: 'var(--border)' }} />
            )}
          </div>
          <div className="pb-5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium text-fg">{entry.settingLabel}</p>
              <span className="text-xs text-fg-muted whitespace-nowrap">{timeAgo(entry.timestamp)} ago</span>
            </div>
            <p className="text-xs text-fg-muted mt-0.5">{entry.sectionLabel} · Changed by <span className="text-fg">{entry.changedBy}</span></p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="danger" label={String(entry.oldValue)} />
              <span className="text-fg-muted text-xs">→</span>
              <Badge variant="success" label={String(entry.newValue)} />
            </div>
            {entry.reason && <p className="text-xs text-fg-muted mt-2 italic">&ldquo;{entry.reason}&rdquo;</p>}
            {onRollback && (
              <button
                type="button"
                onClick={() => onRollback(entry)}
                className="text-xs font-medium text-brand-400 hover:text-brand-300 mt-2 transition-colors"
              >
                Rollback to previous value
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

AuditTimeline.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    settingLabel: PropTypes.string.isRequired,
    sectionLabel: PropTypes.string.isRequired,
    changedBy: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    oldValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    newValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    reason: PropTypes.string,
  })).isRequired,
  onRollback: PropTypes.func,
};
