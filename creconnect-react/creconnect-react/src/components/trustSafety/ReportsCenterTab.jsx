import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import EmptyState from '@/components/common/EmptyState';
import EntityToolbar from '@/components/userIntelligence/EntityToolbar';
import RiskBadge from './RiskBadge';
import { REPORTS, FILTER_OPTIONS, SEVERITY_META, REPORT_STATUS_META } from '@/utils/mockTrustSafety';

const BULK_ACTIONS = [
  { id: 'suspend', label: 'Suspend Users', icon: '🚫' },
  { id: 'approve_appeals', label: 'Approve Appeals', icon: '✅' },
  { id: 'assign_moderators', label: 'Assign Moderators', icon: '🧑‍💼' },
  { id: 'resolve', label: 'Resolve Reports', icon: '🗂️' },
  { id: 'export', label: 'Export Cases', icon: '⬇' },
];

const FILTERS = [
  { key: 'severity', label: 'Severity', options: FILTER_OPTIONS.severity },
  { key: 'riskLevel', label: 'Risk Level', options: FILTER_OPTIONS.riskLevel },
  { key: 'category', label: 'Category', options: FILTER_OPTIONS.category },
  { key: 'status', label: 'Status', options: FILTER_OPTIONS.status },
  { key: 'moderator', label: 'Moderator', options: FILTER_OPTIONS.moderator },
  { key: 'dateRange', label: 'Date Range', options: FILTER_OPTIONS.dateRange },
  { key: 'userType', label: 'User Type', options: FILTER_OPTIONS.userType },
];

function defaultFilters() {
  return {
    severity: FILTER_OPTIONS.severity[0],
    riskLevel: FILTER_OPTIONS.riskLevel[0],
    category: FILTER_OPTIONS.category[0],
    status: FILTER_OPTIONS.status[0],
    moderator: FILTER_OPTIONS.moderator[0],
    dateRange: FILTER_OPTIONS.dateRange[0],
    userType: FILTER_OPTIONS.userType[0],
  };
}

function matchesDateRange(createdDate, bucket) {
  if (bucket === 'All Time') return true;
  const days = (Date.now() - new Date(createdDate).getTime()) / 86_400_000;
  if (bucket === 'Last 7 Days') return days <= 7;
  if (bucket === 'Last 30 Days') return days <= 30;
  return days <= 90;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusKey(label) {
  return label.toLowerCase().replace(/\s+/g, '_');
}

/** Reports Center — advanced report management table with case detail drill-down. */
export default function ReportsCenterTab({ onSelectReport }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      if (search && !`${r.id} ${r.reporter} ${r.reported} ${r.category}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.severity !== FILTER_OPTIONS.severity[0] && r.severity !== filters.severity.toLowerCase()) return false;
      if (filters.riskLevel !== FILTER_OPTIONS.riskLevel[0] && r.accountRisk !== filters.riskLevel.toLowerCase().replace(' risk', '')) return false;
      if (filters.category !== FILTER_OPTIONS.category[0] && r.category !== filters.category) return false;
      if (filters.status !== FILTER_OPTIONS.status[0] && r.status !== statusKey(filters.status)) return false;
      if (filters.moderator !== FILTER_OPTIONS.moderator[0] && r.assignedModerator !== filters.moderator) return false;
      if (filters.userType !== FILTER_OPTIONS.userType[0] && r.userType !== filters.userType) return false;
      if (!matchesDateRange(r.createdDate, filters.dateRange)) return false;
      return true;
    });
  }, [search, filters]);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((r) => r.id)));
  }

  function handleBulkAction() {
    setSelected([]);
  }

  function exportCsv() {
    const rows = [
      ['Report ID', 'Reporter', 'Reported User', 'User Type', 'Violation Category', 'Severity', 'Status', 'Created Date', 'Risk Score', 'Assigned Moderator'],
      ...filtered.map((r) => [r.id, r.reporter, r.reported, r.userType, r.category, r.severity, r.status, r.createdDate, r.riskScore, r.assignedModerator]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trust-safety-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <EntityToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reports by ID, reporter, reported user or category…"
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
                <th className="px-4 py-3 text-left min-w-[120px]">Report ID</th>
                <th className="px-3 py-3 text-left min-w-[160px]">Reporter</th>
                <th className="px-3 py-3 text-left min-w-[160px]">Reported User</th>
                <th className="px-3 py-3 text-left">User Type</th>
                <th className="px-3 py-3 text-left min-w-[160px]">Violation Category</th>
                <th className="px-3 py-3 text-left">Severity</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Created</th>
                <th className="px-3 py-3 text-center">Risk Score</th>
                <th className="px-3 py-3 text-left">Moderator</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={12}><EmptyState icon="🔍" title="No reports found" message="Try adjusting your search or filters." /></td></tr>
              ) : (
                filtered.map((r) => {
                  const severity = SEVERITY_META[r.severity] ?? SEVERITY_META.low;
                  const status = REPORT_STATUS_META[r.status] ?? REPORT_STATUS_META.new;
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={() => onSelectReport(r)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                      </td>
                      <td className="px-4 py-3 text-fg font-medium whitespace-nowrap">{r.id}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar initials={r.reporterInfo.initials} color={r.reporterInfo.color} size="xs" />
                          <span className="text-fg truncate">{r.reporter}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar initials={r.reportedInfo.initials} color={r.reportedInfo.color} size="xs" />
                          <span className="text-fg truncate">{r.reported}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-fg-muted">{r.userType}</td>
                      <td className="px-3 py-3 text-fg-muted">{r.category}</td>
                      <td className="px-3 py-3"><Badge variant={severity.variant} label={severity.label} /></td>
                      <td className="px-3 py-3"><Badge variant={status.variant} label={status.label} dot /></td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{formatDate(r.createdDate)}</td>
                      <td className="px-3 py-3 text-center"><RiskBadge level={r.accountRisk} /></td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{r.assignedModerator}</td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="xs" onClick={() => onSelectReport(r)}>Review</Button>
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
