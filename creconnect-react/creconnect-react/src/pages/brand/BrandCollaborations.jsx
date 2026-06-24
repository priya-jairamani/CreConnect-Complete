import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { brandsApi } from '@/api/brands.api';
import { campaignsApi } from '@/api/campaigns.api';
import { ROUTES } from '@/constants/routes';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import StatCard from '@/components/common/StatCard';
import { formatPKR } from '@/utils/formatters';

/* ─── Stage / status meta ─────────────────────────────────────────── */

const STAGE_LABEL = {
  INQUIRY:     'Inquiry',
  NEGOTIATION: 'Negotiation',
  CONTRACTED:  'Contracted',
  IN_PROGRESS: 'In Progress',
  DELIVERED:   'Delivered',
  COMPLETED:   'Completed',
};

const STAGE_VARIANT = {
  INQUIRY:     'neutral',
  NEGOTIATION: 'warning',
  CONTRACTED:  'brand',
  IN_PROGRESS: 'info',
  DELIVERED:   'success',
  COMPLETED:   'success',
};

const TABS = [
  { key: 'requests',   label: 'Requests',    icon: '📥' },
  { key: 'active',     label: 'Active',      icon: '🚀' },
  { key: 'completed',  label: 'Completed',   icon: '✅' },
  { key: 'deliverables', label: 'Deliverables', icon: '🎬' },
  { key: 'reviews',    label: 'Reviews',     icon: '★'  },
];

/* ─── Row components ──────────────────────────────────────────────── */

function ApplicationRow({ app, onRespond }) {
  const creator  = app.creator  ?? {};
  const campaign = app.campaign ?? {};
  const platform = creator.platforms?.[0];
  const [busy, setBusy] = useState(false);

  const handle = async (action) => {
    setBusy(true);
    try { await onRespond(app.id, action); } finally { setBusy(false); }
  };

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Avatar
        src={creator.avatarUrl}
        initials={(creator.displayName || creator.username || '?').slice(0, 2).toUpperCase()}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-fg text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
            {creator.displayName || creator.username || '—'}
          </p>
          <Badge variant="warning" label="Pending" />
        </div>
        <p className="text-fg-muted text-xs truncate">{campaign.title || 'Campaign'}</p>
      </div>
      {platform && (
        <div className="hidden sm:flex flex-col items-end flex-shrink-0">
          <p className="text-fg text-xs font-semibold">
            {platform.followerCount ? (platform.followerCount / 1000).toFixed(1) + 'K' : '—'}
          </p>
          <p className="text-fg-muted text-[10px]">followers</p>
        </div>
      )}
      <div className="hidden md:block flex-shrink-0 text-right">
        <p className="text-fg text-xs font-semibold">{formatPKR(campaign.budgetPKR || 0)}</p>
        <p className="text-fg-muted text-[10px]">budget</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="primary"   size="xs" disabled={busy} onClick={() => handle('accept')}>✓ Accept</Button>
        <Button variant="secondary" size="xs" disabled={busy} onClick={() => handle('reject')}>✕ Reject</Button>
      </div>
    </div>
  );
}

function CollabRow({ collab, onMessage }) {
  const creator  = collab.creator  ?? {};
  const campaign = collab.campaign ?? {};
  const platform = creator.platforms?.[0];
  const stage    = collab.stage ?? 'INQUIRY';

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Avatar
        src={creator.avatarUrl}
        initials={(creator.displayName || creator.username || '?').slice(0, 2).toUpperCase()}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-fg text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
          {creator.displayName || creator.username || '—'}
        </p>
        <p className="text-fg-muted text-xs truncate">{campaign.title || 'Campaign'}</p>
      </div>
      {platform && (
        <div className="hidden sm:flex flex-col items-end flex-shrink-0">
          <p className="text-fg text-xs font-semibold">
            {platform.followerCount ? (platform.followerCount / 1000).toFixed(1) + 'K' : '—'}
          </p>
          <p className="text-fg-muted text-[10px]">followers</p>
        </div>
      )}
      <div className="flex-shrink-0">
        <Badge variant={STAGE_VARIANT[stage] ?? 'neutral'} label={STAGE_LABEL[stage] ?? stage} />
      </div>
      <div className="hidden md:block flex-shrink-0 text-right">
        <p className="text-fg text-xs font-semibold">{formatPKR(collab.offerAmountPKR || campaign.budgetPKR || 0)}</p>
        <p className="text-fg-muted text-[10px]">{collab.paymentStatus || 'PENDING'}</p>
      </div>
      <div className="flex-shrink-0">
        <Button variant="secondary" size="xs" onClick={() => onMessage(creator.userId)}>
          💬 Message
        </Button>
      </div>
    </div>
  );
}

function TableHeader({ cols }) {
  return (
    <div
      className="px-5 py-3 border-b flex items-center gap-4 text-xs font-semibold text-fg-muted uppercase tracking-widest"
      style={{ borderColor: 'var(--border)' }}
    >
      {cols.map((c) => (
        <span key={c.label} className={c.cls ?? 'flex-1'}>{c.label}</span>
      ))}
    </div>
  );
}

/* ─── Deliverables tab ────────────────────────────────────────────── */
function DeliverablesTab({ collaborations }) {
  const active = collaborations.filter((c) => c.status === 'ACCEPTED');
  if (active.length === 0) {
    return (
      <EmptyState
        icon="🎬"
        title="No active deliverables"
        message="Deliverable tracking appears here once collaborations move to Active status."
        action={<Button variant="primary" size="sm">View Campaigns</Button>}
      />
    );
  }
  return (
    <div className="space-y-3">
      {active.map((collab) => {
        const creator = collab.creator ?? {};
        const campaign = collab.campaign ?? {};
        const stage = collab.stage ?? 'INQUIRY';
        const deliverableStages = [
          { label: 'Brief Sent',        done: true },
          { label: 'Content Draft',     done: ['NEGOTIATION', 'CONTRACTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(stage) },
          { label: 'Under Review',      done: ['IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(stage) },
          { label: 'Approved',          done: ['DELIVERED', 'COMPLETED'].includes(stage) },
          { label: 'Published',         done: stage === 'COMPLETED' },
        ];
        return (
          <div key={collab.id} className="card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={creator.avatarUrl}
                initials={(creator.displayName || '?').slice(0, 2).toUpperCase()}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-fg font-semibold text-sm truncate">{creator.displayName || creator.username || '—'}</p>
                <p className="text-fg-muted text-xs truncate">{campaign.title || 'Campaign'}</p>
              </div>
              <Badge variant={STAGE_VARIANT[stage] ?? 'neutral'} label={STAGE_LABEL[stage] ?? stage} />
            </div>
            <div className="flex items-center gap-0">
              {deliverableStages.map((ds, i) => (
                <div key={ds.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className="flex-1 h-0.5" style={{ background: ds.done ? '#16b364' : 'var(--border)' }} />
                    )}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={ds.done
                        ? { background: '#16b364', color: '#fff' }
                        : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      {ds.done ? '✓' : i + 1}
                    </div>
                    {i < deliverableStages.length - 1 && (
                      <div className="flex-1 h-0.5" style={{ background: deliverableStages[i + 1]?.done ? '#16b364' : 'var(--border)' }} />
                    )}
                  </div>
                  <p className="text-[10px] text-fg-muted text-center leading-tight">{ds.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Reviews tab ─────────────────────────────────────────────────── */
function ReviewsTab({ collaborations }) {
  const toast = useToast();
  const completed = collaborations.filter((c) => c.status === 'COMPLETED');
  if (completed.length === 0) {
    return (
      <EmptyState
        icon="★"
        title="No reviews yet"
        message="Reviews from completed collaborations will appear here."
      />
    );
  }
  return (
    <div className="space-y-3">
      {completed.map((collab) => {
        const creator  = collab.creator  ?? {};
        const campaign = collab.campaign ?? {};
        const review   = collab.review;
        return (
          <div key={collab.id} className="card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={creator.avatarUrl}
                initials={(creator.displayName || '?').slice(0, 2).toUpperCase()}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-fg font-semibold text-sm">{creator.displayName || creator.username || '—'}</p>
                <p className="text-fg-muted text-xs">{campaign.title || 'Campaign'}</p>
              </div>
              {review ? (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < (review.rating ?? 0) ? '#f59e0b' : 'var(--border)', fontSize: 14 }}>★</span>
                  ))}
                </div>
              ) : (
                <Badge variant="neutral" label="No review yet" />
              )}
            </div>
            {review?.comment && (
              <p className="text-fg-muted text-sm leading-relaxed">{review.comment}</p>
            )}
            {!review && (
              <Button
                variant="secondary"
                size="xs"
                onClick={() => toast.success(`Review request sent to ${collab.creator?.displayName || 'creator'}`)}
              >
                Request Review
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function BrandCollaborations() {
  const navigate = useNavigate();

  const [collaborations,   setCollaborations]   = useState([]);
  const [applications,     setApplications]     = useState([]);
  const [isLoadingCollabs, setIsLoadingCollabs] = useState(true);
  const [isLoadingApps,    setIsLoadingApps]    = useState(true);
  const [error,            setError]            = useState(null);
  const [activeTab,        setActiveTab]        = useState('requests');

  const loadCollabs = useCallback(async () => {
    setIsLoadingCollabs(true);
    setError(null);
    try {
      const { data } = await brandsApi.getCollaborations({});
      setCollaborations(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (err) {
      setError(err?.message || 'Failed to load collaborations');
    } finally {
      setIsLoadingCollabs(false);
    }
  }, []);

  const loadApps = useCallback(async () => {
    setIsLoadingApps(true);
    try {
      const { data } = await brandsApi.getApplications();
      setApplications(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setApplications([]);
    } finally {
      setIsLoadingApps(false);
    }
  }, []);

  useEffect(() => { loadCollabs(); }, [loadCollabs]);
  useEffect(() => { loadApps();    }, [loadApps]);

  const handleRespond = useCallback(async (appId, action) => {
    await campaignsApi.respondApplication(appId, action);
    await Promise.all([loadApps(), loadCollabs()]);
  }, [loadApps, loadCollabs]);

  const handleMessage = useCallback((userId) => {
    navigate(ROUTES.BRAND_MESSAGES + (userId ? `?userId=${userId}` : ''));
  }, [navigate]);

  const active    = useMemo(() => collaborations.filter((c) => c.status === 'ACCEPTED'),   [collaborations]);
  const completed = useMemo(() => collaborations.filter((c) => c.status === 'COMPLETED'),  [collaborations]);

  const tabCounts = {
    requests:    applications.length,
    active:      active.length,
    completed:   completed.length,
    deliverables: active.length,
    reviews:     completed.length,
  };

  const isLoading = isLoadingCollabs || isLoadingApps;

  return (
    <div className="p-6 space-y-6">

      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Collaborations
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Manage creator requests, active partnerships, deliverables, and reviews.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate(ROUTES.BRAND_COLLAB_REQUEST)}>
          + New Outreach
        </Button>
      </header>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value={applications.length}     label="Pending Requests"     icon="📥" />
        <StatCard value={active.length}           label="Active Collaborations" icon="🚀" />
        <StatCard value={completed.length}        label="Completed"            icon="✅" />
        <StatCard value={collaborations.length}   label="Total"                icon="◉" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={activeTab === t.key
              ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
              : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            <span>{t.icon}</span>
            {t.label}
            {tabCounts[t.key] > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={activeTab === t.key
                  ? { background: 'rgba(255,255,255,0.25)' }
                  : { background: 'var(--surface)', color: 'var(--fg-muted)' }
                }
              >
                {tabCounts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {isLoading ? (
        <div className="card rounded-2xl overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 mx-2 my-2 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="card rounded-2xl p-8 text-center">
          <p className="text-danger text-sm">{error}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => { loadCollabs(); loadApps(); }}>Retry</Button>
        </div>
      ) : (
        <>
          {/* ── Requests ── */}
          {activeTab === 'requests' && (
            applications.length === 0 ? (
              <div className="card rounded-2xl">
                <EmptyState
                  icon="📥"
                  title="No pending requests"
                  message="Creator applications to your campaigns will appear here for you to accept or reject."
                  action={<Button variant="primary" size="sm" onClick={() => navigate(ROUTES.BRAND_CAMPAIGNS)}>View Campaigns</Button>}
                />
              </div>
            ) : (
              <div className="card rounded-2xl overflow-hidden">
                <TableHeader cols={[
                  { label: 'Creator / Campaign', cls: 'flex-1' },
                  { label: 'Followers', cls: 'hidden sm:block w-16 text-right' },
                  { label: 'Budget', cls: 'hidden md:block w-20 text-right' },
                  { label: 'Action', cls: 'w-36 text-right' },
                ]} />
                {applications.map((app) => (
                  <ApplicationRow key={app.id} app={app} onRespond={handleRespond} />
                ))}
              </div>
            )
          )}

          {/* ── Active ── */}
          {activeTab === 'active' && (
            active.length === 0 ? (
              <div className="card rounded-2xl">
                <EmptyState
                  icon="🚀"
                  title="No active collaborations"
                  message="Accept creator requests to start active collaborations."
                  action={<Button variant="primary" size="sm" onClick={() => setActiveTab('requests')}>View Requests</Button>}
                />
              </div>
            ) : (
              <div className="card rounded-2xl overflow-hidden">
                <TableHeader cols={[
                  { label: 'Creator / Campaign', cls: 'flex-1' },
                  { label: 'Followers', cls: 'hidden sm:block w-16 text-right' },
                  { label: 'Stage', cls: 'w-28 text-center' },
                  { label: 'Budget', cls: 'hidden md:block w-24 text-right' },
                  { label: 'Action', cls: 'w-24 text-right' },
                ]} />
                {active.map((c) => <CollabRow key={c.id} collab={c} onMessage={handleMessage} />)}
              </div>
            )
          )}

          {/* ── Completed ── */}
          {activeTab === 'completed' && (
            completed.length === 0 ? (
              <div className="card rounded-2xl">
                <EmptyState icon="✅" title="No completed collaborations" message="Collaborations that reach completion will appear here." />
              </div>
            ) : (
              <div className="card rounded-2xl overflow-hidden">
                <TableHeader cols={[
                  { label: 'Creator / Campaign', cls: 'flex-1' },
                  { label: 'Followers', cls: 'hidden sm:block w-16 text-right' },
                  { label: 'Stage', cls: 'w-28 text-center' },
                  { label: 'Budget', cls: 'hidden md:block w-24 text-right' },
                  { label: 'Action', cls: 'w-24 text-right' },
                ]} />
                {completed.map((c) => <CollabRow key={c.id} collab={c} onMessage={handleMessage} />)}
              </div>
            )
          )}

          {/* ── Deliverables ── */}
          {activeTab === 'deliverables' && (
            <DeliverablesTab collaborations={collaborations} />
          )}

          {/* ── Reviews ── */}
          {activeTab === 'reviews' && (
            <ReviewsTab collaborations={collaborations} />
          )}
        </>
      )}
    </div>
  );
}
