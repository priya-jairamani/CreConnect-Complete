import { useMemo, useState } from 'react';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonRow } from '@/components/common/Skeleton';
import VerificationBadge from './VerificationBadge';
import RiskIndicator from './RiskIndicator';
import EntityToolbar from './EntityToolbar';
import { CREATORS, FILTER_OPTIONS, STATUS_META } from '@/utils/mockUserIntelligence';
import { formatFollowers, formatEngagement, formatPKR, timeAgo } from '@/utils/formatters';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function scoreColor(value) {
  if (value >= 80) return 'var(--success)';
  if (value >= 60) return 'var(--brand-500)';
  if (value >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

function ScoreChip({ value }) {
  const color = scoreColor(value);
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-7 rounded-lg text-xs font-bold"
      style={{ background: `${color}1f`, color }}
    >
      {value}
    </span>
  );
}

const BULK_ACTIONS = [
  { id: 'verify', label: 'Verify', icon: '✅' },
  { id: 'suspend', label: 'Suspend', icon: '⛔' },
  { id: 'activate', label: 'Activate', icon: '✔️' },
  { id: 'export', label: 'Export', icon: '⬇' },
  { id: 'tag', label: 'Assign Tags', icon: '🏷️' },
];

const FILTERS = [
  { key: 'status', label: 'Status', options: FILTER_OPTIONS.status },
  { key: 'verification', label: 'Verification', options: FILTER_OPTIONS.verification },
  { key: 'risk', label: 'Risk', options: FILTER_OPTIONS.risk },
  { key: 'niche', label: 'Niche', options: FILTER_OPTIONS.niche },
  { key: 'country', label: 'Country', options: FILTER_OPTIONS.country },
  { key: 'engagement', label: 'Engagement', options: FILTER_OPTIONS.engagement },
  { key: 'followers', label: 'Followers', options: FILTER_OPTIONS.followers },
];

function defaultFilters() {
  return {
    status: FILTER_OPTIONS.status[0],
    verification: FILTER_OPTIONS.verification[0],
    risk: FILTER_OPTIONS.risk[0],
    niche: FILTER_OPTIONS.niche[0],
    country: FILTER_OPTIONS.country[0],
    engagement: FILTER_OPTIONS.engagement[0],
    followers: FILTER_OPTIONS.followers[0],
  };
}

function matchesFollowers(followers, bucket) {
  if (bucket.startsWith('Any')) return true;
  if (bucket === '< 10K') return followers < 10_000;
  if (bucket === '10K–100K') return followers >= 10_000 && followers < 100_000;
  if (bucket === '100K–500K') return followers >= 100_000 && followers < 500_000;
  return followers >= 500_000;
}

function matchesEngagement(rate, bucket) {
  if (bucket.startsWith('Any')) return true;
  if (bucket === '0–2%') return rate < 2;
  if (bucket === '2–4%') return rate >= 2 && rate < 4;
  if (bucket === '4–6%') return rate >= 4 && rate < 6;
  return rate >= 6;
}

/** Creators tab — advanced intelligence table with filters, bulk actions & drill-down. */
export default function CreatorsTab({ isLoading, onSelectCreator, onAction }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return CREATORS.filter((c) => {
      if (search && !`${c.name} ${c.handle} ${c.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.status !== FILTER_OPTIONS.status[0] && c.status !== filters.status.toLowerCase()) return false;
      if (filters.verification !== FILTER_OPTIONS.verification[0]) {
        const v = filters.verification.toLowerCase().replace(' ', '_');
        if (c.verification !== v) return false;
      }
      if (filters.risk !== FILTER_OPTIONS.risk[0] && c.riskLevel !== filters.risk.toLowerCase()) return false;
      if (filters.niche !== FILTER_OPTIONS.niche[0] && c.niche !== filters.niche) return false;
      if (filters.country !== FILTER_OPTIONS.country[0] && c.country !== filters.country) return false;
      if (!matchesEngagement(c.engagementRate, filters.engagement)) return false;
      if (!matchesFollowers(c.followers, filters.followers)) return false;
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
    onAction?.(actionId, selected.map((id) => CREATORS.find((c) => c.id === id)).filter(Boolean));
    setSelected([]);
  }

  function exportCsv() {
    const rows = [
      ['Name', 'Handle', 'Email', 'Creator Score', 'Followers', 'Engagement Rate', 'Campaigns', 'Earnings', 'Status', 'Verification', 'Risk Level'],
      ...filtered.map((c) => [c.name, c.handle, c.email, c.creatorScore, c.followers, `${c.engagementRate}%`, c.campaigns, c.earnings, c.status, c.verification, c.riskLevel]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creators-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <EntityToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search creators by name, handle or email…"
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
          <table className="w-full text-sm" style={{ minWidth: 1280 }}>
            <thead>
              <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3 text-left min-w-[220px]">Profile</th>
                <th className="px-3 py-3 text-center">Creator Score</th>
                <th className="px-3 py-3 text-center">Authenticity</th>
                <th className="px-3 py-3 text-center">Audience Quality</th>
                <th className="px-3 py-3 text-right">Followers</th>
                <th className="px-3 py-3 text-right">Engagement</th>
                <th className="px-3 py-3 text-right">Campaigns</th>
                <th className="px-3 py-3 text-right">Earnings</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Verification</th>
                <th className="px-3 py-3 text-left">Risk Level</th>
                <th className="px-3 py-3 text-left">Last Active</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={13} className="px-4"><SkeletonRow /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={13}><EmptyState icon="🔍" title="No creators found" message="Try adjusting your search or filters." /></td></tr>
              ) : (
                filtered.map((c) => {
                  const statusMeta = STATUS_META[c.status] ?? STATUS_META.active;
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={() => onSelectCreator(c)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar initials={getInitials(c.name)} size="sm" />
                          <div className="min-w-0">
                            <p className="text-fg font-medium truncate">{c.name}</p>
                            <p className="text-fg-muted text-xs truncate">{c.handle} · {c.niche}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={c.creatorScore} /></td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={c.authenticityScore} /></td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={c.audienceQuality} /></td>
                      <td className="px-3 py-3 text-right text-fg">{formatFollowers(c.followers)}</td>
                      <td className="px-3 py-3 text-right text-fg">{formatEngagement(c.engagementRate / 100)}</td>
                      <td className="px-3 py-3 text-right text-fg">{c.campaigns}</td>
                      <td className="px-3 py-3 text-right text-fg">{formatPKR(c.earnings)}</td>
                      <td className="px-3 py-3"><Badge variant={statusMeta.variant} label={statusMeta.label} dot /></td>
                      <td className="px-3 py-3"><VerificationBadge status={c.verification} /></td>
                      <td className="px-3 py-3"><RiskIndicator level={c.riskLevel} /></td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{timeAgo(c.lastActive)} ago</td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="xs" onClick={() => onSelectCreator(c)}>View</Button>
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
