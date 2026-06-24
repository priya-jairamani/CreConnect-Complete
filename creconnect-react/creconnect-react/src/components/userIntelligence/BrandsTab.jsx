import { useMemo, useState } from 'react';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonRow } from '@/components/common/Skeleton';
import VerificationBadge from './VerificationBadge';
import RiskIndicator from './RiskIndicator';
import EntityToolbar from './EntityToolbar';
import { BRANDS, FILTER_OPTIONS, STATUS_META } from '@/utils/mockUserIntelligence';
import { formatPKR, timeAgo } from '@/utils/formatters';

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
  { key: 'industry', label: 'Industry', options: FILTER_OPTIONS.industry },
  { key: 'country', label: 'Country', options: FILTER_OPTIONS.country },
];

function defaultFilters() {
  return {
    status: FILTER_OPTIONS.status[0],
    verification: FILTER_OPTIONS.verification[0],
    risk: FILTER_OPTIONS.risk[0],
    industry: FILTER_OPTIONS.industry[0],
    country: FILTER_OPTIONS.country[0],
  };
}

/** Brands tab — advanced brand intelligence table with filters, bulk actions & drill-down. */
export default function BrandsTab({ isLoading, onSelectBrand, onAction }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return BRANDS.filter((b) => {
      if (search && !`${b.companyName} ${b.industry}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.status !== FILTER_OPTIONS.status[0] && b.status !== filters.status.toLowerCase()) return false;
      if (filters.verification !== FILTER_OPTIONS.verification[0]) {
        const v = filters.verification.toLowerCase().replace(' ', '_');
        if (b.verification !== v) return false;
      }
      if (filters.risk !== FILTER_OPTIONS.risk[0] && b.riskLevel !== filters.risk.toLowerCase()) return false;
      if (filters.industry !== FILTER_OPTIONS.industry[0] && b.industry !== filters.industry) return false;
      if (filters.country !== FILTER_OPTIONS.country[0] && b.country !== filters.country) return false;
      return true;
    });
  }, [search, filters]);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((b) => b.id)));
  }

  function handleBulkAction(actionId) {
    onAction?.(actionId, selected.map((id) => BRANDS.find((b) => b.id === id)).filter(Boolean));
    setSelected([]);
  }

  function exportCsv() {
    const rows = [
      ['Company', 'Industry', 'Trust Score', 'Campaigns', 'Creator Satisfaction', 'Payment Reliability', 'Total Spend', 'Status', 'Verification', 'Risk Level'],
      ...filtered.map((b) => [b.companyName, b.industry, b.trustScore, b.campaigns, b.creatorSatisfaction, b.paymentReliability, b.totalSpend, b.status, b.verification, b.riskLevel]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brands-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <EntityToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brands by company name or industry…"
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
          <table className="w-full text-sm" style={{ minWidth: 1180 }}>
            <thead>
              <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3 text-left min-w-[220px]">Brand</th>
                <th className="px-3 py-3 text-left">Industry</th>
                <th className="px-3 py-3 text-center">Trust Score</th>
                <th className="px-3 py-3 text-right">Campaigns</th>
                <th className="px-3 py-3 text-center">Creator Satisfaction</th>
                <th className="px-3 py-3 text-center">Payment Reliability</th>
                <th className="px-3 py-3 text-right">Total Spend</th>
                <th className="px-3 py-3 text-left">Verification</th>
                <th className="px-3 py-3 text-left">Status</th>
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
                <tr><td colSpan={13}><EmptyState icon="🔍" title="No brands found" message="Try adjusting your search or filters." /></td></tr>
              ) : (
                filtered.map((b) => {
                  const statusMeta = STATUS_META[b.status] ?? STATUS_META.active;
                  return (
                    <tr
                      key={b.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={() => onSelectBrand(b)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar initials={getInitials(b.companyName)} size="sm" color="#4c2dd1" />
                          <div className="min-w-0">
                            <p className="text-fg font-medium truncate">{b.companyName}</p>
                            <p className="text-fg-muted text-xs truncate">{b.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-fg-muted">{b.industry}</td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={b.trustScore} /></td>
                      <td className="px-3 py-3 text-right text-fg">{b.campaigns}</td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={b.creatorSatisfaction} /></td>
                      <td className="px-3 py-3 text-center"><ScoreChip value={b.paymentReliability} /></td>
                      <td className="px-3 py-3 text-right text-fg">{formatPKR(b.totalSpend)}</td>
                      <td className="px-3 py-3"><VerificationBadge status={b.verification} /></td>
                      <td className="px-3 py-3"><Badge variant={statusMeta.variant} label={statusMeta.label} dot /></td>
                      <td className="px-3 py-3"><RiskIndicator level={b.riskLevel} /></td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{timeAgo(b.lastActive)} ago</td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="xs" onClick={() => onSelectBrand(b)}>View</Button>
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
