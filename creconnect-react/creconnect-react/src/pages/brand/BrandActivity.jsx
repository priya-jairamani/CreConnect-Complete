import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import Badge from '@/components/common/Badge';
import Skeleton from '@/components/common/Skeleton';
import { brandsApi } from '@/api/brands.api';

/* ─── Action → display metadata ──────────────────────────────────── */
const ACTION_META = {
  'campaign.published':              { label: 'Campaign Published',        icon: '◈', color: '#6d5cff', category: 'campaign',      status: 'Completed', statusVariant: 'success' },
  'campaign.draft_created':          { label: 'Draft Created',             icon: '◈', color: '#9aa1b6', category: 'campaign',      status: 'Draft',     statusVariant: 'warning' },
  'campaign.updated':                { label: 'Campaign Updated',          icon: '◈', color: '#6d5cff', category: 'campaign',      status: 'Completed', statusVariant: 'brand'   },
  'campaign.status_changed':         { label: 'Campaign Status Changed',   icon: '◈', color: '#6d5cff', category: 'campaign',      status: 'Completed', statusVariant: 'brand'   },
  'campaign.creator_invited':        { label: 'Creator Invited',           icon: '◎', color: '#22c1ff', category: 'creator',       status: 'Sent',      statusVariant: 'brand'   },
  'collaboration.application_accepted': { label: 'Application Accepted',  icon: '◉', color: '#16b364', category: 'collaboration', status: 'Accepted',  statusVariant: 'success' },
  'collaboration.application_rejected': { label: 'Application Rejected',  icon: '◉', color: '#f59e0b', category: 'collaboration', status: 'Rejected',  statusVariant: 'warning' },
  'message.conversation_started':    { label: 'Conversation Started',      icon: '💬', color: '#22c1ff', category: 'creator',      status: 'Completed', statusVariant: 'success' },
  'profile.updated':                 { label: 'Profile Updated',           icon: '⚙', color: '#9aa1b6', category: 'system',        status: 'Completed', statusVariant: 'success' },
};

const FALLBACK_META = { label: 'Activity', icon: '⚡', color: '#9aa1b6', category: 'system', status: 'Logged', statusVariant: 'brand' };

function getMeta(action) {
  return ACTION_META[action] ?? FALLBACK_META;
}

/* Map a raw audit log entry to a display row */
function toRow(entry) {
  const meta   = getMeta(entry.action);
  const m      = entry.meta ?? {};
  let desc = '';
  switch (entry.action) {
    case 'campaign.published':            desc = `Campaign "${m.title ?? 'Untitled'}" was published`; break;
    case 'campaign.draft_created':        desc = `Draft "${m.title ?? 'Untitled'}" saved`; break;
    case 'campaign.updated':              desc = `Campaign "${m.title ?? 'Untitled'}" was updated`; break;
    case 'campaign.status_changed':       desc = `Campaign "${m.title ?? 'Untitled'}" status changed to ${m.status ?? '—'}`; break;
    case 'campaign.creator_invited':      desc = `${m.creator ?? 'A creator'} invited to "${m.campaign ?? 'a campaign'}"`; break;
    case 'collaboration.application_accepted': desc = `Application from ${m.creator ?? 'a creator'} accepted for "${m.campaign ?? 'a campaign'}"`; break;
    case 'collaboration.application_rejected': desc = `Application from ${m.creator ?? 'a creator'} declined for "${m.campaign ?? 'a campaign'}"`; break;
    case 'message.conversation_started':  desc = `New conversation started with ${m.with ?? 'a creator'}`; break;
    case 'profile.updated':               desc = `Brand profile updated${m.fields?.length ? ` (${m.fields.slice(0,3).join(', ')})` : ''}`; break;
    default:                              desc = entry.action.replace(/\./g, ' ').replace(/_/g, ' ');
  }
  return {
    id:            entry.id,
    action:        entry.action,
    category:      meta.category,
    description:   desc,
    icon:          meta.icon,
    color:         meta.color,
    typeLabel:     meta.label,
    status:        meta.status,
    statusVariant: meta.statusVariant,
    date:          new Date(entry.createdAt),
    meta:          m,
  };
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function formatRelative(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Filter config ───────────────────────────────────────────────── */
const FILTER_TABS = [
  { key: 'all',           label: 'All'           },
  { key: 'campaign',      label: 'Campaigns'     },
  { key: 'creator',       label: 'Creators'      },
  { key: 'collaboration', label: 'Collabs'       },
  { key: 'system',        label: 'System'        },
];

const DATE_RANGES = ['All Time', 'Today', 'Last 7 Days', 'Last 30 Days'];

function matchDate(date, range) {
  if (range === 'All Time') return true;
  const diff = (Date.now() - date.getTime()) / 86_400_000;
  if (range === 'Today')        return diff < 1;
  if (range === 'Last 7 Days')  return diff <= 7;
  return diff <= 30;
}

/* ─── Main ────────────────────────────────────────────────────────── */
export default function BrandActivity() {
  const { accessToken } = useAuthContext();
  const [events,     setEvents]     = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [liveCount,  setLiveCount]  = useState(0); // new events since load
  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [dateRange,  setDateRange]  = useState('All Time');
  const [copied,     setCopied]     = useState(null);
  const liveRef = useRef(0);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    brandsApi.getActivity({ limit: 100 })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setEvents(list.map(toRow));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Real-time socket — listen for new activity events
  useSocket('/notifications', {
    token: accessToken,
    events: {
      'brand-activity': (entry) => {
        const row = toRow(entry);
        setEvents(prev => [row, ...prev]);
        liveRef.current += 1;
        setLiveCount(liveRef.current);
      },
    },
  });

  const filtered = useMemo(() => {
    let list = events;
    if (tab !== 'all')       list = list.filter(e => e.category === tab);
    if (search.trim())       list = list.filter(e => e.description.toLowerCase().includes(search.toLowerCase()));
    if (dateRange !== 'All Time') list = list.filter(e => matchDate(e.date, dateRange));
    return list;
  }, [events, tab, search, dateRange]);

  const counts = useMemo(() => {
    const c = {};
    events.forEach(e => { c[e.category] = (c[e.category] ?? 0) + 1; });
    return c;
  }, [events]);

  const handleExport = useCallback(() => {
    const rows = [
      ['Type', 'Description', 'Status', 'Date'].join(','),
      ...filtered.map(e => [
        e.typeLabel,
        `"${e.description.replace(/"/g, '""')}"`,
        e.status,
        e.date.toISOString(),
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `brand-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [filtered]);

  const handleCopyEvent = useCallback((id, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Activity</h1>
            {/* Live indicator */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(22,179,100,0.1)', color: '#16b364', border: '1px solid rgba(22,179,100,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Live
              {liveCount > 0 && ` · +${liveCount} new`}
            </span>
          </div>
          <p className="text-fg-muted text-sm mt-0.5">
            Real-time log of all actions — campaigns, creators, collabs, profile changes.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:text-fg disabled:opacity-40"
          style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
        >
          ↓ Export CSV
        </button>
      </header>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search activity…"
            className="input-base w-full pl-9"
          />
        </div>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="input-base" style={{ width: 'auto', minWidth: 150 }}>
          {DATE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-fg-muted text-xs">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Type tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map(t => (
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
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
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

      {/* ── List ── */}
      {isLoading ? (
        <div className="card rounded-2xl p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-2.5 w-1/2 rounded" />
              </div>
              <Skeleton className="w-16 h-6 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-2xl text-center py-16">
          <p className="text-4xl mb-3 opacity-40">⚡</p>
          <p className="font-medium text-fg mb-1">
            {events.length === 0 ? 'No activity recorded yet' : 'No events match your filters'}
          </p>
          <p className="text-sm text-fg-muted">
            {events.length === 0
              ? 'Activity is recorded automatically as you use the platform — create a campaign to get started.'
              : 'Try adjusting the filters or date range.'
            }
          </p>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          {filtered.map((event, idx) => (
            <div
              key={event.id}
              className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] group"
              style={idx > 0 ? { borderTop: '1px solid var(--border)' } : {}}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                style={{ background: `${event.color}18`, color: event.color }}
              >
                {event.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-fg text-sm leading-relaxed">{event.description}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${event.color}12`, color: event.color }}>
                    {event.typeLabel}
                  </span>
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
                  className="opacity-0 group-hover:opacity-100 text-xs transition-all px-1.5 py-1 rounded-lg"
                  style={copied === event.id
                    ? { background: 'rgba(22,179,100,0.15)', color: '#16b364', border: '1px solid rgba(22,179,100,0.3)' }
                    : { background: 'var(--surface-2)', color: 'var(--fg-muted)' }
                  }
                  title="Copy"
                >
                  {copied === event.id ? '✓' : '⎘'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
