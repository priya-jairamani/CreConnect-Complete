import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonRow } from '@/components/common/Skeleton';
import EntityToolbar from '@/components/userIntelligence/EntityToolbar';
import CampaignRiskBadge from './CampaignRiskBadge';
import { CAMPAIGNS, FILTER_OPTIONS, STATUS_META } from '@/utils/mockCampaignIntelligence';
import { formatCompactPKR } from '@/utils/formatters';

function scoreColor(value) {
  if (value >= 80) return 'var(--success)';
  if (value >= 60) return 'var(--brand-500)';
  if (value >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

function ScoreChip({ value, suffix = '' }) {
  const color = scoreColor(value);
  return (
    <span
      className="inline-flex items-center justify-center px-2 h-7 rounded-lg text-xs font-bold whitespace-nowrap"
      style={{ background: `${color}1f`, color }}
    >
      {value}{suffix}
    </span>
  );
}

const BULK_ACTIONS = [
  { id: 'pause', label: 'Pause', icon: '⏸️' },
  { id: 'archive', label: 'Archive', icon: '🗄️' },
  { id: 'export', label: 'Export Reports', icon: '⬇' },
  { id: 'assign_manager', label: 'Assign Manager', icon: '🧑‍💼' },
  { id: 'notify', label: 'Send Notification', icon: '📣' },
];

const FILTERS = [
  { key: 'status', label: 'Status', options: FILTER_OPTIONS.status },
  { key: 'industry', label: 'Industry', options: FILTER_OPTIONS.industry },
  { key: 'budget', label: 'Budget', options: FILTER_OPTIONS.budget },
  { key: 'type', label: 'Type', options: FILTER_OPTIONS.type },
  { key: 'creatorCount', label: 'Creators', options: FILTER_OPTIONS.creatorCount },
  { key: 'risk', label: 'Risk', options: FILTER_OPTIONS.risk },
  { key: 'performance', label: 'Performance', options: FILTER_OPTIONS.performance },
];

function defaultFilters() {
  return {
    status: FILTER_OPTIONS.status[0],
    industry: FILTER_OPTIONS.industry[0],
    budget: FILTER_OPTIONS.budget[0],
    type: FILTER_OPTIONS.type[0],
    creatorCount: FILTER_OPTIONS.creatorCount[0],
    risk: FILTER_OPTIONS.risk[0],
    performance: FILTER_OPTIONS.performance[0],
  };
}

function matchesBudget(budget, bucket) {
  if (bucket.startsWith('Any')) return true;
  if (bucket === 'Under 250K') return budget < 250_000;
  if (bucket === '250K - 750K') return budget >= 250_000 && budget < 750_000;
  if (bucket === '750K - 1.5M') return budget >= 750_000 && budget < 1_500_000;
  return budget >= 1_500_000;
}

function matchesCreatorCount(count, bucket) {
  if (bucket.startsWith('Any')) return true;
  if (bucket === '1-3 Creators') return count >= 1 && count <= 3;
  if (bucket === '4-8 Creators') return count >= 4 && count <= 8;
  if (bucket === '9-15 Creators') return count >= 9 && count <= 15;
  return count >= 16;
}

function matchesPerformance(score, bucket) {
  if (bucket.startsWith('Any')) return true;
  if (bucket === 'Below 50') return score < 50;
  if (bucket === '50-70') return score >= 50 && score < 70;
  if (bucket === '70-85') return score >= 70 && score < 85;
  return score >= 85;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Active Campaigns — enterprise campaign operations table with filters, bulk actions & drill-down. */
export default function ActiveCampaignsTab({ isLoading, onSelectCampaign, onAction }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return CAMPAIGNS.filter((c) => {
      if (search && !`${c.name} ${c.brand} ${c.id}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.status !== FILTER_OPTIONS.status[0] && c.activeStatus !== filters.status.toLowerCase()) return false;
      if (filters.industry !== FILTER_OPTIONS.industry[0] && c.industry !== filters.industry) return false;
      if (filters.type !== FILTER_OPTIONS.type[0] && c.type !== filters.type) return false;
      if (filters.risk !== FILTER_OPTIONS.risk[0] && c.riskLevel !== filters.risk.toLowerCase()) return false;
      if (!matchesBudget(c.budget, filters.budget)) return false;
      if (!matchesCreatorCount(c.creatorCount, filters.creatorCount)) return false;
      if (!matchesPerformance(c.healthScore, filters.performance)) return false;
      return true;
    });
  }, [search, filters]);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((c) => c.id)));
  }

  function handleBulkAction(actionId) {
    onAction?.(actionId, selected.map((id) => CAMPAIGNS.find((c) => c.id === id)).filter(Boolean));
    setSelected([]);
  }

  function exportCsv() {
    const rows = [
      ['Campaign', 'Brand', 'Industry', 'Budget', 'Creators', 'Applications', 'Status', 'Progress', 'ROI', 'Health Score', 'Risk Level', 'Created', 'Deadline'],
      ...filtered.map((c) => [c.name, c.brand, c.industry, c.budget, c.creatorCount, c.applications, c.activeStatus, `${c.progress}%`, `${c.roi}%`, c.healthScore, c.riskLevel, c.createdDate, c.deadline]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <EntityToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search campaigns by name, brand or ID…"
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
        selectedCount={selected.length}
        bulkActions={BULK_ACTIONS}
        onBulkAction={handleBulkAction}
        onExport={exportCsv}
      />

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 1440 }}>
            <thead>
              <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3 text-left min-w-[220px]">Campaign</th>
                <th className="px-3 py-3 text-left">Brand</th>
                <th className="px-3 py-3 text-left">Industry</th>
                <th className="px-3 py-3 text-right">Budget</th>
                <th className="px-3 py-3 text-center">Creators</th>
                <th className="px-3 py-3 text-center">Applications</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left min-w-[120px]">Progress</th>
                <th className="px-3 py-3 text-center">ROI</th>
                <th className="px-3 py-3 text-center">Health</th>
                <th className="px-3 py-3 text-left">Risk</th>
                <th className="px-3 py-3 text-left">Created</th>
                <th className="px-3 py-3 text-left">Deadline</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={14} className="px-4"><SkeletonRow /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={14}><EmptyState icon="🔍" title="No campaigns found" message="Try adjusting your search or filters." /></td></tr>
              ) : (
                filtered.map((c) => {
                  const statusMeta = STATUS_META[c.activeStatus] ?? STATUS_META.active;
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={() => onSelectCampaign(c)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-fg font-medium truncate">{c.name}</p>
                          <p className="text-fg-muted text-xs truncate">{c.id} · {c.type}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-fg">{c.brand}</td>
                      <td className="px-3 py-3 text-fg-muted">{c.industry}</td>
                      <td className="px-3 py-3 text-right text-fg whitespace-nowrap">{formatCompactPKR(c.budget)}</td>
                      <td className="px-3 py-3 text-center text-fg">{c.creatorCount}</td>
                      <td className="px-3 py-3 text-center text-fg">{c.applications}</td>
                      <td className="px-3 py-3"><Badge variant={statusMeta.variant} label={statusMeta.label} dot /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden min-w-[60px]">
                            <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className="text-xs text-fg-muted w-9 text-right">{c.progress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={c.roi} suffix="%" /></td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={c.healthScore} /></td>
                      <td className="px-3 py-3"><CampaignRiskBadge level={c.riskLevel} /></td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{formatDate(c.createdDate)}</td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{formatDate(c.deadline)}</td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="xs" onClick={() => onSelectCampaign(c)}>View</Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
