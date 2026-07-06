import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/api/admin.api';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import Skeleton from '@/components/common/Skeleton';
import Drawer from '@/components/common/Drawer';
import EmptyState from '@/components/common/EmptyState';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Reports', icon: '📥' },
  { id: 'open', label: 'Open', icon: '🕒' },
  { id: 'resolved', label: 'Resolved', icon: '✅' },
  { id: 'dismissed', label: 'Dismissed', icon: '🗂️' },
];

const KPI_TILES = [
  { key: 'total', label: 'Total Reports', icon: '📥', accent: '#22c1ff' },
  { key: 'open', label: 'Open Reports', icon: '🕒', accent: '#f59e0b' },
  { key: 'resolved', label: 'Resolved', icon: '✅', accent: '#16b364' },
  { key: 'dismissed', label: 'Dismissed', icon: '🗂️', accent: '#857fff' },
];

function displayName(user) {
  return (
    user?.creatorProfile?.displayName ||
    user?.brandProfile?.companyName ||
    user?.email ||
    'Unknown'
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatViolation(type) {
  return type ? type.replace(/_/g, ' ') : 'Other';
}

function statusVariant(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN':      return 'warning';
    case 'RESOLVED':  return 'success';
    case 'DISMISSED': return 'neutral';
    default:          return 'neutral';
  }
}

export default function TrustSafety() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    adminApi
      .getReports()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setReports(list);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const counts = useMemo(() => {
    const open = reports.filter((r) => r.status?.toUpperCase() === 'OPEN').length;
    const resolved = reports.filter((r) => r.status?.toUpperCase() === 'RESOLVED').length;
    const dismissed = reports.filter((r) => r.status?.toUpperCase() === 'DISMISSED').length;
    return { total: reports.length, open, resolved, dismissed };
  }, [reports]);

  const violationBreakdown = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      const key = formatViolation(r.violationType);
      map[key] = (map[key] ?? 0) + 1;
    });
    const max = Math.max(1, ...Object.values(map));
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value, pct: Math.round((value / max) * 100) }));
  }, [reports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status?.toLowerCase() !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${displayName(r.reporter)} ${displayName(r.reportedUser)} ${r.violationType ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reports, statusFilter, search]);

  function openReport(report) {
    setSelectedReport(report);
    setResolution(report.resolution || '');
  }

  function closeDrawer() {
    setSelectedReport(null);
    setResolution('');
  }

  async function handleResolution(id, action) {
    setActionLoading(true);
    try {
      const fallback = action === 'resolve' ? 'Resolved by admin' : 'Dismissed by admin';
      await adminApi.resolveReport(id, action, { resolution: resolution.trim() || fallback });
      const newStatus = action === 'resolve' ? 'RESOLVED' : 'DISMISSED';
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: newStatus, resolution: resolution.trim() || fallback, resolvedAt: new Date().toISOString() }
            : r
        )
      );
      toast.success(`Report ${action === 'resolve' ? 'resolved' : 'dismissed'}.`);
      closeDrawer();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setActionLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Trust &amp; Safety
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Review user-submitted violation reports and take action to keep the platform safe.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reporter, reported user or violation type…"
          className="input-base text-sm rounded-xl px-3.5 py-2 w-full sm:w-80"
        />
      </header>

      {/* KPI tiles — derived from real report data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_TILES.map((tile) => (
          <div key={tile.key} className="card rounded-2xl p-5 flex flex-col gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${tile.accent}1f`, color: tile.accent }}
            >
              {tile.icon}
            </div>
            <div>
              {isLoading ? (
                <Skeleton height={28} width="50%" />
              ) : (
                <p
                  className="text-3xl text-fg font-700 leading-none"
                  style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}
                >
                  {counts[tile.key].toLocaleString()}
                </p>
              )}
              <p className="text-fg-muted text-sm mt-1.5">{tile.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Violation type breakdown — derived from real reports */}
      <div className="card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
          Reports by Violation Type
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={14} />)}
          </div>
        ) : violationBreakdown.length === 0 ? (
          <p className="text-sm text-fg-muted">No reports yet.</p>
        ) : (
          <div className="space-y-3">
            {violationBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-fg-muted capitalize">{item.label}</span>
                  <span className="text-fg font-medium">{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.pct}%`, background: 'var(--brand-500)', transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
        {STATUS_FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              statusFilter === tab.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report queue */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr
                className="text-xs uppercase tracking-wider font-semibold text-fg-muted"
                style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
              >
                <th className="px-4 py-3 text-left min-w-[160px]">Reporter</th>
                <th className="px-3 py-3 text-left min-w-[160px]">Reported User</th>
                <th className="px-3 py-3 text-left min-w-[140px]">Violation Type</th>
                <th className="px-3 py-3 text-left">Created</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3" colSpan={6}><Skeleton height={20} /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon="🔍" title="No reports found" message="Try adjusting your search or status filter." />
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                    style={{ borderTop: '1px solid var(--border)' }}
                    onClick={() => openReport(r)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar initials={displayName(r.reporter).slice(0, 2)} size="xs" />
                        <span className="text-fg truncate">{displayName(r.reporter)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar initials={displayName(r.reportedUser).slice(0, 2)} size="xs" />
                        <span className="text-fg truncate">{displayName(r.reportedUser)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-fg-muted capitalize">{formatViolation(r.violationType)}</td>
                    <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-3 py-3"><Badge variant={statusVariant(r.status)} label={r.status} dot /></td>
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {r.status?.toUpperCase() === 'OPEN' && (
                          <>
                            <Button variant="success" size="xs" disabled={actionLoading} onClick={() => handleResolution(r.id, 'resolve')}>
                              Resolve
                            </Button>
                            <Button variant="ghost" size="xs" disabled={actionLoading} onClick={() => handleResolution(r.id, 'dismiss')}>
                              Dismiss
                            </Button>
                          </>
                        )}
                        <Button variant="secondary" size="xs" onClick={() => openReport(r)}>View</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report detail drawer */}
      <Drawer
        isOpen={!!selectedReport}
        onClose={closeDrawer}
        size="xl"
        icon="📥"
        title={selectedReport ? formatViolation(selectedReport.violationType) : ''}
        subtitle={selectedReport ? `Reported ${formatDate(selectedReport.createdAt)}` : ''}
        headerExtra={selectedReport && <Badge variant={statusVariant(selectedReport.status)} label={selectedReport.status} dot />}
        footer={
          selectedReport?.status?.toUpperCase() === 'OPEN' && (
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" disabled={actionLoading} onClick={() => handleResolution(selectedReport.id, 'dismiss')}>
                Dismiss
              </Button>
              <Button variant="success" size="sm" disabled={actionLoading} onClick={() => handleResolution(selectedReport.id, 'resolve')}>
                Resolve
              </Button>
            </div>
          )
        }
      >
        {selectedReport && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                <Avatar initials={displayName(selectedReport.reporter).slice(0, 2)} size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">Reporter</p>
                  <p className="text-sm font-semibold text-fg truncate">{displayName(selectedReport.reporter)}</p>
                  <p className="text-xs text-fg-muted truncate">{selectedReport.reporter?.role ?? ''}</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                <Avatar initials={displayName(selectedReport.reportedUser).slice(0, 2)} size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">Reported User</p>
                  <p className="text-sm font-semibold text-fg truncate">{displayName(selectedReport.reportedUser)}</p>
                  <p className="text-xs text-fg-muted truncate">{selectedReport.reportedUser?.role ?? ''}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-fg leading-relaxed">{selectedReport.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">Violation Type</p>
                <p className="text-sm font-semibold text-fg mt-1 capitalize truncate">{formatViolation(selectedReport.violationType)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">Created</p>
                <p className="text-sm font-semibold text-fg mt-1 truncate">{formatDate(selectedReport.createdAt)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">Resolved</p>
                <p className="text-sm font-semibold text-fg mt-1 truncate">{formatDate(selectedReport.resolvedAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Resolution Notes</p>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Add resolution notes before resolving or dismissing…"
                rows={4}
                disabled={selectedReport.status?.toUpperCase() !== 'OPEN'}
                className="input-base w-full text-sm resize-none rounded-xl"
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
