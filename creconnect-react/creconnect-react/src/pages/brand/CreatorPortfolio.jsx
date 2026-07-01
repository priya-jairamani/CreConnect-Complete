import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { searchApi } from '@/api/search.api';
import { creatorsApi } from '@/api/creators.api';
import { messagesApi } from '@/api/messages.api';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { formatFollowers, formatEngagement } from '@/utils/formatters';
import { resolveMediaUrl } from '@/utils/media';
import Skeleton from '@/components/common/Skeleton';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

/* ── helpers ──────────────────────────────────────────────────────── */
const WATCHLIST_KEY = 'cc-brand-saved-creators';
function readSet() {
  try { return new Set(JSON.parse(localStorage.getItem(WATCHLIST_KEY)) ?? []); } catch { return new Set(); }
}

const PLATFORM_META = {
  INSTAGRAM: { icon: '📸', color: '#E1306C', label: 'Instagram'  },
  TIKTOK:    { icon: '🎵', color: '#010101', label: 'TikTok'     },
  YOUTUBE:   { icon: '▶️', color: '#FF0000', label: 'YouTube'    },
  TWITTER:   { icon: '🐦', color: '#1DA1F2', label: 'X/Twitter'  },
  FACEBOOK:  { icon: '👥', color: '#1877F2', label: 'Facebook'   },
  LINKEDIN:  { icon: '💼', color: '#0A66C2', label: 'LinkedIn'   },
  SNAPCHAT:  { icon: '👻', color: '#FFFC00', label: 'Snapchat'   },
};
const AVAIL_COLORS = {
  AVAILABLE:    { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.3)',  label: 'Available'     },
  BUSY:         { bg: 'rgba(234,179,8,0.12)', text: '#eab308', border: 'rgba(234,179,8,0.3)',  label: 'Busy'          },
  ON_BREAK:     { bg: 'rgba(99,102,241,0.12)',text: '#818cf8', border: 'rgba(99,102,241,0.3)', label: 'On Break'      },
  NOT_ACCEPTING:{ bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.3)',  label: 'Not Accepting' },
};

const TABS = [
  { key: 'overview',   label: 'Overview',            icon: '🏠' },
  { key: 'platforms',  label: 'Social Platforms',    icon: '📱' },
  { key: 'rates',      label: 'Collaboration Terms', icon: '🤝' },
  { key: 'content',    label: 'Portfolio',           icon: '🎬' },
];

function TagList({ items, color = 'brand' }) {
  if (!items?.length) return <span className="text-xs text-fg-muted italic">Not specified</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={color === 'brand'
            ? { background: 'rgba(109,92,255,0.1)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.2)' }
            : { background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }
          }
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--fg-muted)' }}>{label}</p>
        <p className="text-sm text-fg break-words">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function CreatorPortfolio() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const location       = useLocation();
  const toast          = useToast();

  const creatorId = searchParams.get('creatorId');

  // Prefer data passed via navigation state (already loaded), fall back to API
  const [creator,   setCreator]   = useState(location.state?.creator ?? null);
  const [loading,   setLoading]   = useState(!creator);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedIds,  setSavedIds]  = useState(readSet);
  const [msgLoading,setMsgLoading]= useState(false);
  const [media,     setMedia]     = useState([]);
  const [mediaLoading,setMediaLoading] = useState(false);

  useEffect(() => {
    if (creator || !creatorId) { setLoading(false); return; }
    searchApi.creators({ creatorId })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (list.length) setCreator(list[0]);
        else toast.error('Creator profile not found');
      })
      .catch(() => toast.error('Could not load creator profile'))
      .finally(() => setLoading(false));
  }, [creatorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch public media when Portfolio tab is opened
  useEffect(() => {
    if (activeTab !== 'content' || !creator?.id || media.length > 0) return;
    setMediaLoading(true);
    creatorsApi.getPublicMedia(creator.id)
      .then(({ data }) => setMedia(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => {})
      .finally(() => setMediaLoading(false));
  }, [activeTab, creator?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSave = useCallback(() => {
    if (!creator) return;
    const id = creator.userId || creator.id;
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info(`Removed ${creator.displayName} from saved`); }
      else               { next.add(id);   toast.success(`${creator.displayName} saved`); }
      try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  }, [creator, toast]);

  const handleMessage = useCallback(async () => {
    if (!creator) return;
    const uid = creator.userId;
    if (!uid) { toast.error('Cannot start conversation — creator not found.'); return; }
    setMsgLoading(true);
    try {
      const { data } = await messagesApi.createConversation(uid);
      const conv = data?.data ?? data;
      if (conv?.id) {
        navigate(ROUTES.BRAND_MESSAGES, { state: { openConversationId: conv.id, conversation: conv } });
      } else {
        navigate(`${ROUTES.BRAND_MESSAGES}?userId=${uid}`);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not start conversation.');
    } finally { setMsgLoading(false); }
  }, [creator, navigate, toast]);

  const handleInvite = useCallback(() => {
    if (!creator) return;
    navigate(`${ROUTES.BRAND_COLLAB_REQUEST}?creatorId=${creator.userId || creator.id}`);
  }, [creator, navigate]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-2xl md:col-span-2" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center space-y-3">
        <span className="text-5xl">😕</span>
        <p className="text-lg font-semibold text-fg">Creator not found</p>
        <p className="text-sm text-fg-muted">This profile may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate(ROUTES.BRAND_SEARCH)}
          className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)' }}
        >
          ← Back to Search
        </button>
      </div>
    );
  }

  const isSaved     = savedIds.has(creator.userId || creator.id);
  const avail       = AVAIL_COLORS[creator.availabilityStatus] ?? AVAIL_COLORS.AVAILABLE;
  const score       = creator.matchScore ?? null;
  const platforms   = Array.isArray(creator.platforms) ? creator.platforms : [];
  const niches      = [creator.niche, ...(creator.niches ?? [])].filter(Boolean).filter((v,i,a) => a.indexOf(v) === i);
  const totalFollowers = platforms.reduce((s, p) => s + (p.followerCount || 0), 0) || creator.followerCount || 0;

  const initials = creator.displayName?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
      >
        ← Back
      </button>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <div className="card rounded-2xl">
        {/* Banner */}
        <div
          className="h-40 rounded-t-2xl overflow-hidden relative"
          style={creator.bannerUrl
            ? { backgroundImage: `url(${resolveMediaUrl(creator.bannerUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, rgba(109,92,255,0.4), rgba(76,45,209,0.6))' }
          }
        >
          {/* Availability badge top-right */}
          <div className="absolute top-3 right-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: avail.bg, color: avail.text, border: `1px solid ${avail.border}` }}
            >
              ● {avail.label}
            </span>
          </div>
        </div>

        {/* Profile row */}
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between gap-4 -mt-14 flex-wrap">
            {/* Avatar */}
            <div
              className="w-28 h-28 rounded-full ring-4 flex-shrink-0 overflow-hidden"
              style={{ '--tw-ring-color': 'var(--surface)', background: creator.avatarColor || 'linear-gradient(135deg,#6d5cff,#4c2dd1)' }}
            >
              {creator.avatarUrl
                ? <img src={resolveMediaUrl(creator.avatarUrl)} alt={creator.displayName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">{initials}</div>
              }
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <button
                onClick={toggleSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={isSaved
                  ? { background: 'rgba(109,92,255,0.15)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.35)' }
                  : { background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }
                }
              >
                {isSaved ? '★ Saved' : '☆ Save'}
              </button>
              <button
                onClick={handleMessage}
                disabled={msgLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              >
                {msgLoading ? '…' : '💬 Message'}
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', boxShadow: '0 4px 14px rgba(109,92,255,0.35)' }}
              >
                ✦ Invite to Campaign
              </button>
            </div>
          </div>

          {/* Name + meta */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                {creator.displayName}
              </h1>
              {creator.isVerified && (
                <span className="text-brand-400 text-base" title="Verified">✦</span>
              )}
              {score !== null && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff' }}
                >
                  ✦ {score}/100 match
                </span>
              )}
            </div>

            {creator.headline && (
              <p className="text-sm text-fg-muted">{creator.headline}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs text-fg-muted">
              {creator.username && <span>@{creator.username}</span>}
              {creator.niche && (
                <>
                  {creator.username && <span>·</span>}
                  <span className="font-medium" style={{ color: 'var(--brand-400)' }}>{creator.niche}</span>
                </>
              )}
              {creator.location && <><span>·</span><span>📍 {creator.location}</span></>}
              {creator.nationality && <><span>·</span><span>🌍 {creator.nationality}</span></>}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Followers',    value: formatFollowers(totalFollowers),              icon: '👥' },
              { label: 'Engagement',   value: formatEngagement(creator.engagementRate),      icon: '💫' },
              { label: 'Authenticity', value: creator.authenticityScore != null ? `${creator.authenticityScore}%` : '—', icon: '🛡️' },
              { label: 'Platforms',    value: platforms.length || '—',                       icon: '📱' },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl px-4 py-3 text-center"
                style={{ background: 'var(--surface-2)' }}
              >
                <div className="text-lg mb-0.5">{s.icon}</div>
                <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-fg-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ TABS ══════════════════════════════════════════════════════ */}
      <div
        className="card rounded-2xl"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition-all flex-shrink-0 relative"
              style={{ color: activeTab === tab.key ? 'var(--brand-400)' : 'var(--fg-muted)' }}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: 'var(--brand-500)' }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-5">
                {/* Bio */}
                {creator.bio && (
                  <Section title="About">
                    <p className="text-sm text-fg leading-relaxed">{creator.bio}</p>
                  </Section>
                )}

                {/* Niches */}
                <Section title="Niches & Expertise">
                  <TagList items={niches} color="brand" />
                </Section>

                {/* Content formats */}
                <Section title="Content Formats">
                  <TagList items={creator.contentFormats} color="default" />
                </Section>

                {/* Content styles */}
                {creator.contentStyles?.length > 0 && (
                  <Section title="Content Style">
                    <TagList items={creator.contentStyles} color="default" />
                  </Section>
                )}
              </div>

              <div className="space-y-5">
                {/* Info panel */}
                <Section title="Creator Info">
                  <div className="-mt-2">
                    <InfoRow icon="📍" label="Location"  value={creator.location} />
                    <InfoRow icon="🌍" label="Nationality" value={creator.nationality} />
                    <InfoRow icon="🕐" label="Timezone"  value={creator.timezone} />
                    <InfoRow icon="⚧️"  label="Gender"    value={creator.gender} />
                    <InfoRow icon="📅" label="Member since" value={creator.user?.createdAt ? new Date(creator.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null} />
                  </div>
                </Section>

                {/* Links */}
                {(creator.portfolioLink?.trim() || creator.mediaKitLink?.trim()) && (
                  <Section title="Links">
                    <div className="space-y-2">
                      {creator.portfolioLink?.trim() && (
                        <a
                          href={creator.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-brand-400 hover:underline"
                        >
                          🔗 Portfolio
                        </a>
                      )}
                      {creator.mediaKitLink?.trim() && (
                        <a
                          href={creator.mediaKitLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-brand-400 hover:underline"
                        >
                          📋 Media Kit
                        </a>
                      )}
                    </div>
                  </Section>
                )}
              </div>
            </div>
          )}

          {/* ── SOCIAL PLATFORMS ── */}
          {activeTab === 'platforms' && (
            <div className="space-y-5">
              {platforms.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-3xl">📱</p>
                  <p className="text-sm text-fg-muted">No social platforms connected yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platforms.map((p, i) => {
                    const key  = (p.name ?? p.platform ?? '').toUpperCase();
                    const meta = PLATFORM_META[key] ?? { icon: '🔗', color: 'var(--brand-400)', label: key };
                    const handle      = p.handle ?? p.username;
                    const profileUrl  = p.url ?? p.profileUrl;
                    const followers   = p.followerCount ?? 0;
                    const engRate     = p.engagementRate ?? 0;
                    const postCount   = p.mediaCount ?? 0;
                    return (
                      <div
                        key={i}
                        className="rounded-2xl p-4 space-y-3"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      >
                        {/* Header row */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}40` }}
                          >
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-fg">{meta.label}</p>
                            {handle && <p className="text-xs text-fg-muted">@{handle}</p>}
                          </div>
                          {profileUrl && (
                            <a
                              href={profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all hover:scale-105"
                              style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}35` }}
                            >
                              View ↗
                            </a>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Followers',   value: followers  > 0 ? formatFollowers(followers)   : '—' },
                            { label: 'Engagement',  value: engRate    > 0 ? formatEngagement(engRate)    : '—' },
                            { label: 'Posts',       value: postCount  > 0 ? postCount.toLocaleString()   : '—' },
                          ].map(s => (
                            <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: 'var(--surface)' }}>
                              <p className="text-fg font-bold text-sm">{s.value}</p>
                              <p className="text-[10px] text-fg-muted uppercase tracking-wide">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Manual social handles from profile — click to open profile */}
              {(creator.instagram || creator.youtube || creator.tiktok || creator.linkedin || creator.x || creator.facebook) && (
                <Section title="Profile Handles">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        key: 'instagram', label: 'Instagram', meta: PLATFORM_META.INSTAGRAM,
                        buildUrl: h => `https://instagram.com/${h.replace(/^@/, '')}`,
                      },
                      {
                        key: 'youtube', label: 'YouTube', meta: PLATFORM_META.YOUTUBE,
                        buildUrl: h => `https://youtube.com/@${h.replace(/^@/, '')}`,
                      },
                      {
                        key: 'tiktok', label: 'TikTok', meta: PLATFORM_META.TIKTOK,
                        buildUrl: h => `https://tiktok.com/@${h.replace(/^@/, '')}`,
                      },
                      {
                        key: 'linkedin', label: 'LinkedIn', meta: PLATFORM_META.LINKEDIN,
                        buildUrl: h => h.startsWith('http') ? h : `https://linkedin.com/in/${h.replace(/^@/, '')}`,
                      },
                      {
                        key: 'x', label: 'X / Twitter', meta: PLATFORM_META.TWITTER,
                        buildUrl: h => `https://x.com/${h.replace(/^@/, '')}`,
                      },
                      {
                        key: 'facebook', label: 'Facebook', meta: PLATFORM_META.FACEBOOK,
                        buildUrl: h => h.startsWith('http') ? h : `https://facebook.com/${h.replace(/^@/, '')}`,
                      },
                    ].filter(s => creator[s.key]?.trim()).map(s => {
                      const handle = creator[s.key];
                      const url    = s.buildUrl(handle);
                      return (
                        <a
                          key={s.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02] group"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', textDecoration: 'none' }}
                        >
                          <span className="text-base flex-shrink-0">{s.meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-fg">{s.label}</p>
                            <p className="text-[11px] truncate" style={{ color: s.meta.color }}>
                              @{handle.replace(/^@/, '')}
                            </p>
                          </div>
                          <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            style={{ color: 'var(--fg-muted)' }}>↗</span>
                        </a>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* ── RATES ── */}
          {activeTab === 'rates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Section title="Budget Range">
                {creator.budgetMin || creator.budgetMax ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 rounded-xl px-4 py-3 text-center"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                    >
                      <p className="text-xs text-fg-muted mb-1">Min</p>
                      <p className="text-lg font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                        ${(creator.budgetMin ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-fg-muted font-bold">—</span>
                    <div
                      className="flex-1 rounded-xl px-4 py-3 text-center"
                      style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.2)' }}
                    >
                      <p className="text-xs text-fg-muted mb-1">Max</p>
                      <p className="text-lg font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                        ${(creator.budgetMax ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-fg-muted italic">Budget range not specified</p>
                )}
              </Section>

              <Section title="Collaboration Preferences">
                <div className="-mt-2">
                  <InfoRow icon="🤝" label="Style"       value={creator.collaborationStyle} />
                  <InfoRow icon="🏠" label="Work Mode"   value={creator.remoteOnsite} />
                  <InfoRow icon="✈️"  label="Travel"      value={creator.travelAvailability} />
                </div>
              </Section>

              <Section title="Preferred Campaign Types">
                <TagList items={creator.preferredCampaignTypes} color="brand" />
              </Section>

              <Section title="Preferred Industries">
                <TagList items={creator.preferredIndustries} color="default" />
              </Section>
            </div>
          )}

          {/* ── PORTFOLIO / CONTENT ── */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* External links from creator's profile — only shown when set */}
              {(creator.portfolioLink?.trim() || creator.mediaKitLink?.trim()) && (
                <div className="card rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
                    External Links
                  </p>
                  <div className="flex flex-col gap-2">
                    {creator.portfolioLink?.trim() && (
                      <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(109,92,255,0.1)' }}>🌐</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-fg">Personal Website / Portfolio</p>
                          <p className="text-xs text-fg-muted truncate">{creator.portfolioLink}</p>
                        </div>
                        <a href={creator.portfolioLink} target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                          style={{ background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.25)' }}>
                          Open ↗
                        </a>
                      </div>
                    )}
                    {creator.mediaKitLink?.trim() && (
                      <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(22,179,100,0.1)' }}>📋</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-fg">Media Kit</p>
                          <p className="text-xs text-fg-muted">Rates, audience demographics, past work</p>
                        </div>
                        <a href={creator.mediaKitLink} target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                          style={{ background: 'rgba(22,179,100,0.12)', color: '#16b364', border: '1px solid rgba(22,179,100,0.3)' }}>
                          Download ↓
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded media gallery */}
              {mediaLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : media.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-muted)' }}>
                    Portfolio — {media.length} piece{media.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {media.map((item) => (
                      <a
                        key={item.id}
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-xl overflow-hidden aspect-square block"
                        style={{ background: 'var(--surface-2)' }}
                      >
                        {item.fileType === 'video' || item.mimeType?.startsWith('video/') ? (
                          <>
                            {item.thumbnailUrl
                              ? <img src={item.thumbnailUrl} alt={item.title || 'Video'} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'var(--surface-2)' }}>🎬</div>
                            }
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                              <span className="text-white text-2xl">▶</span>
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.thumbnailUrl || item.fileUrl}
                            alt={item.title || 'Media'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        {/* Hover overlay with stats */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-2 px-2">
                          {item.title && <p className="text-white text-[11px] font-medium truncate w-full text-center mb-1">{item.title}</p>}
                          <div className="flex items-center gap-2 text-[10px] text-white/80">
                            {item.views > 0  && <span>👁 {item.views.toLocaleString()}</span>}
                            {item.likes > 0  && <span>❤ {item.likes.toLocaleString()}</span>}
                            {item.isFeatured && <span className="text-yellow-400">★</span>}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <p className="text-4xl">🎨</p>
                  <p className="text-sm font-semibold text-fg">No portfolio content yet</p>
                  <p className="text-xs text-fg-muted">
                    {creator.displayName} hasn't added any portfolio pieces yet.
                    {creator.portfolioLink && ' Check their portfolio link above.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ BOTTOM CTA ══════════════════════════════════════════════ */}
      <div
        className="card rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.08), rgba(76,45,209,0.05))', border: '1px solid rgba(109,92,255,0.2)' }}
      >
        <div>
          <p className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            Ready to collaborate with {creator.displayName}?
          </p>
          <p className="text-xs text-fg-muted mt-0.5">Send a campaign invite or start a conversation.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleMessage}
            disabled={msgLoading}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            💬 Message
          </button>
          <button
            onClick={handleInvite}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', boxShadow: '0 4px 14px rgba(109,92,255,0.35)' }}
          >
            ✦ Invite to Campaign
          </button>
        </div>
      </div>

    </div>
  );
}
