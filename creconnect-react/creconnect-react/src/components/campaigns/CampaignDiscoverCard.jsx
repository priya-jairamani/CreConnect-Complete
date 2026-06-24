import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import ScoreRing from '@/components/common/ScoreRing';
import { formatPKR } from '@/utils/formatters';

const PLATFORM_COLORS = {
  INSTAGRAM: '#E1306C', TIKTOK: '#010101', YOUTUBE: '#FF0000',
  FACEBOOK:  '#1877F2', LINKEDIN: '#0A66C2', X: '#000000', TWITTER: '#000000',
};
const PLATFORM_ICONS = {
  INSTAGRAM: '◎', TIKTOK: '♪', YOUTUBE: '▶', FACEBOOK: 'f',
  LINKEDIN: 'in', X: '𝕏', TWITTER: '𝕏',
};

const OBJECTIVE_META = {
  AWARENESS:   { label: 'Brand Awareness', color: '#6d5cff' },
  ENGAGEMENT:  { label: 'Engagement',      color: '#22c1ff' },
  CONVERSIONS: { label: 'Sales',           color: '#16b364' },
  LAUNCH:      { label: 'Product Launch',  color: '#f59e0b' },
};

const DELIVERABLE_ICONS = {
  reels: '🎬', posts: '🖼️', stories: '⚡', videos: '🎥', livestreams: '🔴',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - Date.now()) / 86_400_000);
  return diff;
}

function DeadlineChip({ deadline }) {
  const days = daysUntil(deadline);
  if (days == null) return null;
  const urgent = days <= 7;
  const gone   = days < 0;
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{
        background: gone    ? 'rgba(240,68,95,0.12)'  :
                    urgent  ? 'rgba(245,166,35,0.12)' :
                              'var(--surface-2)',
        color: gone    ? 'var(--danger)'  :
               urgent  ? 'var(--warning)' :
                         'var(--fg-muted)',
        border: `1px solid ${gone ? 'rgba(240,68,95,0.2)' : urgent ? 'rgba(245,166,35,0.2)' : 'var(--border)'}`,
      }}
    >
      {gone ? '⌛ Expired' : urgent ? `⚡ ${days}d left` : `📅 ${days}d left`}
    </span>
  );
}
DeadlineChip.propTypes = { deadline: PropTypes.string };

export default function CampaignDiscoverCard({ campaign, onView, onApply, isApplied, isSaved, onToggleSave }) {
  const [applying, setApplying] = useState(false);

  const brand     = campaign.brand ?? {};
  const brandName = brand.companyName ?? 'Brand';
  const obj       = OBJECTIVE_META[campaign.objective] ?? OBJECTIVE_META.AWARENESS;
  const platforms = campaign.platforms ?? [];
  const deliverables = {
    reels:       campaign.reels       ?? 0,
    posts:       campaign.posts       ?? 0,
    stories:     campaign.stories     ?? 0,
    videos:      campaign.videos      ?? 0,
    livestreams: campaign.livestreams ?? 0,
  };
  const delivList = Object.entries(deliverables).filter(([, v]) => v > 0);

  const budgetStr = (() => {
    if (campaign.budgetMin != null && campaign.budgetMax != null) {
      if (campaign.budgetMin === campaign.budgetMax) return formatPKR(campaign.budgetMin);
      return `${formatPKR(campaign.budgetMin)} – ${formatPKR(campaign.budgetMax)}`;
    }
    return formatPKR(campaign.budgetPKR ?? 0);
  })();

  async function handleApply(e) {
    e.stopPropagation();
    setApplying(true);
    try { await onApply?.(campaign); } finally { setApplying(false); }
  }

  return (
    <div
      className="card card-hover rounded-2xl p-5 flex flex-col gap-3.5 cursor-pointer group transition-shadow hover:shadow-[0_4px_28px_rgba(109,92,255,0.14)]"
      onClick={() => onView?.(campaign)}
    >
      {/* ── Header: Brand + Score ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={brand.logoUrl}
            initials={brandName.slice(0, 2).toUpperCase()}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-fg-muted text-xs truncate">{brandName}</p>
            {brand.isVerified && (
              <span className="text-[10px] text-success font-semibold">✓ Verified</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Save / bookmark */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleSave?.(campaign); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-white/8"
            title={isSaved ? 'Remove from saved' : 'Save campaign'}
            style={{ color: isSaved ? '#f59e0b' : 'var(--fg-muted)' }}
          >
            {isSaved ? '★' : '☆'}
          </button>
          {campaign.matchScore != null && (
            <ScoreRing value={campaign.matchScore} size={44} strokeWidth={4} />
          )}
        </div>
      </div>

      {/* ── Campaign title ── */}
      <h3 className="font-semibold text-fg text-sm leading-snug line-clamp-2" style={{ fontFamily: 'Sora, sans-serif' }}>
        {campaign.title}
      </h3>

      {/* ── Objective + Niche ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${obj.color}18`, color: obj.color }}
        >
          {obj.label}
        </span>
        {campaign.niche && <Badge variant="neutral" label={campaign.niche} />}
        {campaign.budgetType && campaign.budgetType !== 'FIXED' && (
          <Badge variant="brand" label={campaign.budgetType === 'MILESTONE' ? 'Milestone' : 'Performance'} />
        )}
      </div>

      {/* ── Platforms ── */}
      {platforms.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {platforms.map((p) => (
            <span
              key={p}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: PLATFORM_COLORS[p] ?? '#9aa1b6' }}
              title={p}
            >
              {PLATFORM_ICONS[p] ?? p[0]}
            </span>
          ))}
          {platforms.length > 3 && (
            <span className="text-[10px] text-fg-muted">+{platforms.length - 3}</span>
          )}
        </div>
      )}

      {/* ── Budget ── */}
      <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-[10px] text-fg-muted uppercase tracking-widest">Budget</p>
          <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{budgetStr}</p>
        </div>
        {delivList.length > 0 && (
          <div className="flex items-center gap-1">
            {delivList.slice(0, 4).map(([key, count]) => (
              <span key={key} className="text-xs text-fg-muted" title={`${count} ${key}`}>
                {DELIVERABLE_ICONS[key]}<span className="text-[10px] ml-0.5">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Requirements row ── */}
      {(campaign.followerMin || campaign.engagementMin) && (
        <div className="flex items-center gap-2 flex-wrap">
          {campaign.followerMin > 0 && (
            <span className="text-[10px] text-fg-muted flex items-center gap-1">
              ◎ {campaign.followerMin >= 1000 ? `${(campaign.followerMin / 1000).toFixed(0)}K+` : campaign.followerMin} followers
            </span>
          )}
          {campaign.engagementMin > 0 && (
            <span className="text-[10px] text-fg-muted flex items-center gap-1">
              ◉ {campaign.engagementMin}%+ engagement
            </span>
          )}
        </div>
      )}

      {/* ── Footer: Deadline + Actions ── */}
      <div className="flex items-center justify-between gap-2 pt-0.5 border-t" style={{ borderColor: 'var(--border)' }}>
        <DeadlineChip deadline={campaign.deadline} />
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="xs" onClick={(e) => { e.stopPropagation(); onView?.(campaign); }}>
            Details
          </Button>
          {isApplied ? (
            <span className="text-[11px] text-success font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(22,179,100,0.1)' }}>
              ✓ Applied
            </span>
          ) : (
            <Button
              variant="primary"
              size="xs"
              isLoading={applying}
              onClick={handleApply}
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

CampaignDiscoverCard.propTypes = {
  campaign:      PropTypes.object.isRequired,
  onView:        PropTypes.func,
  onApply:       PropTypes.func,
  isApplied:     PropTypes.bool,
  isSaved:       PropTypes.bool,
  onToggleSave:  PropTypes.func,
};
