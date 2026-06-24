import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { INVITATION_STAGES, INVITATION_STAGE_VARIANT } from '@/constants/outreachOptions';
import { getRecruitmentFunnel } from '@/utils/mockOutreachIntel';

/* ----------------------------------------------------------------------- */
/* Invitation Tracker — pipeline board across invitation stages            */
/* ----------------------------------------------------------------------- */

export function InvitationTracker({ invitations }) {
  const columns = useMemo(() => {
    const map = Object.fromEntries(INVITATION_STAGES.map((s) => [s, []]));
    invitations.forEach(({ creator, stage }) => {
      (map[stage] ?? map.Draft).push(creator);
    });
    return map;
  }, [invitations]);

  if (!invitations.length) {
    return (
      <div className="card rounded-2xl p-5">
        <h3 className="font-semibold text-fg text-sm mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>📬 Invitation Tracker</h3>
        <p className="text-fg-muted text-xs">Shortlist creators to start tracking your outreach pipeline.</p>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>📬 Invitation Tracker</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {INVITATION_STAGES.map((stage) => (
          <div key={stage} className="rounded-xl p-2.5 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-1">
              <Badge variant={INVITATION_STAGE_VARIANT[stage] ?? 'neutral'} label={stage} />
              <span className="text-fg-muted text-[10px] font-semibold">{columns[stage].length}</span>
            </div>
            <div className="flex flex-col gap-1.5 min-h-[1px]">
              {columns[stage].map((creator) => {
                const id = creator.id ?? creator.userId;
                return (
                  <div key={id} className="flex items-center gap-1.5">
                    <Avatar src={creator.avatarUrl} initials={creator.displayName?.slice(0, 2)?.toUpperCase()} size="xs" />
                    <span className="text-fg-muted text-[10px] truncate">{creator.displayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

InvitationTracker.propTypes = {
  invitations: PropTypes.arrayOf(PropTypes.shape({
    creator: PropTypes.object.isRequired,
    stage: PropTypes.string.isRequired,
  })).isRequired,
};

/* ----------------------------------------------------------------------- */
/* Creator Recruitment Funnel                                               */
/* ----------------------------------------------------------------------- */

export function RecruitmentFunnel({ creators }) {
  const funnel = useMemo(() => getRecruitmentFunnel(creators), [creators]);
  const max = Math.max(1, ...funnel.map((f) => f.count));

  if (!creators.length) {
    return (
      <div className="card rounded-2xl p-5">
        <h3 className="font-semibold text-fg text-sm mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>🪜 Creator Recruitment Funnel</h3>
        <p className="text-fg-muted text-xs">Shortlist creators to see your recruitment funnel.</p>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>🪜 Creator Recruitment Funnel</h3>
      <div className="space-y-2">
        {funnel.map(({ stage, count }) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="text-fg-muted text-xs w-24 flex-shrink-0">{stage}</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(4, (count / max) * 100)}%`, background: 'linear-gradient(90deg, #6d5cff, #16b364)' }}
              />
            </div>
            <span className="text-fg text-xs font-semibold w-6 text-right flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

RecruitmentFunnel.propTypes = {
  creators: PropTypes.arrayOf(PropTypes.object).isRequired,
};
