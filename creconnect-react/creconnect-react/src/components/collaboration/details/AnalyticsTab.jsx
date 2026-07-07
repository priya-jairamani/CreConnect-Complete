import PropTypes from 'prop-types';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

const TYPE_LABELS = {
  REEL: 'Reel', POST: 'Post', STORY: 'Story', VIDEO: 'Video', LIVESTREAM: 'Livestream',
};

export default function AnalyticsTab({ analytics, isLoading }) {
  if (isLoading) {
    return <div className="grid sm:grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  }

  if (!analytics) {
    return (
      <EmptyState
        icon="📊"
        title="No analytics yet"
        message="Deliverable progress will appear once work begins on this collaboration."
      />
    );
  }

  const tiles = [
    { label: 'Required deliverables', value: analytics.totalRequired ?? 0, icon: '🎯' },
    { label: 'Submitted', value: analytics.submitted ?? 0, icon: '📤' },
    { label: 'Approved', value: analytics.approved ?? 0, icon: '✅' },
    { label: 'Completion', value: `${analytics.completionPct ?? 0}%`, icon: '📈' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="text-xl">{t.icon}</span>
            <p className="text-2xl font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{t.value}</p>
            <p className="text-fg-muted text-[10px] mt-0.5">{t.label}</p>
          </div>
        ))}
      </div>

      {(analytics.pendingReview > 0 || analytics.revisionsRequested > 0) && (
        <div className="rounded-xl p-4 text-sm space-y-1" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
          {analytics.pendingReview > 0 && <p className="text-warning">{analytics.pendingReview} awaiting brand review</p>}
          {analytics.revisionsRequested > 0 && <p className="text-fg-muted">{analytics.revisionsRequested} revision(s) requested</p>}
        </div>
      )}

      {Array.isArray(analytics.byType) && analytics.byType.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
            Deliverables by type
          </div>
          {analytics.byType.map((row) => (
            <div key={row.type} className="grid grid-cols-4 px-4 py-3 text-sm items-center" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-fg font-medium">{TYPE_LABELS[row.type] || row.type}</span>
              <span className="text-fg-muted text-center">Req: {row.required}</span>
              <span className="text-fg-muted text-center">Sub: {row.submitted}</span>
              <span className="text-success text-center font-semibold">✓ {row.approved}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

AnalyticsTab.propTypes = {
  analytics: PropTypes.object,
  isLoading: PropTypes.bool,
};
