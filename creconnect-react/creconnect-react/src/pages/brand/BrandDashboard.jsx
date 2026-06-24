import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import StatCard from '@/components/common/StatCard';
import Avatar from '@/components/common/Avatar';
import ScoreRing from '@/components/common/ScoreRing';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { analyticsApi } from '@/api/analytics.api';
import { matchingApi } from '@/api/matching.api';
import { formatFollowers, formatEngagement } from '@/utils/formatters';

function Sparkline({ data = [], color = '#6d5cff' }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 200;
    const y = 40 - ((v - min) / range) * 36;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 200 44" className="w-full" style={{ height: 44 }}>
      <defs>
        <linearGradient id={`sf-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,44 ${pts} 200,44`} fill={`url(#sf-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [analytics,    setAnalytics]    = useState(null);
  const [recommended,  setRecommended]  = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getBrand().catch(() => null),
      matchingApi.getRecommended().catch(() => ({ data: [] })),
    ]).then(([analyticsRes, matchRes]) => {
      setAnalytics(analyticsRes?.data ?? null);
      setRecommended((matchRes?.data || []).slice(0, 4));
      setIsLoading(false);
    });
  }, []);

  const m = analytics?.metrics ?? {};

  const STATS = [
    { value: m.totalCampaigns       != null ? <AnimatedCounter value={m.totalCampaigns} />       : '—', label: 'Total Campaigns',       icon: '◈', trend: null },
    { value: m.activeCollaborations != null ? <AnimatedCounter value={m.activeCollaborations} /> : '—', label: 'Active Collaborations', icon: '◉', trend: null },
    { value: m.pendingOffers        != null ? <AnimatedCounter value={m.pendingOffers} />         : '—', label: 'Pending Offers',        icon: '✦', trend: null },
    { value: m.messagesWaiting      != null ? <AnimatedCounter value={m.messagesWaiting} />       : '—', label: 'Messages Waiting',      icon: '◎', trend: null },
  ];

  const spendSeries  = analytics?.spendSeries?.map((p) => p.amount)  ?? [];
  const reachSeries  = analytics?.reachSeries?.map((p) => p.value ?? p.amount) ?? [];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Welcome back 👋
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">Here's how your campaigns are performing.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.BRAND_REMINDERS)} icon="🔔">
          Reminders
        </Button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : STATS.map((s) => <StatCard key={s.label} value={s.value} label={s.label} icon={s.icon} trend={s.trend} />)
        }
      </section>

      {/* Charts */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Revenue</h3>
              <p className="text-fg-muted text-xs">Spend over time</p>
            </div>
            <Badge variant="success" label="Live" />
          </div>
          <div className="text-2xl font-bold text-fg mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            Rs <AnimatedCounter value={m.totalSpend ?? 0} />
          </div>
          <Sparkline data={spendSeries} />
        </div>

        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Audience Reach</h3>
              <p className="text-fg-muted text-xs">Estimated reach</p>
            </div>
            <Badge variant="brand" label="Growing" />
          </div>
          <div className="text-2xl font-bold text-fg mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            <AnimatedCounter value={m.totalReach ?? 0} format={formatFollowers} />
          </div>
          <Sparkline data={reachSeries} color="#f59e0b" />
        </div>
      </section>

      {/* Recommended Creators */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Recommended Creators
          </h2>
          <button onClick={() => navigate(ROUTES.BRAND_SEARCH)} className="text-sm text-brand-400 hover:underline">
            View all →
          </button>
        </div>

        <div className="card rounded-2xl overflow-hidden">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 m-2 rounded-xl" />)
            : recommended.length === 0
              ? (
                <EmptyState
                  icon="✦"
                  title="No recommended creators yet"
                  message="Run a search or publish a campaign so our AI matching can start surfacing creators for you."
                  action={<Button variant="primary" size="sm" onClick={() => navigate(ROUTES.BRAND_SEARCH)}>Discover creators</Button>}
                />
              )
              : recommended.map((item, idx) => {
                  const creator = item.creator ?? item;
                  return (
                    <div
                      key={creator.id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                      style={idx < recommended.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
                    >
                      <Avatar
                        initials={(creator.displayName || creator.username || '?').slice(0, 2).toUpperCase()}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-fg text-sm truncate">{creator.displayName}</h3>
                          {creator.isVerified && <span className="text-brand-400 text-xs">✦</span>}
                        </div>
                        <p className="text-fg-muted text-xs truncate">{creator.niche}</p>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <p className="text-fg font-semibold text-xs">
                          {formatFollowers(creator.socialPlatforms?.[0]?.followerCount ?? 0)}
                        </p>
                        <p className="text-fg-muted text-[10px]">followers</p>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <p className="text-fg font-semibold text-xs">
                          {formatEngagement(creator.socialPlatforms?.[0]?.engagementRate ?? 0)}
                        </p>
                        <p className="text-fg-muted text-[10px]">engagement</p>
                      </div>
                      <ScoreRing value={item.score ?? 70} size={40} strokeWidth={4} />
                      <Button variant="primary" size="xs" onClick={() => navigate(ROUTES.BRAND_COLLAB_REQUEST)}>
                        Connect
                      </Button>
                    </div>
                  );
                })
          }
        </div>
      </section>
    </div>
  );
}
