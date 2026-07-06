import { useEffect, useMemo, useState } from 'react';

import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Drawer from '@/components/common/Drawer';
import EmptyState from '@/components/common/EmptyState';
import Skeleton, { SkeletonRow } from '@/components/common/Skeleton';

import { adminApi } from '@/api/admin.api';
import { formatCompactPKR } from '@/utils/formatters';
import { OBJECTIVES, PLATFORM_OPTIONS, NICHES, DELIVERABLE_TYPES } from '@/constants/campaignOptions';

const PAGE_SIZE = 10;

const STATUS_FILTERS = ['ALL', 'DRAFT', 'PUBLISHED', 'PAUSED', 'COMPLETED'];

const STATUS_META = {
  DRAFT:     { label: 'Draft',     variant: 'neutral' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  PAUSED:    { label: 'Paused',    variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'brand' },
};

const OBJECTIVE_LABELS = Object.fromEntries(OBJECTIVES.map((o) => [o.value, o.label]));
const PLATFORM_LABELS  = Object.fromEntries(PLATFORM_OPTIONS.map((p) => [p.value, p.label]));
const NICHE_LABELS     = Object.fromEntries(NICHES.map((n) => [n.toUpperCase(), n]));

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' });
}

function budgetLabel(c) {
  if (c.budgetType === 'FIXED') return formatCompactPKR(c.budgetPKR);
  if (c.budgetMin != null || c.budgetMax != null) {
    return `${formatCompactPKR(c.budgetMin)} – ${formatCompactPKR(c.budgetMax)}`;
  }
  return '—';
}

export default function CampaignManagement() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [campaigns, setCampaigns] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const [counts, setCounts] = useState(null);

  /* Real per-status counts for the KPI row — one lightweight call per status. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [all, draft, published, paused, completed] = await Promise.all([
          adminApi.getCampaigns({ limit: 1 }),
          adminApi.getCampaigns({ status: 'DRAFT', limit: 1 }),
          adminApi.getCampaigns({ status: 'PUBLISHED', limit: 1 }),
          adminApi.getCampaigns({ status: 'PAUSED', limit: 1 }),
          adminApi.getCampaigns({ status: 'COMPLETED', limit: 1 }),
        ]);
        if (cancelled) return;
        setCounts({
          all:       all.data?.meta?.total ?? 0,
          draft:     draft.data?.meta?.total ?? 0,
          published: published.data?.meta?.total ?? 0,
          paused:    paused.data?.meta?.total ?? 0,
          completed: completed.data?.meta?.total ?? 0,
        });
      } catch {
        if (!cancelled) setCounts(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Campaign list for the current filter/page. */
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    const params = { page, limit: PAGE_SIZE };
    if (statusFilter !== 'ALL') params.status = statusFilter;

    adminApi.getCampaigns(params)
      .then(({ data }) => {
        if (cancelled) return;
        setCampaigns(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setCampaigns([]);
        setMeta(null);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [statusFilter, page]);

  function handleStatusClick(s) {
    setStatusFilter(s);
    setPage(1);
  }

  const visible = useMemo(() => {
    if (!search.trim()) return campaigns;
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) =>
      `${c.title ?? ''} ${c.brand?.companyName ?? ''}`.toLowerCase().includes(q)
    );
  }, [campaigns, search]);

  const kpis = [
    { key: 'all',       label: 'Total Campaigns', icon: '📋' },
    { key: 'draft',     label: 'Draft',           icon: '📝' },
    { key: 'published', label: 'Published',       icon: '🚀' },
    { key: 'paused',    label: 'Paused',           icon: '⏸️' },
    { key: 'completed', label: 'Completed',        icon: '✅' },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Campaigns
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            View every campaign published on the platform, filter by status, and inspect campaign details.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 text-fg-muted text-xs font-medium border cursor-not-allowed flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
          title="Approving, rejecting, flagging or otherwise moderating campaigns is not yet supported by the backend — this view is read-only."
        >
          🚧 Moderation actions coming soon
        </span>
      </header>

      {/* KPI row — real per-status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.key} className="card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-fg-muted text-xs font-medium">
              <span>{k.icon}</span>{k.label}
            </div>
            {counts ? (
              <p className="text-2xl font-bold text-fg mt-1.5" style={{ fontFamily: 'Sora, sans-serif' }}>
                {counts[k.key].toLocaleString()}
              </p>
            ) : (
              <Skeleton height={28} width="60%" className="mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Status filters + search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusClick(s)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                statusFilter === s ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {s === 'ALL' ? 'All Statuses' : STATUS_META[s].label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter this page by title or brand…"
          className="px-3.5 py-2 rounded-xl text-sm bg-surface-2 border text-fg placeholder:text-fg-muted w-full sm:w-72"
          style={{ borderColor: 'var(--border)' }}
        />
      </div>

      {/* Campaign table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 980 }}>
            <thead>
              <tr
                className="text-xs uppercase tracking-wider font-semibold text-fg-muted"
                style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
              >
                <th className="px-4 py-3 text-left min-w-[240px]">Campaign</th>
                <th className="px-3 py-3 text-left">Brand</th>
                <th className="px-3 py-3 text-left">Platforms</th>
                <th className="px-3 py-3 text-right">Budget</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Created</th>
                <th className="px-3 py-3 text-left">Deadline</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4"><SkeletonRow /></td></tr>
                ))
              ) : loadError ? (
                <tr><td colSpan={8}>
                  <EmptyState icon="⚠️" title="Couldn't load campaigns" message="Something went wrong while fetching campaigns. Please try again." />
                </td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon="🔍" title="No campaigns found" message="Try a different status filter or search term." />
                </td></tr>
              ) : (
                visible.map((c) => {
                  const statusMeta = STATUS_META[c.status] ?? STATUS_META.DRAFT;
                  const platforms = Array.isArray(c.platforms) ? c.platforms : [];
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-fg font-medium truncate">{c.title}</p>
                          <p className="text-fg-muted text-xs truncate">
                            {OBJECTIVE_LABELS[c.objective] ?? c.objective ?? '—'}
                            {c.niche ? ` · ${NICHE_LABELS[c.niche] ?? c.niche}` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-fg">{c.brand?.companyName ?? '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {platforms.length === 0
                            ? <span className="text-fg-muted">—</span>
                            : platforms.map((p) => (
                                <Badge key={p} variant="neutral" label={PLATFORM_LABELS[p] ?? p} />
                              ))
                          }
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-fg whitespace-nowrap">{budgetLabel(c)}</td>
                      <td className="px-3 py-3"><Badge variant={statusMeta.variant} label={statusMeta.label} dot /></td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{formatDate(c.createdAt)}</td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{formatDate(c.deadline)}</td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="xs" onClick={() => setSelected(c)}>View</Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap text-sm text-fg-muted">
          <span>
            Page {meta.page} of {meta.pages || 1} · {meta.total.toLocaleString()} campaign{meta.total === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.pages ? page >= meta.pages : true}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Campaign detail drawer — real fields only, view-only */}
      <Drawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        size="xl"
        icon="📋"
        title={selected?.title}
        subtitle={selected ? `${selected.brand?.companyName ?? 'Unknown brand'} · ${formatDate(selected.createdAt)}` : ''}
        headerExtra={selected && (
          <Badge
            variant={(STATUS_META[selected.status] ?? STATUS_META.DRAFT).variant}
            label={(STATUS_META[selected.status] ?? STATUS_META.DRAFT).label}
            dot
          />
        )}
      >
        {selected && (
          <div className="p-5 space-y-5">
            <p className="text-sm text-fg-muted leading-relaxed">{selected.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Objective', value: OBJECTIVE_LABELS[selected.objective] ?? selected.objective ?? '—' },
                { label: 'Niche', value: NICHE_LABELS[selected.niche] ?? selected.niche ?? '—' },
                { label: 'Content Type', value: selected.contentType ?? '—' },
                { label: 'Budget Type', value: selected.budgetType ?? '—' },
                { label: 'Budget', value: budgetLabel(selected) },
                { label: 'Target Location', value: selected.targetLocation ?? '—' },
                { label: 'Follower Range', value: (selected.followerMin || selected.followerMax) ? `${(selected.followerMin ?? 0).toLocaleString()} – ${(selected.followerMax ?? 0).toLocaleString()}` : '—' },
                { label: 'Min. Engagement', value: selected.engagementMin != null ? `${selected.engagementMin}%` : '—' },
                { label: 'Start Date', value: formatDate(selected.startDate) },
                { label: 'Deadline', value: formatDate(selected.deadline) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Platforms</p>
              <div className="flex items-center gap-2 flex-wrap">
                {(selected.platforms ?? []).length === 0
                  ? <span className="text-sm text-fg-muted">—</span>
                  : selected.platforms.map((p) => <Badge key={p} variant="brand" label={PLATFORM_LABELS[p] ?? p} />)
                }
              </div>
            </div>

            {(selected.languages ?? []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Languages</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {selected.languages.map((l) => <Badge key={l} variant="neutral" label={l} />)}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Deliverables</p>
              <div className="flex items-center gap-2 flex-wrap">
                {DELIVERABLE_TYPES.filter((d) => (selected[d.key] ?? 0) > 0).length === 0
                  ? <span className="text-sm text-fg-muted">—</span>
                  : DELIVERABLE_TYPES.filter((d) => (selected[d.key] ?? 0) > 0).map((d) => (
                      <Badge key={d.key} variant="brand" label={`${d.label}: ${selected[d.key]}`} />
                    ))
                }
              </div>
            </div>

            {selected.requirements && (
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Requirements</p>
                <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-line">{selected.requirements}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
