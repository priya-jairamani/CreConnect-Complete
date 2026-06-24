import PropTypes from 'prop-types';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';

const STATUS_VARIANT = {
  COMPLETED: 'success',
  ACTIVE: 'brand',
  CANCELLED: 'danger',
  DISPUTED: 'warning',
};

const MILESTONE_THRESHOLDS = [1, 5, 10, 25, 50];

export default function WorkHistoryPanel({ profile, metrics, collaborations, scorecard }) {
  const events = [];

  if (profile?.createdAt) {
    events.push({
      id: 'joined',
      date: profile.createdAt,
      icon: '🚀',
      title: 'Joined CreConnect as a Creator',
      meta: null,
    });
  }

  collaborations.forEach((c) => {
    events.push({
      id: c.id,
      date: c.createdAt,
      icon: '🤝',
      title: `Collaboration with ${c.brand?.companyName ?? 'a brand'}`,
      meta: c.campaign?.title,
      status: c.status,
    });
  });

  const completed = metrics?.completedCollabs ?? collaborations.filter((c) => c.status === 'COMPLETED').length;
  MILESTONE_THRESHOLDS.forEach((n) => {
    if (completed >= n) {
      events.push({
        id: `milestone-${n}`,
        date: null,
        icon: '🏅',
        title: `Achievement: ${n} completed collaboration${n > 1 ? 's' : ''}`,
        meta: null,
      });
    }
  });

  const creatorScore = scorecard?.metrics?.creatorScore ?? 0;
  if (creatorScore >= 80) {
    events.push({
      id: 'score-milestone',
      date: null,
      icon: '⭐',
      title: `Achievement: Creator Score reached ${creatorScore}`,
      meta: null,
    });
  }

  const dated = events.filter((e) => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));
  const undated = events.filter((e) => !e.date);
  const ordered = [...dated, ...undated];

  if (!ordered.length) {
    return <EmptyState icon="🗂" title="No work history yet" message="Campaigns, collaborations, and achievements will appear here as a timeline." />;
  }

  return (
    <ol className="relative space-y-5 ml-3 border-l" style={{ borderColor: 'var(--border)' }}>
      {ordered.map((e) => (
        <li key={e.id} className="ml-5 relative">
          <span
            className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px]"
            style={{ background: 'var(--brand-500)', borderColor: 'var(--surface)' }}
          />
          <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="text-lg flex-shrink-0">{e.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-fg text-sm font-semibold">{e.title}</p>
                {e.status && <Badge variant={STATUS_VARIANT[e.status] ?? 'neutral'} label={e.status} />}
              </div>
              {e.meta && <p className="text-fg-muted text-xs mt-0.5">{e.meta}</p>}
              {e.date && (
                <p className="text-fg-muted text-xs mt-0.5">
                  {new Date(e.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

WorkHistoryPanel.propTypes = {
  profile: PropTypes.object,
  metrics: PropTypes.object,
  collaborations: PropTypes.array.isRequired,
  scorecard: PropTypes.object,
};
