import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';
import { formatFollowers, formatEngagement, formatPKR } from '@/utils/formatters';
import { getCreatorOutreachIntel, getMatchBreakdown } from '@/utils/mockOutreachIntel';

const FIT_LABELS = [
  { key: 'audienceMatch', label: 'Audience Match' },
  { key: 'nicheFit', label: 'Niche Fit' },
  { key: 'locationFit', label: 'Location Fit' },
  { key: 'engagementFit', label: 'Engagement Fit' },
  { key: 'budgetFit', label: 'Budget Fit' },
];

export default function CreatorIntelCard({
  creator, proposal, isShortlisted, isComparing, isSelected,
  onShortlist, onCompare, onInvite, onSave, onSelect,
}) {
  const [expanded, setExpanded] = useState(false);

  const intel = useMemo(() => getCreatorOutreachIntel(creator), [creator]);
  const match = useMemo(() => getMatchBreakdown(creator, proposal), [creator, proposal]);

  const followers = creator.metrics?.totalFollowers ?? creator.followerCount ?? intel.followers;
  const engagementRate = creator.metrics?.avgEngagementRate ?? creator.engagementRate ?? intel.engagementRate;

  return (
    <div
      className="card card-hover rounded-2xl p-5 flex flex-col gap-4"
      style={{ border: isSelected ? '1px solid var(--brand-500, #6d5cff)' : '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onSelect && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => onSelect(creator)}
              className="mt-1 w-4 h-4 rounded accent-brand-500 flex-shrink-0"
              aria-label={`Select ${creator.displayName}`}
            />
          )}
          <Avatar
            src={creator.avatarUrl}
            initials={creator.displayName?.slice(0, 2)?.toUpperCase()}
            size="lg"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-fg truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                {creator.displayName}
              </h3>
              {creator.isVerified && <span className="text-brand-400 text-xs flex-shrink-0">✦</span>}
            </div>
            <p className="text-fg-muted text-xs truncate mt-0.5">{creator.niche || 'General'} · {creator.location || 'Unknown'}</p>
            {creator.username && <p className="text-fg-muted text-xs">@{creator.username}</p>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ScoreRing value={match.overall} size={48} strokeWidth={5} />
          <span className="text-fg-muted text-[10px]">Match</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat value={formatFollowers(followers)} label="Followers" />
        <Stat value={formatEngagement(engagementRate)} label="Engagement" />
        <Stat value={formatFollowers(intel.avgReach)} label="Avg Reach" />
        <Stat value={`${intel.avgCampaignROI}%`} label="Campaign Perf" />
      </div>

      {/* Score badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={intel.creatorScore >= 80 ? 'success' : intel.creatorScore >= 60 ? 'brand' : 'warning'} label={`Creator Score ${intel.creatorScore}`} />
        <Badge variant={intel.authenticityScore >= 80 ? 'success' : 'warning'} label={`${intel.authenticityScore}% authentic`} />
        <Badge variant={intel.audienceQuality >= 80 ? 'success' : 'warning'} label={`${intel.audienceQuality}% real audience`} />
        <Badge variant="neutral" label={`${formatPKR(intel.pricingMin)}–${formatPKR(intel.pricingMax)}`} />
      </div>

      {/* Why recommended */}
      <div
        className="rounded-xl p-3 text-xs text-fg-muted leading-relaxed"
        style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}
      >
        <span className="text-brand-400 font-medium">✦ </span>
        {match.why}
      </div>

      {/* Match breakdown toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-brand-400 font-medium text-left hover:underline"
      >
        {expanded ? 'Hide match breakdown ▲' : 'Show match breakdown ▼'}
      </button>

      {expanded && (
        <div className="space-y-2">
          {FIT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between text-[11px] text-fg-muted mb-1">
                <span>{label}</span>
                <span className="text-fg font-medium">{match[key]}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${match[key]}%`, background: 'linear-gradient(90deg, #6d5cff, #16b364)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-1">
        {onSave && (
          <Button variant="ghost" size="sm" onClick={() => onSave(creator)}>Save</Button>
        )}
        {onCompare && (
          <Button variant={isComparing ? 'secondary' : 'ghost'} size="sm" onClick={() => onCompare(creator)}>
            {isComparing ? '✓ Comparing' : 'Compare'}
          </Button>
        )}
        {onShortlist && (
          <Button variant={isShortlisted ? 'secondary' : 'outline'} size="sm" onClick={() => onShortlist(creator)}>
            {isShortlisted ? '✓ Shortlisted' : 'Shortlist'}
          </Button>
        )}
        {onInvite && (
          <Button variant="primary" size="sm" onClick={() => onInvite(creator)} className="ml-auto">
            Invite
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'var(--surface-2)' }}>
      <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className="text-fg-muted text-[10px] uppercase tracking-wide">{label}</p>
    </div>
  );
}

Stat.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
};

CreatorIntelCard.propTypes = {
  creator: PropTypes.object.isRequired,
  proposal: PropTypes.object,
  isShortlisted: PropTypes.bool,
  isComparing: PropTypes.bool,
  isSelected: PropTypes.bool,
  onShortlist: PropTypes.func,
  onCompare: PropTypes.func,
  onInvite: PropTypes.func,
  onSave: PropTypes.func,
  onSelect: PropTypes.func,
};

CreatorIntelCard.defaultProps = {
  proposal: {},
};
