import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useCampaignContext } from '@/context/CampaignContext';
import StatCard from '@/components/common/StatCard';
import OfferCard from '@/components/cards/OfferCard';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { analyticsApi } from '@/api/analytics.api';
import { campaignsApi } from '@/api/campaigns.api';
import { formatFollowers } from '@/utils/formatters';

function BarChart({ data = [], color = '#6d5cff' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1
              ? `linear-gradient(180deg, ${color}, ${color}88)`
              : `${color}33`,
          }}
        />
      ))}
    </div>
  );
}

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { offers, fetchOffers, withdrawApplication } = useCampaignContext();

  const handleAccept = async (offer) => {
    try {
      await campaignsApi.respondToInvitation(offer.id, 'accept');
      fetchOffers();
    } catch (err) {
      console.error('Accept failed', err);
    }
  };

  const handleDecline = async (offer) => {
    try {
      await campaignsApi.respondToInvitation(offer.id, 'reject');
      fetchOffers();
    } catch (err) {
      console.error('Decline failed', err);
    }
  };
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchOffers(),
      analyticsApi.getCreator().catch(() => null),
    ]).then(([, analyticsRes]) => {
      setAnalytics(analyticsRes?.data ?? null);
      setIsLoading(false);
    });
  }, [fetchOffers]);

  const m = analytics?.metrics ?? {};
  const platforms = analytics?.platforms ?? [];
  const primaryPlatform = platforms[0] ?? {};
  const earningsSeries = analytics?.earningsSeries?.map((p) => p.amount) ?? [];

  const STATS = [
    { value: <AnimatedCounter value={primaryPlatform.followerCount ?? 0} format={formatFollowers} />, label: 'Followers',       icon: '◎', trend: null },
    { value: <AnimatedCounter value={(primaryPlatform.engagementRate ?? 0) * 100} format={(v) => `${v.toFixed(1)}%`} />, label: 'Engagement Rate', icon: '◉', trend: null },
    { value: m.activeCollaborations != null ? <AnimatedCounter value={m.activeCollaborations} /> : '—', label: 'Active Campaigns', icon: '◈', trend: null },
    { value: <AnimatedCounter value={offers.length} />,             label: 'Pending Offers',  icon: '✦', trend: null, highlight: offers.length > 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Welcome back 👋
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">Here's what's happening with your profile.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.CREATOR_NOTIFS)} icon="🔔">
          Notifications
        </Button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : STATS.map((s) => <StatCard key={s.label} value={s.value} label={s.label} icon={s.icon} trend={s.trend} highlight={s.highlight} />)
        }
      </section>

      {/* Chart + Quick Actions */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                Earnings
              </h3>
              <p className="text-fg-muted text-xs">Monthly earnings</p>
            </div>
            <Badge variant="success" label="Live" />
          </div>
          <p className="text-2xl font-bold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Rs <AnimatedCounter value={m.totalEarnings ?? 0} />
          </p>
          <BarChart data={earningsSeries} />
        </div>

        <div className="card rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            Quick Actions
          </h3>
          {[
            { label: 'Browse brands',     to: ROUTES.CREATOR_FIND_BRANDS, icon: '◎' },
            { label: 'My collaborations', to: ROUTES.CREATOR_COLLABS,     icon: '◈' },
            { label: 'Edit profile',      to: ROUTES.CREATOR_PROFILE,     icon: '✦' },
          ].map(({ label, to, icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-fg transition-colors hover:bg-white/[0.04]"
              style={{ border: '1px solid var(--border)' }}
            >
              <span className="text-brand-400">{icon}</span>
              {label}
              <span className="ml-auto text-fg-muted">→</span>
            </button>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            New Offers & Pending
          </h2>
          {offers.length > 0 && (
            <Badge variant="brand" label={`${offers.length} offer${offers.length !== 1 ? 's' : ''}`} />
          )}
        </div>

        {offers.length === 0 ? (
          <div className="card rounded-2xl">
            <EmptyState
              icon="✦"
              title="No offers yet"
              message="Browse brands to find collaboration opportunities and start receiving offers."
              action={<Button variant="primary" size="sm" onClick={() => navigate(ROUTES.CREATOR_FIND_BRANDS)}>Browse brands</Button>}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onWithdraw={offer.status === 'INVITED'
                  ? () => handleDecline(offer)      // for invitations, "Withdraw" = decline
                  : () => withdrawApplication(offer.id) // for own applications, actually withdraw
                }
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
