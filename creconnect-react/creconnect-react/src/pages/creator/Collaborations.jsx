import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaignContext } from '@/context/CampaignContext';
import { ROUTES } from '@/constants/routes';
import { KANBAN_STAGES, DB_STAGE_TO_KANBAN, DB_STATUS_TO_KANBAN } from '@/constants/collaborationOptions';
import {
  getCollaborationIntel, getDeliverables, getPaymentBreakdown, getPerformanceMetrics,
  getContract, getCollaborationNotifications,
} from '@/utils/mockCollaborationIntel';
import { seededRandom } from '@/utils/mockAnalytics';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from 'recharts';

import CollabKPIBar from '@/components/collaboration/CollabKPIBar';
import CollabFiltersBar from '@/components/collaboration/CollabFiltersBar';
import KanbanBoard from '@/components/collaboration/KanbanBoard';
import {
  CollabListView, CollabTableView, CollabCalendarView, CollabTimelineView,
} from '@/components/collaboration/CollabViews';
import CollabDrawer from '@/components/collaboration/CollabDrawer';
import CollabNotificationsPanel from '@/components/collaboration/CollabNotificationsPanel';
import CollabCopilotModal from '@/components/collaboration/CollabCopilotModal';
import CollabEmptyState from '@/components/collaboration/CollabEmptyState';

const STAGE_OVERRIDES_KEY = 'cc-collab-stage-overrides';
const SAVED_VIEWS_KEY     = 'cc-collab-saved-views';

const DEFAULT_FILTERS = { stages: [], priorities: [], paymentStatuses: [] };

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function dbStageToKanban(item) {
  if (item.dbStage && DB_STAGE_TO_KANBAN[item.dbStage]) {
    if (item.rawStatus === 'ACCEPTED' || item.rawStatus === 'PENDING') {
      return DB_STAGE_TO_KANBAN[item.dbStage] ?? DB_STATUS_TO_KANBAN[item.rawStatus] ?? 'Applied';
    }
  }
  return DB_STATUS_TO_KANBAN[item.rawStatus] ?? 'Applied';
}

function normalizeCollaboration(c) {
  return {
    id:              c.id,
    rawStatus:       c.status         ?? 'PENDING',
    dbStage:         c.stage          ?? 'INQUIRY',
    dbPriority:      c.priority       ?? null,
    dbPaymentStatus: c.paymentStatus  ?? null,
    brandUserId:     c.brand?.userId        ?? null,
    brandName:       c.brand?.companyName   ?? c.brandName    ?? 'Brand',
    brandLogo:       c.brand?.logoUrl       ?? c.brandLogo    ?? null,
    industry:        c.brand?.industry      ?? c.industry     ?? 'General',
    campaignTitle:   c.campaign?.title      ?? c.title        ?? 'Campaign',
    campaignType:    c.campaign?.contentType ?? c.campaignType ?? 'Sponsored Post',
    deadline:        c.endDate   ?? c.deadline  ?? null,
    budget:          c.offerAmountPKR ?? c.budgetPKR ?? c.budget ?? 0,
    createdAt:       c.createdAt ?? c.startDate ?? null,
    requirements: {
      REEL:       c.campaign?.reels       ?? 0,
      POST:       c.campaign?.posts       ?? 0,
      STORY:      c.campaign?.stories     ?? 0,
      VIDEO:      c.campaign?.videos      ?? 0,
      LIVESTREAM: c.campaign?.livestreams ?? 0,
    },
  };
}

function computeSummary(items) {
  const active    = items.filter((i) => i.rawStatus === 'ACCEPTED').length;
  const completed = items.filter((i) => i.rawStatus === 'COMPLETED').length;
  const pending   = items.filter((i) => i.rawStatus === 'PENDING').length;
  const totalEarnings = items
    .filter((i) => i.rawStatus === 'COMPLETED')
    .reduce((sum, i) => sum + (Number(i.budget) || 0), 0);
  const successRate = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  /* Seed a stable avg rating from the first item id or fallback */
  const seed = items[0]?.id ?? 'collab-default';
  const rand = seededRandom(`${seed}-kpi`);
  const avgRating = items.length > 0 ? Math.round((4 + rand() * 0.9) * 10) / 10 : 0;

  return {
    activeCollaborations: active,
    pendingInvitations:   pending,
    completedCampaigns:   completed,
    totalEarnings,
    avgRating,
    successRate,
  };
}

/* ─── Analytics section ─────────────────────────────────────────────── */

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

function CollabAnalytics({ items }) {
  const seed = items[0]?.id ?? 'collab-analytics';

  const monthlyData = useMemo(() => {
    const rand  = seededRandom(`${seed}-monthly`);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month) => ({
      month,
      collaborations: Math.floor(rand() * 5),
      revenue: Math.floor(10000 + rand() * 90000),
    }));
  }, [seed]);

  const successData = useMemo(() => {
    const rand = seededRandom(`${seed}-success`);
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => ({
      month,
      successRate: Math.round(70 + rand() * 25),
      brandRetention: Math.round(20 + rand() * 55),
    }));
  }, [seed]);

  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <div className="card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setAnalyticsOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            📊
          </span>
          <div>
            <h3 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Collaboration Analytics</h3>
            <p className="text-fg-muted text-xs mt-0.5">Monthly activity, revenue growth, and brand retention</p>
          </div>
        </div>
        <span className="text-fg-muted text-sm transition-transform" style={{ transform: analyticsOpen ? 'rotate(180deg)' : '' }}>▾</span>
      </button>

      {analyticsOpen && (
        <div className="px-5 pb-5 border-t space-y-5" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-5 grid lg:grid-cols-2 gap-5">

            {/* Monthly collaborations */}
            <div>
              <h4 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Monthly Collaborations</h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyData} margin={{ left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="collaborations" name="Collaborations" fill="#6d5cff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue growth */}
            <div>
              <h4 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Revenue Growth</h4>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={monthlyData} margin={{ left: -8 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16b364" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16b364" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#16b364" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Success rate */}
            <div>
              <h4 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Success Rate</h4>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={successData} margin={{ left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={axisTick} axisLine={false} tickLine={false} width={30} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
                  <Line type="monotone" dataKey="successRate" name="Success Rate" stroke="#6d5cff" strokeWidth={2.5} dot={{ r: 3, fill: '#6d5cff', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Brand retention */}
            <div>
              <h4 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Brand Retention</h4>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={successData} margin={{ left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 80]} tick={axisTick} axisLine={false} tickLine={false} width={30} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
                  <Line type="monotone" dataKey="brandRetention" name="Brand Retention" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function Collaborations() {
  const { campaigns, fetchMyCampaigns, isLoading } = useCampaignContext();
  const navigate = useNavigate();

  useEffect(() => { fetchMyCampaigns(); }, [fetchMyCampaigns]);

  const [stageOverrides, setStageOverrides] = useState(() => loadJSON(STAGE_OVERRIDES_KEY, {}));
  const [savedViews,     setSavedViews]     = useState(() => loadJSON(SAVED_VIEWS_KEY, []));

  const [viewMode,  setViewMode]  = useState('kanban');
  const [search,    setSearch]    = useState('');
  const [filters,   setFilters]   = useState(DEFAULT_FILTERS);

  const [selectedItem,      setSelectedItem]      = useState(null);
  const [drawerOpen,        setDrawerOpen]        = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [copilotOpen,       setCopilotOpen]       = useState(false);

  const items = useMemo(() => (campaigns ?? []).map(normalizeCollaboration), [campaigns]);

  const enriched = useMemo(() => items.map((item) => {
    const baseIntel = getCollaborationIntel(item);
    const realStage = dbStageToKanban(item);
    const override  = stageOverrides[item.id];
    const stage     = (override && KANBAN_STAGES.includes(override)) ? override : realStage;
    const intel       = { ...baseIntel, stage };
    const deliverables = getDeliverables(item);
    const payment      = getPaymentBreakdown(item, intel);
    const performance  = getPerformanceMetrics(item);
    const contract     = getContract(item);
    return { item, intel, deliverables, payment, performance, contract };
  }), [items, stageOverrides]);

  const summary       = useMemo(() => computeSummary(items), [items]);
  const notifications = useMemo(() => getCollaborationNotifications(items), [items]);

  const filteredEnriched = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter(({ item, intel }) => {
      if (q && !`${item.brandName} ${item.campaignTitle}`.toLowerCase().includes(q)) return false;
      if (filters.stages.length          && !filters.stages.includes(intel.stage))               return false;
      if (filters.priorities.length      && !filters.priorities.includes(intel.priority))         return false;
      if (filters.paymentStatuses.length && !filters.paymentStatuses.includes(intel.paymentStatus)) return false;
      return true;
    });
  }, [enriched, search, filters]);

  const columns = useMemo(() => {
    const map = Object.fromEntries(KANBAN_STAGES.map((s) => [s, []]));
    filteredEnriched.forEach((entry) => { map[entry.intel.stage]?.push(entry); });
    return map;
  }, [filteredEnriched]);

  const handleMoveStage = useCallback((itemId, newStage) => {
    setStageOverrides((prev) => {
      const next = { ...prev, [itemId]: newStage };
      localStorage.setItem(STAGE_OVERRIDES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleOpen    = useCallback((item) => { setSelectedItem(item); setDrawerOpen(true); }, []);
  const handleMessage = useCallback((item) => {
    const userId = item?.brandUserId;
    navigate(ROUTES.CREATOR_MESSAGES + (userId ? `?userId=${userId}` : ''));
  }, [navigate]);
  const handleSubmit  = useCallback((item) => { setSelectedItem(item); setDrawerOpen(true); }, []);

  const handleSaveView = useCallback((name) => {
    setSavedViews((prev) => {
      const next = [...prev.filter((v) => v.name !== name), { name, viewMode, search, filters }];
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next));
      return next;
    });
  }, [viewMode, search, filters]);

  const handleApplyView  = useCallback((view) => { setViewMode(view.viewMode); setSearch(view.search); setFilters(view.filters); }, []);
  const handleDeleteView = useCallback((name) => {
    setSavedViews((prev) => {
      const next = prev.filter((v) => v.name !== name);
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleOpenNotificationItem = useCallback((item) => {
    setNotificationsOpen(false);
    handleOpen(item);
  }, [handleOpen]);

  const isEmpty = !isLoading && (campaigns ?? []).length === 0;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Collaborations
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Your central workspace for brand partnerships, deliverables, contracts, and payments.
          </p>
        </div>
      </header>

      {isEmpty ? (
        <CollabEmptyState navigate={navigate} />
      ) : (
        <>
          <CollabKPIBar summary={summary} />

          <CollabFiltersBar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
            savedViews={savedViews}
            onSaveView={handleSaveView}
            onApplyView={handleApplyView}
            onDeleteView={handleDeleteView}
            onOpenCopilot={() => setCopilotOpen(true)}
            onOpenNotifications={() => setNotificationsOpen(true)}
            notificationCount={notifications.length}
          />

          {viewMode === 'kanban'   && <KanbanBoard columns={columns} onOpen={handleOpen} onMessage={handleMessage} onSubmit={handleSubmit} onMoveStage={handleMoveStage} />}
          {viewMode === 'list'     && <CollabListView     enriched={filteredEnriched} onOpen={handleOpen} />}
          {viewMode === 'table'    && <CollabTableView    enriched={filteredEnriched} onOpen={handleOpen} />}
          {viewMode === 'calendar' && <CollabCalendarView enriched={filteredEnriched} onOpen={handleOpen} />}
          {viewMode === 'timeline' && <CollabTimelineView enriched={filteredEnriched} onOpen={handleOpen} />}

          {/* Analytics section */}
          <CollabAnalytics items={items} />
        </>
      )}

      <CollabDrawer item={selectedItem} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <CollabNotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onOpenItem={handleOpenNotificationItem}
      />

      <CollabCopilotModal isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} enriched={enriched} />
    </div>
  );
}
