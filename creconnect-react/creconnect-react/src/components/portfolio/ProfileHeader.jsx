import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import ScoreRing from '@/components/common/ScoreRing';
import Button from '@/components/common/Button';
import ShareProfileModal from '@/components/common/ShareProfileModal';
import { resolveMediaUrl } from '@/utils/media';

const SCORE_LABELS = [
  { key: 'creatorScore',       label: 'Creator Score'  },
  { key: 'authenticityScore',  label: 'Authenticity'   },
  { key: 'responseRate',       label: 'Response Rate'  },
  { key: 'campaignSuccessRate',label: 'Success Rate'   },
];

export default function ProfileHeader({ profile, scores, onReport, isOwnProfile, profileUrl }) {
  const [shareOpen, setShareOpen] = useState(false);
  const initials = (profile.displayName || profile.username || 'CC').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="card rounded-2xl overflow-hidden">
        {/* Cover banner */}
        <div
          className="h-32 sm:h-40 relative mesh-bg"
          style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.35), rgba(76,45,209,0.25))' }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShareOpen(true)}
              >
                ↗ Share Profile
              </Button>
            )}
            {onReport && (
              <Button variant="danger" size="sm" onClick={onReport}>
                Report
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            {profile.avatarUrl ? (
              <img
                src={resolveMediaUrl(profile.avatarUrl)}
                alt={profile.displayName}
                className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border-4"
                style={{ borderColor: 'var(--surface)' }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 border-4"
                style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', borderColor: 'var(--surface)' }}
              >
                {initials}
              </div>
            )}

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {profile.displayName || profile.username}
                </h1>
                {profile.isVerified && <Badge variant="success" label="Verified" dot />}
                {profile.availability && <Badge variant="brand" label={profile.availability} />}
              </div>
              <p className="text-fg-muted text-sm mt-0.5">@{profile.username}</p>
              <div className="flex items-center gap-3 flex-wrap mt-1.5 text-fg-muted text-xs">
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.languages?.length > 0 && <span>🗣 {profile.languages.join(', ')}</span>}
                {profile.niche && <Badge variant="neutral" label={profile.niche} />}
                {profile.headline && <span className="text-fg-muted truncate max-w-xs">{profile.headline}</span>}
              </div>
            </div>

            {/* Score rings */}
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap pb-1">
              {SCORE_LABELS.map(({ key, label }) => (
                typeof scores[key] === 'number' && (
                  <div key={key} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <ScoreRing value={scores[key]} size={52} strokeWidth={5} />
                    <span className="text-fg-muted text-[10px] text-center leading-tight max-w-[64px]">{label}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {profile.bio && (
            <p className="text-fg-muted text-sm mt-4 leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          {profile.contentStyle?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {profile.contentStyle.map((tag) => (
                <Badge key={tag} variant="neutral" label={tag} />
              ))}
            </div>
          )}

          {scores.avgResponseTime && (
            <p className="text-fg-muted text-xs mt-3">
              ⚡ Typically responds within{' '}
              <span className="text-fg font-medium">{scores.avgResponseTime}</span>
            </p>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <ShareProfileModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          profileUrl={profileUrl ?? ''}
          displayName={profile.displayName || profile.username}
        />
      )}
    </>
  );
}

ProfileHeader.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    username:    PropTypes.string,
    avatarUrl:   PropTypes.string,
    isVerified:  PropTypes.bool,
    bio:         PropTypes.string,
    location:    PropTypes.string,
    niche:       PropTypes.string,
    headline:    PropTypes.string,
    availability: PropTypes.string,
    languages:   PropTypes.arrayOf(PropTypes.string),
    contentStyle: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  scores: PropTypes.shape({
    creatorScore:        PropTypes.number,
    authenticityScore:   PropTypes.number,
    responseRate:        PropTypes.number,
    campaignSuccessRate: PropTypes.number,
    avgResponseTime:     PropTypes.string,
  }).isRequired,
  onReport:      PropTypes.func,
  isOwnProfile:  PropTypes.bool,
  profileUrl:    PropTypes.string,
};
