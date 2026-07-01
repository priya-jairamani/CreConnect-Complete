import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { formatFollowers } from '@/utils/formatters';

const SORTS = [
  { key: 'successful', label: 'Most Successful' },
  { key: 'recent', label: 'Most Recent' },
  { key: 'reach', label: 'Highest Reach' },
];

export default function CreatorNetworkSection({ creators }) {
  if (!creators) return null;
  const [sortKey, setSortKey] = useState('successful');

  const sorted = useMemo(() => {
    const copy = [...creators];
    if (sortKey === 'recent') return copy.sort((a, b) => a.daysAgo - b.daysAgo);
    if (sortKey === 'reach') return copy.sort((a, b) => b.reach - a.reach);
    return copy.sort((a, b) => (b.rating * b.campaignCount) - (a.rating * a.campaignCount));
  }, [creators, sortKey]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSortKey(s.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${sortKey === s.key ? 'bg-brand-500 text-white' : ''}`}
            style={sortKey === s.key ? {} : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((c) => (
          <div key={c.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Avatar initials={c.name.slice(0, 2)} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm font-semibold truncate">{c.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="brand" label={c.niche} />
                <span className="text-fg-muted text-xs">{formatFollowers(c.followers)} followers</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-fg-muted mt-1">
                <span>🗂 {c.campaignCount} campaigns</span>
                <span>📡 {formatFollowers(c.reach)} reach</span>
                <span className="text-warning font-semibold">★ {c.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

CreatorNetworkSection.propTypes = {
  creators: PropTypes.array.isRequired,
};
