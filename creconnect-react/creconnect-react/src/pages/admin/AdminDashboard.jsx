import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { ROUTES } from '@/constants/routes';

import KPIStatCard from '@/components/adminDashboard/KPIStatCard';
import PlatformHealthRing from '@/components/adminDashboard/PlatformHealthRing';
import ActivityPulseCard from '@/components/adminDashboard/ActivityPulseCard';
import GrowthChart from '@/components/adminDashboard/GrowthChart';
import InsightCard from '@/components/adminDashboard/InsightCard';
import ActivityFeed from '@/components/adminDashboard/ActivityFeed';
import RiskCard from '@/components/adminDashboard/RiskCard';
import QuickActionsPanel from '@/components/adminDashboard/QuickActionsPanel';
import DashboardFilters from '@/components/adminDashboard/DashboardFilters';
import AdminGlobalSearch from '@/components/adminDashboard/AdminGlobalSearch';

import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { SkeletonCard } from '@/components/common/Skeleton';
import { formatCompactPKR } from '@/utils/formatters';

import {
  EXECUTIVE_KPIS,
  PLATFORM_HEALTH,
  getHealthStatus,
  computeHealthScore,
  MARKETPLACE_ACTIVITY,
  GROWTH_RANGES,
  getGrowthSeries,
  REVENUE_SUMMARY,
  TRUST_SAFETY,
  AI_INSIGHTS,
  getLiveFeed,
  FILTER_OPTIONS,
} from '@/utils/mockAdminDashboard';

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

/* Revenue Snapshot — 3 key figures only; full analytics live in Revenue & Payments */
const REVENUE_SNAPSHOT = [
  { key: 'gmv',             label: 'Gross Marketplace Volume',  icon: '💹' },
  { key: 'platformRevenue', label: 'Platform Revenue',          icon: '💰' },
  { key: 'creatorEarnings', label: 'Creator Earnings',          icon: '🎯' },
];

function defaultFilters() {
  return {
    dateRange:       FILTER_OPTIONS.dateRange[2],
    region:          FILTER_OPTIONS.region[0],
    industry:        FILTER_OPTIONS.industry[0],
    campaignType:    FILTER_OPTIONS.campaignType[0],
    creatorCategory: FILTER_OPTIONS.creatorCategory[0],
  };
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
    adminApi.getAnalytics().catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const healthScore  = useMemo(() => computeHealthScore(PLATFORM_HEALTH.breakdown), []);
  const healthStatus = useMemo(() => getHealthStatus(healthScore), [healthScore]);
  const growthData   = useMemo(() => getGrowthSeries(growthRange), [growthRange]);
  const liveFeed     = useMemo(() => getLiveFeed(24), []);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleQuickAction(actionId) {
    if (actionId === 'verify')          return navigate(ROUTES.ADMIN_USERS);
    if (actionId === 'announce')        { setComposerOpen(true); return; }
    if (actionId === 'export')          return exportAnalyticsCsv();
    if (actionId === 'pending_reports') return navigate(ROUTES.ADMIN_TRUST_SAFETY);
  }

  function exportAnalyticsCsv() {
    const rows = [
      ['Metric', 'Current Value', 'Previous Period'],
      ...EXECUTIVE_KPIS.map((k) => [k.label, k.value, k.prevValue]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `creconnect-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
    } catch { /* offline demo */ }
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
        <AdminGlobalSearch />
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
                {EXECUTIVE_KPIS.map((kpi) => <KPIStatCard key={kpi.id} kpi={kpi} />)}
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
                {PLATFORM_HEALTH.breakdown.map((item) => (
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
              <Badge variant="success" label="Updated just now" dot />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {MARKETPLACE_ACTIVITY.map((item) => (
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
                      {formatCompactPKR(REVENUE_SUMMARY[c.key])}
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {TRUST_SAFETY.map((item) => (
                <RiskCard key={item.id} {...item} onAction={() => navigate(ROUTES.ADMIN_TRUST_SAFETY)} />
              ))}
            </div>
          </section>

          {/* ── 7. AI Insights Center ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                AI Insights Center
              </h2>
              <Badge variant="brand" label="Beta" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AI_INSIGHTS.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>

          {/* ── 8. Live Operations Feed ── */}
          <section>
            <ActivityFeed items={liveFeed} />
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
