import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatters';
import { ACTIVITY_TYPE_META } from '@/utils/mockOperations';

/** Activity Intelligence stream — recent platform events with type badges. */
export default function ActivityFeed({ items, limit }) {
  const list = limit ? items.slice(0, limit) : items;

  return (
    <div className="space-y-2">
      {list.map((item) => {
        const meta = ACTIVITY_TYPE_META[item.type] ?? ACTIVITY_TYPE_META.system_event;
        return (
          <div key={item.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {meta.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg truncate">{item.description}</p>
              <p className="text-xs text-fg-muted truncate">{item.actor}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant={meta.variant} label={meta.label} />
              <span className="text-xs text-fg-muted">{timeAgo(item.timestamp)} ago</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

ActivityFeed.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    actor: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
  })).isRequired,
  limit: PropTypes.number,
};
