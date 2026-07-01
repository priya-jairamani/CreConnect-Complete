import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';
import { formatFollowers, formatEngagement } from '@/utils/formatters';

export default function CreatorCard({ creator, onSave, onView, onSendOffer, onMessage }) {
  const score = creator.matchScore ?? Math.round(60 + Math.random() * 35);

  return (
    <div
      className="card card-hover rounded-2xl p-5 flex flex-col gap-4"
      style={{ cursor: 'default' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={creator.avatarUrl}
            initials={creator.avatarInitials ?? creator.displayName?.slice(0, 2).toUpperCase()}
            color={creator.avatarColor}
            size="lg"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-fg truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                {creator.displayName}
              </h3>
              {creator.isVerified && (
                <span className="text-brand-400 text-xs flex-shrink-0">✦</span>
              )}
            </div>
            <p className="text-fg-muted text-xs truncate mt-0.5">{creator.niche}</p>
            {creator.username && (
              <p className="text-fg-muted text-xs">{creator.username}</p>
            )}
          </div>
        </div>
        <ScoreRing value={score} size={48} strokeWidth={5} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'var(--surface-2)' }}>
          <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            {formatFollowers(creator.followerCount)}
          </p>
          <p className="text-fg-muted text-[10px] uppercase tracking-wide">Followers</p>
        </div>
        <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'var(--surface-2)' }}>
          <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            {formatEngagement(creator.engagementRate)}
          </p>
          <p className="text-fg-muted text-[10px] uppercase tracking-wide">Engagement</p>
        </div>
      </div>

      {/* Authenticity badge */}
      {creator.authenticityScore !== undefined && (
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={creator.authenticityScore >= 80 ? 'success' : 'warning'}
            label={`${creator.authenticityScore}% authentic`}
          />
        </div>
      )}

      {/* Why matched */}
      {creator.whyMatched && (
        <div
          className="rounded-xl p-3 text-xs text-fg-muted leading-relaxed"
          style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}
        >
          <span className="text-brand-400 font-medium">✦ </span>
          {creator.whyMatched}
        </div>
      )}

      {/* Actions */}
      {(onSave || onView || onSendOffer) && (
        <div className="flex gap-2 flex-wrap pt-1">
          {onSave && (
            <Button variant="ghost" size="sm" onClick={() => onSave(creator)}>
              Save
            </Button>
          )}
          {onView && (
            <Button variant="secondary" size="sm" onClick={() => onView(creator)}>
              View
            </Button>
          )}
          {onMessage && (
            <Button variant="secondary" size="sm" onClick={() => onMessage(creator)}>
              💬 Message
            </Button>
          )}
          {onSendOffer && (
            <Button variant="primary" size="sm" onClick={() => onSendOffer(creator)} className="ml-auto">
              Invite
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

CreatorCard.propTypes = {
  creator: PropTypes.shape({
    id:                PropTypes.string.isRequired,
    displayName:       PropTypes.string.isRequired,
    username:          PropTypes.string,
    niche:             PropTypes.string,
    followerCount:     PropTypes.number,
    engagementRate:    PropTypes.number,
    avatarUrl:         PropTypes.string,
    avatarInitials:    PropTypes.string,
    avatarColor:       PropTypes.string,
    isVerified:        PropTypes.bool,
    matchScore:        PropTypes.number,
    authenticityScore: PropTypes.number,
    whyMatched:        PropTypes.string,
  }).isRequired,
  onSave:      PropTypes.func,
  onView:      PropTypes.func,
  onSendOffer: PropTypes.func,
  onMessage:   PropTypes.func,
};
