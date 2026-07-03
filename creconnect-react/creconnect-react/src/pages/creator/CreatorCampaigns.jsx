import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { campaignsApi } from '@/api/campaigns.api';
import { creatorsApi } from '@/api/creators.api';
import { searchApi } from '@/api/search.api';
import StatCard from '@/components/common/StatCard';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatPKR, formatFollowers } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import CampaignDiscoverCard from '@/components/campaigns/CampaignDiscoverCard';
import ActiveOpportunitiesSection from '@/components/discovery/portfolio/ActiveOpportunitiesSection';
import CreatorCampaignDrawer from '@/components/campaigns/CreatorCampaignDrawer';
import { seededRandom } from '@/utils/mockAnalytics';
import { useAuth } from '@/hooks/useAuth';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

/* ─── Constants ────────────────────────────────────────────────── */

const TABS = [
  { id: 'discover',     label: 'Discover',      icon: '🔍', count: null },
  { id: 'invitations',  label: 'Invitations',   icon: '✉️', count: null },
  { id: 'applications', label: 'Applied',       icon: '📨', count: null },
  { id: 'active',       label: 'Active',        icon: '🚀', count: null },
  { id: 'completed',    label: 'Completed',     icon: '✅', count: null },
];

const NICHE_OPTS = ['All Niches', 'Fashion', 'Beauty', 'Gaming', 'Tech', 'Fitness', 'Food', 'Lifestyle', 'Travel', 'Education', 'Finance'];
const BUDGET_OPTS = [
  { label: 'Any Budget',  min: 0,       max: Infinity },
  { label: '< 25K',       min: 0,       max: 25_000   },
  { label: '25K – 75K',   min: 25_000,  max: 75_000   },
  { label: '75K – 200K',  min: 75_000,  max: 200_000  },
  { label: '200K+',       min: 200_000, max: Infinity  },
];
const PLATFORM_OPTS = ['All Platforms', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'LINKEDIN', 'X'];
const PLATFORM_LABELS = { INSTAGRAM: 'Instagram', TIKTOK: 'TikTok', YOUTUBE: 'YouTube', FACEBOOK: 'Facebook', LINKEDIN: 'LinkedIn', X: 'X (Twitter)' };
const SORT_OPTS = [
  { value: 'newest',   label: 'Newest First'     },
  { value: 'budget',   label: 'Highest Budget'   },
  { value: 'deadline', label: 'Deadline Soonest' },
  { value: 'match',    label: 'Best Match'        },
];

const SAVED_KEY = 'cc-creator-saved-campaigns';

const tooltipStyle = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--fg)' };
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

/* ─── Collaboration stage display ──────────────────────────────── */
const STAGE_META = {
  INQUIRY:     { label: 'Inquiry',      variant: 'neutral', step: 1 },
  NEGOTIATION: { label: 'Negotiation',  variant: 'warning', step: 2 },
  CONTRACTED:  { label: 'Contracted',   variant: 'brand',   step: 3 },
  IN_PROGRESS: { label: 'In Progress',  variant: 'info',    step: 4 },
  DELIVERED:   { label: 'Delivered',    variant: 'success', step: 5 },
  COMPLETED:   { label: 'Completed',    variant: 'success', step: 6 },
};

function StageProgress({ stage }) {
  const meta  = STAGE_META[stage] ?? STAGE_META.INQUIRY;
  const total = 6;
  const pct   = Math.round((meta.step / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-fg-muted">
        <span>{meta.label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / 86_400_000);
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Collaboration row (Active / Completed tabs) ─────────────── */
function CollabRow({ collab, onMessage, tab }) {
  const campaign = collab.campaign ?? {};
  const brand    = collab.brand    ?? {};
  const stage    = collab.stage    ?? 'INQUIRY';
  const days     = daysUntil(collab.endDate ?? campaign.deadline);

  return (
    <div className="card rounded-2xl p-4 space-y-3 hover:shadow-[0_2px_16px_rgba(109,92,255,0.1)] transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar src={brand.logoUrl} initials={(brand.companyName ?? 'BR').slice(0, 2)} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-fg text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
            {campaign.title || collab.campaignTitle || 'Campaign'}
          </p>
          <p className="text-fg-muted text-xs truncate">{brand.companyName}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {tab === 'active' && days != null && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: days < 7 ? 'rgba(240,68,95,0.12)' : 'rgba(245,166,35,0.12)',
                color: days < 7 ? '#f0445f' : '#f59e0b',
              }}
            >
              {days < 0 ? 'Overdue' : `${days}d left`}
            </span>
          )}
          {tab === 'completed' && (
            <Badge variant="success" label="Completed" />
          )}
        </div>
      </div>

      {tab === 'active' && <StageProgress stage={stage} />}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-fg-muted">
          <span>💰 {formatPKR(collab.offerAmountPKR ?? campaign.budgetPKR ?? 0)}</span>
          {tab === 'completed' && collab.endDate && (
            <span>📅 Ended {fmtDate(collab.endDate)}</span>
          )}
        </div>
        <Button variant="secondary" size="xs" onClick={() => onMessage(brand.userId)}>
          💬 Message
        </Button>
      </div>
    </div>
  );
}
CollabRow.propTypes = { collab: PropTypes.object, onMessage: PropTypes.func, tab: PropTypes.string };

/* ─── Application row ──────────────────────────────────────────── */
function ApplicationRow({ app, onWithdraw }) {
  const campaign = app.campaign ?? {};
  const brand    = campaign.brand ?? app.brand ?? {};
  const [withdrawing, setWithdrawing] = useState(false);

  const statusMeta = {
    PENDING:   { label: 'Pending Review', variant: 'warning' },
    INVITED:   { label: 'Invited',        variant: 'brand'   },
    ACCEPTED:  { label: 'Accepted ✓',     variant: 'success' },
    REJECTED:  { label: 'Not Selected',   variant: 'danger'  },
    WITHDRAWN: { label: 'Withdrawn',      variant: 'neutral' },
    COMPLETED: { label: 'Completed',      variant: 'success' },
  }[app.status ?? 'PENDING'] ?? { label: app.status, variant: 'neutral' };

  async function handleWithdraw() {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(true);
    try { await onWithdraw?.(app.id); } finally { setWithdrawing(false); }
  }

  return (
    <div className="card rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar src={brand.logoUrl} initials={(brand.companyName ?? 'BR').slice(0, 2)} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-fg text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
            {campaign.title ?? 'Campaign'}
          </p>
          <p className="text-fg-muted text-xs">{brand.companyName}</p>
        </div>
        <Badge variant={statusMeta.variant} label={statusMeta.label} dot />
      </div>
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>Applied {fmtDate(app.createdAt)}</span>
        {app.status === 'PENDING' && (
          <Button variant="ghost" size="xs" isLoading={withdrawing} onClick={handleWithdraw}>
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}
ApplicationRow.propTypes = { app: PropTypes.object, onWithdraw: PropTypes.func };

/* ─── Invitation card (offers from brands) ─────────────────────── */
function InvitationCard({ offer, onAccept, onDecline }) {
  const campaign = offer.campaign ?? {};
  const brand    = campaign.brand ?? {};
  const [busy,   setBusy]   = useState(false);
  const [action, setAction] = useState(null); // 'accept' | 'decline'

  const handle = async (act) => {
    setBusy(true); setAction(act);
    try { if (act === 'accept') await onAccept?.(offer); else await onDecline?.(offer); } finally { setBusy(false); }
  };

  return (
    <div className="card rounded-2xl p-5 space-y-4 border" style={{ borderColor: 'rgba(109,92,255,0.25)', background: 'rgba(109,92,255,0.03)' }}>
      <div className="flex items-start gap-3">
        <Avatar src={brand.logoUrl} initials={(brand.companyName ?? 'BR').slice(0, 2)} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            {campaign.title ?? 'Campaign Invitation'}
          </p>
          <p className="text-fg-muted text-sm">{brand.companyName}</p>
          <p className="text-fg font-semibold text-sm mt-1">{formatPKR(campaign.budgetPKR ?? 0)}</p>
        </div>
        <Badge variant="brand" label="Invited" />
      </div>
      {offer.note && (
        <div className="rounded-xl p-3 text-sm text-fg-muted italic" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          "{offer.note}"
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          isLoading={busy && action === 'accept'}
          disabled={busy}
          onClick={() => handle('accept')}
        >
          ✓ Accept
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          isLoading={busy && action === 'decline'}
          disabled={busy}
          onClick={() => handle('decline')}
        >
          ✕ Decline
        </Button>
      </div>
    </div>
  );
}
InvitationCard.propTypes = { offer: PropTypes.object, onAccept: PropTypes.func, onDecline: PropTypes.func };

/* ─── Analytics mini-section ───────────────────────────────────── */
function EarningsChart({ collabs }) {
  const seed = 'creator-earnings';
  const rand = seededRandom(seed);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map((label) => ({
    label,
    earnings: Math.floor(15000 + rand() * 85000),
  }));
  return (
    <div className="card rounded-2xl p-5">
      <h3 className="font-semibold text-fg text-sm mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Earnings Trend</h3>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ left: -8 }}>
          <defs>
            <linearGradient id="earn-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6d5cff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6d5cff" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatPKR(v), 'Earnings']} />
          <Area type="monotone" dataKey="earnings" stroke="#6d5cff" strokeWidth={2.5} fill="url(#earn-grad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */

function FilterBar({ search, onSearch, niche, onNiche, budget, onBudget, platform, onPlatform, sort, onSort }) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔍</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search campaigns by title, brand, or niche…"
          className="input-base w-full pl-9"
        />
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Niche filter */}
        <select value={niche} onChange={(e) => onNiche(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 130 }}>
          {NICHE_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        {/* Budget filter */}
        <select value={budget} onChange={(e) => onBudget(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 140 }}>
          {BUDGET_OPTS.map((o) => <option key={o.label} value={o.label}>{o.label}</option>)}
        </select>

        {/* Platform filter */}
        <select value={platform} onChange={(e) => onPlatform(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 140 }}>
          {PLATFORM_OPTS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p] ?? p}</option>)}
        </select>

        {/* Sort */}
        <select value={sort} onChange={(e) => onSort(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 150 }}>
          {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function CreatorCampaigns() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const { user }  = useAuth();

  const [activeTab, setActiveTab] = useState('discover');

  /* ── Discover state ── */
  const [campaigns,    setCampaigns]    = useState([]);
  const [loadingDisc,  setLoadingDisc]  = useState(true);
  const [search,       setSearch]       = useState('');
  const [niche,        setNiche]        = useState('All Niches');
  const [budget,       setBudget]       = useState('Any Budget');
  const [platform,     setPlatform]     = useState('All Platforms');
  const [sort,         setSort]         = useState('newest');
  const [savedIds,     setSavedIds]     = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY)) ?? []); } catch { return new Set(); }
  });
  const [appliedIds,   setAppliedIds]   = useState(new Set());

  /* ── Invitations ── */
  const [offers,       setOffers]       = useState([]);
  const [loadingOffers,setLoadingOffers]= useState(true);

  /* ── Applications ── */
  const [applications, setApplications] = useState([]);
  const [loadingApps,  setLoadingApps]  = useState(true);

  /* ── Active / Completed ── */
  const [collabs,      setCollabs]      = useState([]);
  const [loadingColl,  setLoadingColl]  = useState(true);

  /* ── Drawer ── */
  const [drawerCampaign, setDrawerCampaign] = useState(null);
  const [drawerOpen,     setDrawerOpen]     = useState(false);

  /* ── Seed for match scores ── */
  const matchRand = useMemo(() => seededRandom(`${user?.email ?? 'creator'}-match`), [user]);

  /* ── Load discover campaigns ── */
  const loadCampaigns = useCallback(async () => {
    setLoadingDisc(true);
    try {
      const { data } = await searchApi.campaigns({ status: 'PUBLISHED', limit: 50 });
      const list = Array.isArray(data) ? data : (data?.data ?? data?.campaigns ?? []);
      const enriched = list.map((c) => ({ ...c, matchScore: Math.round(60 + matchRand() * 38) }));
      setCampaigns(enriched);
    } catch {
      setCampaigns([]);
    }
    setLoadingDisc(false);
  }, [matchRand]);

  /* ── Load offers/invitations ── */
  const loadOffers = useCallback(async () => {
    setLoadingOffers(true);
    try {
      const { data } = await creatorsApi.getOffers();
      setOffers(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setOffers([]);
    }
    setLoadingOffers(false);
  }, []);

  /* ── Load collaborations (active + completed) ── */
  const loadCollabs = useCallback(async () => {
    setLoadingColl(true);
    try {
      const { data } = await creatorsApi.getCollaborations({});
      setCollabs(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setCollabs([]);
    }
    setLoadingColl(false);
  }, []);

  /* ── Load applications (all statuses) ── */
  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const { data } = await creatorsApi.getApplications();
      setApplications(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setApplications([]);
    }
    setLoadingApps(false);
  }, []);

  useEffect(() => {
    loadCampaigns();
    loadOffers();
    loadCollabs();
    loadApplications();
  }, [loadCampaigns, loadOffers, loadCollabs, loadApplications]);

  /* ── Derived ── */
  const activeCollabs    = useMemo(() => collabs.filter((c) => c.status === 'ACCEPTED'), [collabs]);
  const completedCollabs = useMemo(() => collabs.filter((c) => c.status === 'COMPLETED'), [collabs]);
  const totalEarned      = useMemo(() => completedCollabs.reduce((s, c) => s + (c.offerAmountPKR ?? 0), 0), [completedCollabs]);

  // Campaign IDs the creator has already applied to or been invited for — hide from Discover
  const engagedCampaignIds = useMemo(() =>
    new Set([
      ...applications.map((a) => a.campaignId ?? a.campaign?.id).filter(Boolean),
      ...offers.map((o) => o.campaignId ?? o.campaign?.id).filter(Boolean),
    ]),
  [applications, offers]);

  /* ── Filtered discover list ── */
  const selectedBudget = BUDGET_OPTS.find((b) => b.label === budget) ?? BUDGET_OPTS[0];
  const filteredCampaigns = useMemo(() => {
    // Exclude campaigns already applied to or invited for
    let list = campaigns.filter((c) => !engagedCampaignIds.has(c.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => (c.title ?? '').toLowerCase().includes(q) || (c.brand?.companyName ?? '').toLowerCase().includes(q) || (c.niche ?? '').toLowerCase().includes(q));
    }
    if (niche !== 'All Niches')        list = list.filter((c) => c.niche === niche);
    if (platform !== 'All Platforms')  list = list.filter((c) => (c.platforms ?? []).includes(platform));
    if (budget !== 'Any Budget') {
      list = list.filter((c) => {
        const max = c.budgetMax ?? c.budgetPKR ?? 0;
        return max >= selectedBudget.min && max <= selectedBudget.max;
      });
    }
    if (sort === 'budget')   list.sort((a, b) => (b.budgetMax ?? b.budgetPKR ?? 0) - (a.budgetMax ?? a.budgetPKR ?? 0));
    if (sort === 'deadline') list.sort((a, b) => new Date(a.deadline ?? '9999') - new Date(b.deadline ?? '9999'));
    if (sort === 'match')    list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    if (sort === 'newest')   list.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    return list;
  }, [campaigns, search, niche, platform, budget, selectedBudget, sort]);

  /* ── Actions ── */
  const handleApply = useCallback(async (campaign) => {
    await campaignsApi.apply(campaign.id, {});
    setAppliedIds((prev) => new Set([...prev, campaign.id]));
    toast.success('Application submitted!');
    loadApplications();
  }, [toast, loadApplications]);

  const handleWithdraw = useCallback(async (appId) => {
    await campaignsApi.withdrawApplication(appId);
    toast.info('Application withdrawn.');
    loadApplications();
  }, [toast, loadApplications]);

  const handleToggleSave = useCallback((campaign) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(campaign.id)) { next.delete(campaign.id); toast.info('Removed from saved.'); }
      else { next.add(campaign.id); toast.success('Campaign saved.'); }
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  }, [toast]);

  const handleAcceptOffer = useCallback(async (offer) => {
    try {
      await campaignsApi.respondToInvitation(offer.id, 'accept');
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      toast.success('Invitation accepted! The brand has been notified.');
      loadCollabs();
    } catch (err) {
      toast.error(err?.message || 'Failed to accept invitation.');
    }
  }, [toast, loadCollabs]);

  const handleDeclineOffer = useCallback(async (offer) => {
    await campaignsApi.respondToInvitation(offer.id, 'reject');
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    toast.info('Invitation declined. The brand has been notified.');
  }, [toast]);

  const openDrawer = (campaign) => { setDrawerCampaign(campaign); setDrawerOpen(true); };

  const tabCounts = {
    discover:     null,
    invitations:  offers.length,
    applications: applications.length,
    active:       activeCollabs.length,
    completed:    completedCollabs.length,
  };

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Campaigns</h1>
        <p className="text-fg-muted text-sm mt-0.5">Discover opportunities, track applications, and manage active collaborations.</p>
      </header>

      {/* ── KPI Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value={<AnimatedCounter value={filteredCampaigns.length} />} label="Open Campaigns"    icon="🔍" />
        <StatCard value={<AnimatedCounter value={applications.length} />}      label="Applied"           icon="📨" />
        <StatCard value={<AnimatedCounter value={activeCollabs.length} />}     label="Active"            icon="🚀" />
        <StatCard value={<AnimatedCounter value={totalEarned} format={formatPKR} />} label="Total Earned" icon="💰" highlight />
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {TABS.map((t) => {
          const cnt = tabCounts[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={activeTab === t.id
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
              }
            >
              <span>{t.icon}</span>
              {t.label}
              {cnt != null && cnt > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={activeTab === t.id
                    ? { background: 'rgba(255,255,255,0.25)' }
                    : { background: 'var(--surface)', color: 'var(--fg-muted)' }
                  }
                >
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════
          TAB: DISCOVER
         ══════════════════════════════════════ */}
      {activeTab === 'discover' && (
        <div className="space-y-5">
          {/* ── Open Campaigns ── */}
          {!loadingDisc && campaigns.length > 0 && (
            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>📣 Open Campaigns</h2>
                  <p className="text-fg-muted text-xs mt-0.5">Active campaigns you can apply to right now</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)' }}>
                  {campaigns.length} open
                </span>
              </div>
              <ActiveOpportunitiesSection
                campaigns={campaigns.slice(0, 4).map((c) => ({
                  id: c.id,
                  title: c.title || 'Untitled Campaign',
                  budgetMin: c.budgetMin ?? c.budgetPKR ?? 0,
                  budgetMax: c.budgetMax ?? c.budgetPKR ?? 0,
                  timeline:  c.deadline ? `${Math.max(1, Math.ceil((new Date(c.deadline) - Date.now()) / 86_400_000))} days` : 'Flexible',
                  niches:    c.niche ? [c.niche] : [],
                  requirements: c.requirements ?? [],
                  deliverables: c.deliverables ?? [],
                }))}
                onApply={handleApply}
                isApplying={false}
                applyState={null}
              />
            </div>
          )}

          <FilterBar
            search={search}   onSearch={setSearch}
            niche={niche}     onNiche={setNiche}
            budget={budget}   onBudget={setBudget}
            platform={platform} onPlatform={setPlatform}
            sort={sort}       onSort={setSort}
          />

          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span>{filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found</span>
            {savedIds.size > 0 && (
              <button
                onClick={() => {
                  setCampaigns((prev) => [...prev].sort((a, b) => (savedIds.has(b.id) ? 1 : 0) - (savedIds.has(a.id) ? 1 : 0)));
                }}
                className="text-fg-muted hover:text-fg transition-colors"
              >
                ★ {savedIds.size} saved
              </button>
            )}
          </div>

          {loadingDisc ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No campaigns found"
              message="Try adjusting your filters or check back later for new opportunities."
              action={<Button variant="secondary" size="sm" onClick={() => { setSearch(''); setNiche('All Niches'); setBudget('Any Budget'); setPlatform('All Platforms'); }}>Clear Filters</Button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCampaigns.map((c) => (
                <CampaignDiscoverCard
                  key={c.id}
                  campaign={c}
                  onView={openDrawer}
                  onApply={handleApply}
                  isApplied={appliedIds.has(c.id)}
                  isSaved={savedIds.has(c.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: INVITATIONS
         ══════════════════════════════════════ */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {loadingOffers ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
          ) : offers.length === 0 ? (
            <EmptyState
              icon="✉️"
              title="No invitations yet"
              message="When brands invite you to collaborate on their campaigns, you'll see them here."
              action={<Button variant="primary" size="sm" onClick={() => setActiveTab('discover')}>Browse Campaigns</Button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <InvitationCard
                  key={offer.id}
                  offer={offer}
                  onAccept={handleAcceptOffer}
                  onDecline={handleDeclineOffer}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: APPLICATIONS
         ══════════════════════════════════════ */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Status summary */}
          {applications.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pending',  value: applications.filter((a) => a.status === 'PENDING'  || !a.status).length, color: '#f59e0b' },
                { label: 'Accepted', value: applications.filter((a) => a.status === 'ACCEPTED').length, color: '#16b364' },
                { label: 'Rejected', value: applications.filter((a) => a.status === 'REJECTED').length, color: '#f0445f' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <p className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif', color: s.color }}>{s.value}</p>
                  <p className="text-fg-muted text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {loadingApps ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
          ) : applications.length === 0 ? (
            <EmptyState
              icon="📨"
              title="No applications yet"
              message="Apply to campaigns you're interested in and track them here."
              action={<Button variant="primary" size="sm" onClick={() => setActiveTab('discover')}>Discover Campaigns</Button>}
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <ApplicationRow key={app.id} app={app} onWithdraw={handleWithdraw} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: ACTIVE
         ══════════════════════════════════════ */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {loadingColl ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
          ) : activeCollabs.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No active campaigns"
              message="Once a brand accepts your application, your active campaigns will appear here."
              action={<Button variant="primary" size="sm" onClick={() => setActiveTab('discover')}>Find Campaigns</Button>}
            />
          ) : (
            <div className="space-y-3">
              {activeCollabs.map((c) => (
                <CollabRow
                  key={c.id}
                  collab={c}
                  tab="active"
                  onMessage={(userId) => navigate(ROUTES.CREATOR_MESSAGES + (userId ? `?userId=${userId}` : ''))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: COMPLETED
         ══════════════════════════════════════ */}
      {activeTab === 'completed' && (
        <div className="space-y-5">
          {completedCollabs.length > 0 && (
            <EarningsChart collabs={completedCollabs} />
          )}

          {loadingColl ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          ) : completedCollabs.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No completed campaigns yet"
              message="Completed collaborations and their performance metrics will appear here."
            />
          ) : (
            <div className="space-y-3">
              {completedCollabs.map((c) => (
                <CollabRow
                  key={c.id}
                  collab={c}
                  tab="completed"
                  onMessage={(userId) => navigate(ROUTES.CREATOR_MESSAGES + (userId ? `?userId=${userId}` : ''))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campaign detail drawer */}
      <CreatorCampaignDrawer
        campaign={drawerCampaign}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isApplied={drawerCampaign ? appliedIds.has(drawerCampaign.id) : false}
        onApplySuccess={(id) => { setAppliedIds((prev) => new Set([...prev, id])); loadApplications(); }}
      />
    </div>
  );
}
