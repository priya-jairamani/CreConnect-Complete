import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import StatCard from '@/components/common/StatCard';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import ProfileHeader from '@/components/portfolio/ProfileHeader';
import PlatformGrid from '@/components/portfolio/PlatformGrid';
import MediaGallery from '@/components/portfolio/MediaGallery';
import CollabTimeline from '@/components/portfolio/CollabTimeline';
import ReviewsPanel from '@/components/portfolio/ReviewsPanel';
import { creatorsApi } from '@/api/creators.api';
import { formatFollowers, formatEngagement } from '@/utils/formatters';
import { getScores, getPlatformStats, seededRandom } from '@/utils/mockAnalytics';
import { getPlatformMeta } from '@/components/common/PlatformIcon';

/* ─── Platform-specific follower section ───────────────────────────── */

const PLATFORM_ORDER = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'LINKEDIN', 'X'];

function PlatformFollowerTabs({ platforms, seed }) {
  const [activePlatform, setActivePlatform] = useState(null);

  const platData = useMemo(() => {
    if (!platforms?.length) return [];
    return platforms
      .filter((p) => p.isConnected && p.followerCount > 0)
      .sort((a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform))
      .map((p) => {
        const meta  = getPlatformMeta(p.platform);
        const stats = getPlatformStats(`${seed}-${p.platform}-${p.handle}`, p.followerCount ?? 0);
        return { ...p, meta, stats };
      });
  }, [platforms, seed]);

  const selected = activePlatform
    ? platData.find((p) => p.platform === activePlatform)
    : platData[0];

  if (!platData.length) return null;

  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Platform Followers
        </h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {platData.map(({ platform, meta }) => {
            const Icon = meta.Icon;
            const active = (activePlatform ?? platData[0]?.platform) === platform;
            return (
              <button
                key={platform}
                onClick={() => setActivePlatform(platform)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={active
                  ? { background: 'var(--brand-500)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                }
              >
                <Icon size={13} color={active ? '#fff' : meta.color} />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
              {formatFollowers(selected.followerCount)}
            </p>
            <p className="text-fg-muted text-xs mt-0.5">Followers</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
              {formatEngagement((selected.engagementRate ?? 0) / (selected.engagementRate > 1 ? 100 : 1))}
            </p>
            <p className="text-fg-muted text-xs mt-0.5">Engagement</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
              {formatFollowers(selected.stats.avgViews)}
            </p>
            <p className="text-fg-muted text-xs mt-0.5">Avg. Views</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: 'Sora, sans-serif',
                color: selected.stats.growth >= 0 ? '#16b364' : '#f0445f',
              }}
            >
              {selected.stats.growth >= 0 ? '▲' : '▼'} {Math.abs(selected.stats.growth)}%
            </p>
            <p className="text-fg-muted text-xs mt-0.5">Growth</p>
          </div>
        </div>
      )}

      {/* All platforms quick summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {platData.map(({ platform, followerCount, meta }) => {
          const Icon = meta.Icon;
          return (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors hover:bg-white/5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <Icon size={16} color={meta.color} />
              <span className="text-fg text-xs font-medium flex-1 truncate">{meta.label}</span>
              <span className="text-fg font-bold text-xs flex-shrink-0">{formatFollowers(followerCount)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function CreatorProfile() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const username      = params.get('username');

  const [profile,    setProfile]    = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const isOwnProfile = !username;

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (username) {
      creatorsApi.getPublicProfile(username)
        .then(({ data }) => setProfile(data))
        .catch((err) => setError(err?.response?.data?.message || err?.message || 'Could not load profile'))
        .finally(() => setIsLoading(false));
      return;
    }

    Promise.all([
      creatorsApi.getProfile(),
      creatorsApi.getCollaborations({ limit: 5 }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([profileRes, collabRes]) => {
        setProfile({
          ...profileRes.data,
          collaborations: collabRes.data?.data ?? [],
          reviews: [],
        });
      })
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Could not load profile'))
      .finally(() => setIsLoading(false));
  }, [username]);

  const seed = profile?.username ?? profile?.id ?? 'creator';

  const scores = useMemo(() => getScores(seed), [seed]);

  const aggregate = useMemo(() => {
    const platforms = profile?.platforms ?? [];
    const totalFollowers = platforms.reduce((sum, p) => sum + (p.followerCount ?? 0), 0)
      || profile?.metrics?.totalFollowers || 0;
    let totalViews = 0;
    let totalReach = 0;
    platforms.forEach((p) => {
      const stats = getPlatformStats(`${seed}-${p.platform}-${p.handle}`, p.followerCount ?? 0);
      totalViews += stats.avgViews;
      totalReach += stats.avgReach;
    });
    return { totalFollowers, totalViews, totalReach };
  }, [profile, seed]);

  const profileUrl = useMemo(() => {
    if (!profile?.username) return '';
    return `${window.location.origin}${ROUTES.CREATOR_PROFILE}?username=${profile.username}`;
  }, [profile]);

  /* ── Rand for repeat rate ── */
  const repeatRand = useMemo(() => seededRandom(`${seed}-repeat`), [seed]);
  const repeatRate = useMemo(() => Math.round(30 + repeatRand() * 40), [repeatRand]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 text-center py-20 text-fg-muted">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-medium text-fg mb-1">{error || 'Creator not found'}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const metrics   = profile.metrics    ?? {};
  const platforms = profile.platforms  ?? [];
  const collabs   = profile.collaborations ?? [];
  const reviews   = profile.reviews    ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          {isOwnProfile ? 'My Portfolio' : 'Creator Portfolio'}
        </h1>
        {isOwnProfile && (
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.CREATOR_INFO)}>
            Edit Profile
          </Button>
        )}
      </header>

      {/* Profile header card — share button is inside */}
      <ProfileHeader
        profile={profile}
        scores={scores}
        isOwnProfile={isOwnProfile}
        profileUrl={profileUrl}
        onReport={isOwnProfile ? undefined : () => navigate(`${ROUTES.CREATOR_REPORT}?userId=${profile.userId}`)}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={<AnimatedCounter value={aggregate.totalFollowers} format={formatFollowers} />}
          label="Total Followers"
          icon="◎"
        />
        <StatCard
          value={formatEngagement((metrics.avgEngagementRate ?? 0) / 100)}
          label="Avg. Engagement Rate"
          icon="◉"
        />
        <StatCard
          value={<AnimatedCounter value={aggregate.totalViews} format={formatFollowers} />}
          label="Avg. Views / Post"
          icon="▶"
        />
        <StatCard
          value={`${repeatRate}%`}
          label="Repeat Brand Rate"
          icon="♻"
        />
      </div>

      {/* Platform-specific followers with switcher */}
      {platforms.length > 0 && (
        <PlatformFollowerTabs platforms={platforms} seed={seed} />
      )}

      {/* Connected platforms detail grid */}
      <PlatformGrid platforms={platforms} seed={seed} />

      {/* Portfolio gallery */}
      {/* Media Gallery — real API, read-only for public / manage for own profile */}
      <div className="card rounded-2xl p-5">
        <h2 className="font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Portfolio Gallery</h2>
        <MediaGallery isManage={isOwnProfile} creatorId={!isOwnProfile ? profile?.userId : undefined} />
      </div>

      {/* Collaboration timeline */}
      <CollabTimeline collaborations={collabs} seed={seed} />

      {/* Reviews */}
      <ReviewsPanel reviews={reviews} seed={seed} />
    </div>
  );
}
