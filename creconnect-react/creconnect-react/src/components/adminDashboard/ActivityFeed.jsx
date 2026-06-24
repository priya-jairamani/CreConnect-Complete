import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import EmptyState from '@/components/common/EmptyState';
import { timeAgo } from '@/utils/formatters';

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'users',     label: 'Users' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'payments',  label: 'Payments' },
  { id: 'safety',    label: 'Safety' },
];

/** Live operations activity feed with category filters. */
export default function ActivityFeed({ items }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  );

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Live Operations Feed</h3>
        <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                'text-xs font-medium px-3 py-1 rounded-full transition-colors ' +
                (filter === f.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="No activity" message="There's nothing in this category yet." />
      ) : (
        <div className="max-h-96 overflow-y-auto pr-1 space-y-1">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-0">
              <div className="w-8 h-8 rounded-lg bg-brand-500/12 flex items-center justify-center text-sm flex-shrink-0">
                {item.icon}
              </div>
              <p className="text-sm text-fg flex-1 min-w-0 truncate">{item.text}</p>
              <span className="text-xs text-fg-muted whitespace-nowrap">{timeAgo(item.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ActivityFeed.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      icon: PropTypes.node,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ).isRequired,
};
