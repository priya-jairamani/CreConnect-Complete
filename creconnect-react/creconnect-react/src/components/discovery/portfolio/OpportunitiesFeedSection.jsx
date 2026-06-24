import PropTypes from 'prop-types';

function relativeTime(hours) {
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export default function OpportunitiesFeedSection({ feed }) {
  if (!feed.length) {
    return <p className="text-fg-muted text-sm">No recent activity from this brand yet.</p>;
  }

  return (
    <div className="space-y-2">
      {feed.map((item) => (
        <div key={item.id} className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <span className="text-lg flex-shrink-0">{item.type === 'campaign' ? '📣' : '📰'}</span>
          <div className="min-w-0 flex-1">
            <p className="text-fg text-sm font-medium leading-snug">{item.title}</p>
            {item.detail && <p className="text-fg-muted text-xs mt-0.5">{item.detail}</p>}
          </div>
          <span className="text-fg-muted text-xs flex-shrink-0 whitespace-nowrap">{relativeTime(item.postedHoursAgo)}</span>
        </div>
      ))}
    </div>
  );
}

OpportunitiesFeedSection.propTypes = {
  feed: PropTypes.array.isRequired,
};
