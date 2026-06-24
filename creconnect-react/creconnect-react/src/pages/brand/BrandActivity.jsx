import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/common/Badge';
import { seededRandom } from '@/utils/mockAnalytics';

/* ─── Mock activity data generator ────────────────────────────────── */

const EVENT_TYPES = [
  { type: 'campaign',      label: 'Campaign',     icon: '◈', color: '#6d5cff' },
  { type: 'creator',       label: 'Creator',      icon: '◎', color: '#22c1ff' },
  { type: 'payment',       label: 'Payment',      icon: '💳', color: '#16b364' },
  { type: 'collaboration', label: 'Collab',       icon: '◉', color: '#f59e0b' },
  { type: 'verification',  label: 'Verification', icon: '✓',  color: '#a78bfa' },
  { type: 'system',        label: 'System',       icon: '⚙',  color: '#9aa1b6' },
];

const CAMPAIGN_EVENTS = [
  'Campaign "Summer Collection 2025" was published',
  'Campaign "Eid Mega Sale" moved to Active status',
  'Campaign brief updated for "Winter Rebranding"',
  'Campaign "Ramadan Special" was paused by admin',
  'New campaign draft "Tech Product Launch" created',
  'Campaign "Fashion Week" successfully completed',
];
const CREATOR_EVENTS = [
  'Creator Laiba Khan applied to "Summer Collection 2025"',
  'Creator Ali Hassan accepted collaboration invite',
  'New creator match found: Fatima Malik (92% match)',
  'Creator Sara Ahmed submitted content for review',
  'Creator Hassan Tariq completed deliverables',
  'Creator Ayesha Raza shortlisted for 2 campaigns',
];
const PAYMENT_EVENTS = [
  'Payment of PKR 75,000 released to Laiba Khan',
  'Escrow deposit of PKR 150,000 confirmed',
  'Invoice #INV-2045 generated and sent',
  'Payment PKR 45,000 pending creator confirmation',
  'Subscription renewed — Growth Plan (PKR 12,500/mo)',
  'Refund of PKR 25,000 processed for cancelled campaign',
];
const COLLAB_EVENTS = [
  'Collaboration with Laiba Khan accepted',
  'Content milestone reviewed and approved',
  'Deliverable submitted: 2x Instagram Reels',
  'Collaboration stage advanced to "In Progress"',
  'Creator revision requested for TikTok video',
  'Collaboration "Summer Campaign" marked complete',
];
const VERIFICATION_EVENTS = [
  'Business registration document uploaded',
  'Email verification completed',
  'Phone number verified: +92 3xx xxxxxxx',
  'Domain creconnect.com/brand/yourco verified',
  'Tax ID submitted for review',
  'Payment method verified via Stripe',
];
const SYSTEM_EVENTS = [
  'Two-factor authentication enabled',
  'Password changed successfully',
  'New team member invited: billing@yourco.com',
  'Brand Safety settings updated',
  'Notification preferences updated',
  'API key generated for external integration',
];

const EVENT_POOLS = {
  campaign: CAMPAIGN_EVENTS, creator: CREATOR_EVENTS,
  payment: PAYMENT_EVENTS, collaboration: COLLAB_EVENTS,
  verification: VERIFICATION_EVENTS, system: SYSTEM_EVENTS,
};

const STATUSES = [
  { label: 'Completed', variant: 'success' },
  { label: 'Completed', variant: 'success' },
  { label: 'Completed', variant: 'success' },
  { label: 'Pending',   variant: 'warning' },
  { label: 'Reviewed',  variant: 'brand'   },
  { label: 'Failed',    variant: 'danger'  },
];

function generateActivity(seed, count = 60) {
  const rand    = seededRandom(`${seed}-activity-v1`);
  const types   = Object.keys(EVENT_POOLS);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const typeKey  = types[Math.floor(rand() * types.length)];
    const pool     = EVENT_POOLS[typeKey];
    const desc     = pool[Math.floor(rand() * pool.length)];
    const status   = STATUSES[Math.floor(rand() * STATUSES.length)];
    const daysAgo  = Math.floor(rand() * 45);
    const hoursAgo = Math.floor(rand() * 24);
    const date     = new Date(Date.now() - daysAgo * 86_400_000 - hoursAgo * 3_600_000);
    entries.push({
      id:     `act-${seed}-${i}`,
      type:   typeKey,
      description: desc,
      status: status.label,
      statusVariant: status.variant,
      date,
      user:   ['You', 'Admin', 'System'][Math.floor(rand() * 3)],
      entity: desc.match(/"([^"]+)"/)?.[1] ?? null,
    });
  }
  return entries.sort((a, b) => b.date - a.date);
}

/* ─── Formatting helpers ───────────────────────────────────────────── */

function formatRelative(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Main page ─────────────────────────────────────────────────────── */

const FILTER_TABS = [
  { key: 'all',          label: 'All Events' },
  { key: 'campaign',     label: 'Campaigns'  },
  { key: 'creator',      label: 'Creators'   },
  { key: 'payment',      label: 'Payments'   },
  { key: 'collaboration', label: 'Collabs'   },
  { key: 'verification', label: 'Verification' },
  { key: 'system',       label: 'System'     },
];

const DATE_RANGES = ['All Time', 'Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

function matchDate(date, range) {
  if (range === 'All Time') return true;
  const diff = (Date.now() - date.getTime()) / 86_400_000;
  if (range === 'Today')       return diff < 1;
  if (range === 'Last 7 Days') return diff <= 7;
  if (range === 'Last 30 Days') return diff <= 30;
  return diff <= 90;
}

export default function BrandActivity() {
  const { user }  = useAuth();
  const seed      = user?.email ?? 'brand';
  const allEvents = useMemo(() => generateActivity(seed, 60), [seed]);

  const [tab,       setTab]       = useState('all');
  const [search,    setSearch]    = useState('');
  const [dateRange, setDateRange] = useState('All Time');
  const [copied,    setCopied]    = useState(null);

  const filtered = useMemo(() => {
    let list = allEvents;
    if (tab !== 'all')    list = list.filter((e) => e.type === tab);
    if (search.trim())    list = list.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()));
    if (dateRange !== 'All Time') list = list.filter((e) => matchDate(e.date, dateRange));
    return list;
  }, [allEvents, tab, search, dateRange]);

  const handleExport = useCallback(() => {
    const rows = [
      ['Type', 'Description', 'Status', 'User', 'Date'].join(','),
      ...filtered.map((e) => [
        e.type,
        `"${e.description.replace(/"/g, '""')}"`,
        e.status,
        e.user,
        e.date.toISOString(),
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `brand-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [filtered]);

  const handleCopyEvent = useCallback((id, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  /* Aggregate counts for each tab */
  const counts = useMemo(() => {
    const c = {};
    allEvents.forEach((e) => { c[e.type] = (c[e.type] ?? 0) + 1; });
    return c;
  }, [allEvents]);

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Activity
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Complete operational history — campaigns, creators, payments, verifications, and system events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:text-fg"
            style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
          >
            ↓ Export CSV
          </button>
        </div>
      </header>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity…"
            className="input-base w-full pl-9"
          />
        </div>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-base"
          style={{ width: 'auto', minWidth: 150 }}
        >
          {DATE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <span className="text-fg-muted text-xs">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Type tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={tab === t.key
              ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
              : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {t.label}
            {t.key !== 'all' && counts[t.key] > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={tab === t.key
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: 'var(--surface)', color: 'var(--fg-muted)' }
                }
              >
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Activity list ── */}
      {filtered.length === 0 ? (
        <div className="card rounded-2xl text-center py-16">
          <p className="text-4xl mb-3 opacity-40">⚡</p>
          <p className="font-medium text-fg mb-1">No activity found</p>
          <p className="text-sm text-fg-muted">Try adjusting the filters or date range.</p>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          {filtered.map((event, idx) => {
            const typeMeta = EVENT_TYPES.find((t) => t.type === event.type);
            return (
              <div
                key={event.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] group"
                style={idx > 0 ? { borderTop: '1px solid var(--border)' } : {}}
              >
                {/* Type icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                  style={{ background: `${typeMeta?.color}18`, color: typeMeta?.color }}
                >
                  {typeMeta?.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-fg text-sm leading-relaxed">{event.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${typeMeta?.color}12`, color: typeMeta?.color }}
                    >
                      {typeMeta?.label}
                    </span>
                    <span className="text-fg-muted text-xs">{event.user}</span>
                    <span className="text-fg-muted text-xs">·</span>
                    <span className="text-fg-muted text-xs" title={event.date.toLocaleString()}>
                      {formatRelative(event.date)}
                    </span>
                  </div>
                </div>

                {/* Status + copy */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={event.statusVariant} label={event.status} />
                  <button
                    onClick={() => handleCopyEvent(event.id, event.description)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-fg-muted hover:text-fg transition-all px-1.5 py-1 rounded-lg"
                    style={{ background: 'var(--surface-2)' }}
                    title="Copy to clipboard"
                  >
                    {copied === event.id ? '✓' : '⎘'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
