import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'campaign', label: 'Campaign Changes' },
  { key: 'team', label: 'Team Changes' },
  { key: 'billing', label: 'Billing Changes' },
  { key: 'security', label: 'Security Events' },
];

function timeLabel(hoursAgo) {
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  return `${Math.floor(hoursAgo / 24)}d ago`;
}

export default function AuditLogSection({ entries }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              filter === f.key
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative pl-6 space-y-4">
        <div className="absolute left-[9px] top-2 bottom-2 w-px" style={{ background: 'var(--border)' }} />
        {filtered.map((e) => (
          <div key={e.id} className="relative">
            <span
              className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px]"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              {e.icon}
            </span>
            <p className="text-sm text-fg">
              <span className="font-medium">{e.actor}</span> {e.text}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="neutral" label={e.type} />
              <span className="text-fg-muted text-xs">{timeLabel(e.hoursAgo)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-fg-muted text-sm">No activity for this filter.</p>}
      </div>
    </div>
  );
}

AuditLogSection.propTypes = {
  entries: PropTypes.array.isRequired,
};
