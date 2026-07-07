import PropTypes from 'prop-types';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

function formatWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TimelineTab({ timeline, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    );
  }

  const events = Array.isArray(timeline) ? timeline : [];

  if (events.length === 0) {
    return (
      <EmptyState
        icon="🕒"
        title="No activity yet"
        message="Timeline events will appear as the collaboration progresses — submissions, payments, and milestones."
      />
    );
  }

  return (
    <div className="relative pl-6 space-y-0">
      <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: 'var(--border)' }} />
      {events.map((event, idx) => (
        <div key={event.id || idx} className="relative pb-5 last:pb-0">
          <div
            className="absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs z-10"
            style={{ background: 'var(--surface-2)', border: '2px solid var(--border)' }}
          >
            {event.icon || '•'}
          </div>
          <div className="rounded-xl p-4 ml-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-fg font-semibold text-sm">{event.title}</p>
                {event.description && (
                  <p className="text-fg-muted text-xs mt-1 leading-relaxed">{event.description}</p>
                )}
                {event.meta?.link && (
                  <a href={event.meta.link} target="_blank" rel="noreferrer" className="text-brand-400 text-xs underline mt-1 inline-block break-all">
                    {event.meta.link}
                  </a>
                )}
              </div>
              <span className="text-[10px] text-fg-muted whitespace-nowrap flex-shrink-0">{formatWhen(event.at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

TimelineTab.propTypes = {
  timeline:  PropTypes.array,
  isLoading: PropTypes.bool,
};
