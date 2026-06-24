import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';
import StatCard from '@/components/common/StatCard';
import { formatFollowers } from '@/utils/formatters';

export default function HeroSection({
  brand, intel, meta, extras, totalReach,
  isOwnProfile,
  isSaved, onToggleSave, isFollowing, onToggleFollow,
  onMessage, onShare, onEditProfile,
}) {
  return (
    <div className="rounded-2xl overflow-hidden card">
      <div className="h-32 sm:h-40 relative overflow-hidden">
        {brand.bannerUrl ? (
          <img src={brand.bannerUrl} alt="Brand banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #857fff 0%, #4c2dd1 100%)' }} />
        )}
      </div>
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
        <div className="rounded-full border-4 flex-shrink-0 relative z-10" style={{ borderColor: 'var(--surface)' }}>
          <Avatar src={brand.logoUrl} initials={brand.companyName?.slice(0, 2)?.toUpperCase()} size="2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{brand.companyName}</h1>
            {brand.isVerified && <Badge variant="success" label="Verified" dot />}
          </div>
          <p className="text-fg-muted text-sm mt-0.5">{brand.industry || 'General'} · {meta.headquarters}</p>
          {extras.tagline && <p className="text-fg text-sm mt-2 italic">&ldquo;{extras.tagline}&rdquo;</p>}
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <ScoreRing value={intel.trustScore ?? 0} size={64} strokeWidth={6} />
          <p className="text-fg-muted text-[10px] mt-1">Trust Score</p>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
        {brand.description && <p className="text-fg-muted text-sm leading-relaxed max-w-3xl">{brand.description}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon="📣" value={intel.activeCampaigns ?? 0} label="Active Campaigns" />
          <StatCard icon="🗂" value={intel.completedCollaborations ?? 0} label="Total Campaigns" />
          <StatCard icon="👥" value={intel.totalCreatorsHired ?? 0} label="Creators Worked With" />
          <StatCard icon="✅" value={`${intel.campaignSuccessRate ?? 0}%`} label="Campaign Success Rate" />
          <StatCard icon="😊" value={`${intel.satisfactionScore ?? 0}%`} label="Creator Satisfaction" />
          <StatCard icon="📡" value={formatFollowers(totalReach)} label="Total Reach Generated" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isOwnProfile ? (
            <>
              <Button variant="primary" size="sm" onClick={onEditProfile}>✏️ Edit Profile</Button>
              <Button variant="ghost" size="sm" onClick={onShare}>↗ Share Profile</Button>
            </>
          ) : (
            <>
              <Button variant={isFollowing ? 'secondary' : 'outline'} size="sm" onClick={onToggleFollow}>
                {isFollowing ? '✓ Following' : '+ Follow Brand'}
              </Button>
              <Button variant={isSaved ? 'secondary' : 'outline'} size="sm" onClick={onToggleSave}>
                {isSaved ? '★ Saved' : '☆ Save Brand'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onMessage}>💬 Message Brand</Button>
              <Button variant="ghost" size="sm" onClick={onShare}>↗ Share Profile</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

HeroSection.propTypes = {
  brand: PropTypes.object.isRequired,
  intel: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  extras: PropTypes.object.isRequired,
  totalReach: PropTypes.number.isRequired,
  isOwnProfile: PropTypes.bool,
  isSaved: PropTypes.bool,
  onToggleSave: PropTypes.func.isRequired,
  isFollowing: PropTypes.bool,
  onToggleFollow: PropTypes.func.isRequired,
  onMessage: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onEditProfile: PropTypes.func,
};
