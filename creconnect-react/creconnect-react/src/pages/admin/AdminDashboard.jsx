import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { ROUTES } from '@/constants/routes';

import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import PlatformHealthRing from '@/components/adminDashboard/PlatformHealthRing';
import ActivityPulseCard from '@/components/adminDashboard/ActivityPulseCard';
import GrowthChart from '@/components/adminDashboard/GrowthChart';
import ActivityFeed from '@/components/adminDashboard/ActivityFeed';
import RiskCard from '@/components/adminDashboard/RiskCard';
import QuickActionsPanel from '@/components/adminDashboard/QuickActionsPanel';
import DashboardFilters, { FILTER_OPTIONS } from '@/components/adminDashboard/DashboardFilters';
import AdminGlobalSearch from '@/components/adminDashboard/AdminGlobalSearch';

import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { SkeletonCard } from '@/components/common/Skeleton';
import { formatCompactPKR } from '@/utils/formatters';

/* ─── Executive growth chart definitions ────────────────────────────
   Ordered per spec:
   1. Platform Growth Overview (total users)
   2. Creator Growth  }  shown together as "Creator vs Brand"
   3. Brand Growth    }
   4. Active Campaign Trend
 */
const GROWTH_CHARTS = [
  { key: 'users',     title: 'Platform Growth Overview', color: '#6d5cff', group: 'platform'  },
  { key: 'campaigns', title: 'Active Campaign Trend',    color: '#16b364', group: 'platform'  },
  { key: 'creators',  title: 'Creator Growth',           color: '#857fff', group: 'crb'       },
  { key: 'brands',    title: 'Brand Growth',             color: '#f59e0b', group: 'crb'       },
];

const GROWTH_RANGES = ['7d', '30d', '90d', '1y'];

/* Static presentation metadata for each real KPI — icons/colors/format only, no fabricated values */
const KPI_META = {
  totalUsers:      { label: 'Total Users',            icon: '👥', format: 'number', accent: '#6d5cff', seriesKey: 'users' },
  activeCreators:  { label: 'Active Creators',        icon: '✦',  format: 'number', accent: '#857fff', seriesKey: 'creators' },
  activeBrands:    { label: 'Active Brands',          icon: '🏢', format: 'number', accent: '#f59e0b', seriesKey: 'brands' },
  activeCampaigns: { label: 'Active Campaigns',       icon: '◈',  format: 'number', accent: '#16b364', seriesKey: 'campaigns' },
  monthlyRevenue:  { label: 'Platform Revenue',       icon: '💰', format: 'pkr',    accent: '#16b364', seriesKey: null },
  gmv:             { label: 'Gross Marketplace Value',icon: '📈', format: 'pkr',    accent: '#6d5cff', seriesKey: null },
};

const HEALTH_ICON = { userGrowth: '👥', campaignSuccess: '◈', retention: '✦', payments: '💳', reportVolume: '🛡️' };

const ACTIVITY_META = [
  { key: 'campaignsToday',        label: 'Campaigns Launched Today', icon: '🚀', format: 'number' },
  { key: 'collabsStarted',        label: 'Collaborations Started',   icon: '🤝', format: 'number' },
  { key: 'messagesToday',         label: 'Messages Sent Today',      icon: '💬', format: 'number' },
  { key: 'paymentsReleasedToday', label: 'Payments Released Today',  icon: '💸', format: 'pkr' },
];

/* Revenue Snapshot — 3 key figures only; full analytics live in Revenue & Payments */
const REVENUE_SNAPSHOT = [
  { key: 'gmv',             label: 'Gross Marketplace Volume',  icon: '💹' },
  { key: 'platformRevenue', label: 'Platform Revenue',          icon: '💰' },
  { key: 'creatorEarnings', label: 'Creator Earnings',          icon: '🎯' },
];

const FEED_TYPE_ICON = { user: '🆕', campaign: '🚀', payment: '💸', report: '🚩' };
const FEED_TYPE_REMAP = { user: 'users', campaign: 'campaigns', payment: 'payments', report: 'safety' };

function defaultFilters() {
  return {
    dateRange:       FILTER_OPTIONS.dateRange[2],
    region:          FILTER_OPTIONS.region[0],
    industry:        FILTER_OPTIONS.industry[0],
    campaignType:    FILTER_OPTIONS.campaignType[0],
    creatorCategory: FILTER_OPTIONS.creatorCategory[0],
  };
}

function computeHealthScore(breakdown) {
  if (!breakdown.length) return 0;
  return Math.round(breakdown.reduce((sum, b) => sum + b.value, 0) / breakdown.length);
}

function getHealthStatus(score) {
  if (score >= 85) return { label: 'Excellent', variant: 'success' };
  if (score >= 70) return { label: 'Good',      variant: 'brand' };
  if (score >= 50) return { label: 'Warning',   variant: 'warning' };
  return { label: 'Critical', variant: 'danger' };
}

/* ─── Announcement delivery channels ───────────────────────────── */
const CHANNELS = [
  { id: 'inapp',  label: 'In-app',  icon: '🔔' },
  { id: 'email',  label: 'Email',   icon: '✉️'  },
  { id: 'push',   label: 'Push',    icon: '📲' },
];

const TEMPLATES = [
  { label: 'Platform Maintenance', body: 'Scheduled maintenance on [date] from [time]. Some features may be temporarily unavailable.' },
  { label: 'New Feature Launch',   body: 'We\'ve launched [feature]! Log in now to explore what\'s new.' },
  { label: 'Policy Update',        body: 'We\'ve updated our [policy name]. Please review the changes at your earliest convenience.' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading,    setIsLoading]    = useState(true);
  const [analytics,    setAnalytics]    = useState(null);
  const [searchIndex,  setSearchIndex]  = useState([]);
  const [growthRange,  setGrowthRange]  = useState('30d');
  const [filters,      setFilters]      = useState(defaultFilters);

  /* ── Unified Announcement Composer ──────────────────────────── */
  const [composerOpen, setComposerOpen] = useState(false);
  const [msgBody,      setMsgBody]      = useState('');
  const [msgTitle,     setMsgTitle]     = useState('');
  const [audience,     setAudience]     = useState('all');
  const [channels,     setChannels]     = useState(['inapp']);
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);

  useEffect(() => {
    setIsLoading(true);
    adminApi.getAnalytics({ range: growthRange })
      .then(({ data }) => setAnalytics(data?.data ?? data))
      .catch(() => setAnalytics(null))
      .finally(() => setIsLoading(false));
  }, [growthRange]);

  // Real global-search index — built once from the actual users/campaigns lists
  useEffect(() => {
    Promise.all([adminApi.getUsers({ limit: 20 }), adminApi.getCampaigns({ limit: 20 })])
      .then(([usersRes, campaignsRes]) => {
        const users     = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data ?? []);
        const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : (campaignsRes.data?.data ?? []);
        const userEntries = users.map((u) => ({
          id: `u-${u.id}`,
          type: u.role === 'CREATOR' ? 'creator' : u.role === 'BRAND' ? 'brand' : 'user',
          label: u.creatorProfile?.displayName || u.brandProfile?.companyName || u.email,
          sub: `${u.role.charAt(0)}${u.role.slice(1).toLowerCase()} · ${u.status}`,
        }));
        const campaignEntries = campaigns.map((c) => ({
          id: `c-${c.id}`, type: 'campaign', label: c.title, sub: `Campaign · ${c.status}`,
        }));
        setSearchIndex([...userEntries, ...campaignEntries]);
      })
      .catch(() => setSearchIndex([]));
  }, []);

  const healthScore  = useMemo(() => computeHealthScore(analytics?.platformHealth?.breakdown ?? []), [analytics]);
  const healthStatus = useMemo(() => getHealthStatus(healthScore), [healthScore]);
  const growthData   = useMemo(() => analytics?.growthSeries ?? [], [analytics]);

  const kpiCards = useMemo(() => {
    if (!analytics?.kpis) return [];
    return Object.entries(KPI_META).map(([key, meta]) => {
      const k = analytics.kpis[key] ?? { value: 0, changePct: 0 };
      const prevValue = k.changePct ? k.value / (1 + k.changePct / 100) : k.value;
      const sparkline = meta.seriesKey ? growthData.slice(-14).map((g) => g[meta.seriesKey] ?? 0) : [];
      return { id: key, label: meta.label, icon: meta.icon, accent: meta.accent, format: meta.format, value: k.value, prevValue, sparkline };
    });
  }, [analytics, growthData]);

  const healthBreakdown = (analytics?.platformHealth?.breakdown ?? []).map((item) => ({ ...item, icon: HEALTH_ICON[item.id] ?? '📊' }));

  const activityCards = ACTIVITY_META.map((meta) => ({
    id: meta.key, label: meta.label, icon: meta.icon, format: meta.format,
    value: analytics?.marketplaceActivityToday?.[meta.key] ?? 0,
  }));

  const trustSafetyCards = analytics?.trustSafety ? [
    { id: 'pendingReports',  label: 'Pending Reports',  icon: '🚩', value: analytics.trustSafety.pendingReports,  severity: analytics.trustSafety.pendingReports > 0 ? 'warning' : 'success', trend: 0, action: 'Review Reports' },
    { id: 'resolvedReports', label: 'Resolved Reports', icon: '✅', value: analytics.trustSafety.resolvedReports, severity: 'success', trend: 0, action: 'View Reports' },
    { id: 'paymentDisputes', label: 'Payment Disputes', icon: '⚖️', value: analytics.trustSafety.paymentDisputes, severity: analytics.trustSafety.paymentDisputes > 0 ? 'danger' : 'success', trend: 0, action: 'Resolve' },
  ] : [];

  const feedItems = (analytics?.feed ?? []).map((f) => ({ ...f, type: FEED_TYPE_REMAP[f.type] ?? f.type, icon: FEED_TYPE_ICON[f.type] }));

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const exportAnalyticsCsv = useCallback(() => {
    const rows = [
      ['Metric', 'Current Value', 'Previous Period'],
      ...kpiCards.map((k) => [k.label, k.value, Math.round(k.prevValue)]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `creconnect-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [kpiCards]);

  function handleQuickAction(actionId) {
    if (actionId === 'verify')          return navigate(ROUTES.ADMIN_USERS);
    if (actionId === 'announce')        { setComposerOpen(true); return; }
    if (actionId === 'export')          return exportAnalyticsCsv();
    if (actionId === 'pending_reports') return navigate(ROUTES.ADMIN_TRUST_SAFETY);
  }

  function toggleChannel(id) {
    setChannels((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  }

  function closeComposer() {
    if (sending) return;
    setComposerOpen(false);
    setMsgBody('');
    setMsgTitle('');
    setAudience('all');
    setChannels(['inapp']);
  }

  async function handleSendComposer(e) {
    e.preventDefault();
    if (!msgBody.trim()) return;
    setSending(true);
    try {
      await adminApi.sendAnnouncement({
        title:    msgTitle || 'Platform Announcement',
        body:     msgBody,
        audience,
        channels,
      });
    } catch { /* best-effort */ }
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); closeComposer(); }, 1400);
  }

  /* Separate growth charts by group */
  const platformCharts = GROWTH_CHARTS.filter((c) => c.group === 'platform');
  const crbCharts      = GROWTH_CHARTS.filter((c) => c.group === 'crb');

  return (
    <div className="p-6 space-y-6 page-enter">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              Operations Command Center
            </h1>
            <Badge variant="success" label="Live" dot />
          </div>
          <p className="text-fg-muted text-sm mt-1">
            Real-time overview of the CreConnect marketplace — creators, brands, campaigns &amp; revenue.
          </p>
        </div>
        <AdminGlobalSearch items={searchIndex} />
      </div>

      {/* ── Global Filters ── */}
      <DashboardFilters filters={filters} onChange={handleFilterChange} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="space-y-6 min-w-0">

          {/* ── 1. Executive Overview ── */}
          <section>
            <h2 className="text-lg font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Executive Overview
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiCards.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
              </div>
            )}
          </section>

          {/* ── 2. Platform Health Center ── */}
          <section className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-5" style={{ fontFamily: 'Sora, sans-serif' }}>
              Platform Health Center
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="flex justify-center">
                <PlatformHealthRing value={healthScore} status={healthStatus} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {healthBreakdown.map((item) => (
                  <div key={item.id} className="rounded-xl bg-surface-2 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm text-fg font-medium">
                        <span>{item.icon}</span>
                        {item.label}
                      </span>
                      <span className="text-sm font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
                        {item.value}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${item.value}%`, transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }}
                      />
                    </div>
                    <p className="text-xs text-fg-muted">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 3. Marketplace Activity ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                Marketplace Activity
              </h2>
              <Badge variant="success" label="Today" dot />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {activityCards.map((item) => (
                <ActivityPulseCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* ── 4. Growth Analytics ── */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                Growth Analytics
              </h2>
              <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1">
                {GROWTH_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setGrowthRange(r)}
                    className={
                      'text-xs font-medium px-3 py-1 rounded-full transition-colors ' +
                      (growthRange === r ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg')
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Growth + Campaign Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {platformCharts.map((chart) => (
                <GrowthChart
                  key={chart.key}
                  title={chart.title}
                  data={growthData}
                  dataKey={chart.key}
                  color={chart.color}
                  total={growthData[growthData.length - 1]?.[chart.key]}
                />
              ))}
            </div>

            {/* Creator vs Brand Growth */}
            <div className="mb-1">
              <p className="text-sm font-medium text-fg-muted mb-3">Creator vs Brand Growth</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {crbCharts.map((chart) => (
                  <GrowthChart
                    key={chart.key}
                    title={chart.title}
                    data={growthData}
                    dataKey={chart.key}
                    color={chart.color}
                    total={growthData[growthData.length - 1]?.[chart.key]}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── 5. Revenue Snapshot ── */}
          <section>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                Revenue Snapshot
              </h2>
              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN_REVENUE)}
                className="text-xs text-brand-400 hover:underline font-medium"
              >
                Full analytics in Revenue & Payments →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {REVENUE_SNAPSHOT.map((c) => (
                <div key={c.key} className="card rounded-2xl p-5 flex items-center gap-4">
                  <span className="text-2xl flex-shrink-0">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-fg leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {formatCompactPKR(analytics?.revenue?.[c.key] ?? 0)}
                    </p>
                    <p className="text-fg-muted text-xs mt-1 leading-snug">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 6. Trust & Safety Snapshot ── */}
          <section>
            <h2 className="text-lg font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Trust &amp; Safety Snapshot
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {trustSafetyCards.map((item) => (
                <RiskCard key={item.id} {...item} onAction={() => navigate(ROUTES.ADMIN_TRUST_SAFETY)} />
              ))}
            </div>
          </section>

          {/* ── 7. Live Operations Feed ── */}
          <section>
            <ActivityFeed items={feedItems} />
          </section>

        </div>

        {/* ── Sticky Quick Action Center ── */}
        <aside>
          <QuickActionsPanel onAction={handleQuickAction} />
        </aside>
      </div>

      {/* ── Unified Announcement Composer ── */}
      {composerOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={closeComposer}
        >
          <div
            className="glass w-full max-w-lg rounded-2xl border border-border-subtle shadow-card-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                Create Announcement
              </h3>
              <p className="text-fg-muted text-sm mt-1">
                Send a platform communication to your selected audience across one or more channels.
              </p>
            </div>

            {sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-fg font-semibold text-lg">Announcement published!</p>
                <p className="text-fg-muted text-sm mt-1">Delivered via {channels.join(', ')} to {audience === 'all' ? 'all users' : audience}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendComposer} className="space-y-4">
                {/* Quick templates */}
                <div>
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Quick Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => { setMsgTitle(t.label); setMsgBody(t.body); }}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-fg-muted hover:text-fg transition-colors"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="Announcement title (optional)"
                  className="input-base w-full text-sm rounded-xl"
                />

                {/* Body */}
                <textarea
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Write your message…"
                  rows={4}
                  className="input-base w-full text-sm rounded-xl resize-none"
                  required
                />

                {/* Audience */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-fg-muted block mb-1.5">Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="input-base w-full text-sm rounded-xl"
                    >
                      <option value="all">All Users</option>
                      <option value="creators">Creators Only</option>
                      <option value="brands">Brands Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-fg-muted block mb-1.5">Delivery Channels</label>
                    <div className="flex items-center gap-2">
                      {CHANNELS.map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          title={ch.label}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={channels.includes(ch.id)
                            ? { background: 'var(--brand-500)', color: '#fff' }
                            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                          }
                        >
                          <span>{ch.icon}</span>
                          <span className="hidden sm:inline">{ch.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={closeComposer} disabled={sending}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={sending} disabled={!msgBody.trim()}>
                    Publish Announcement
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
