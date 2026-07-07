import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import EntityToolbar from '@/components/userIntelligence/EntityToolbar';
import { timeAgo } from '@/utils/formatters';
import {
  SUPPORT_CATEGORIES, TICKETS, TICKET_STATUS_META, TICKET_PRIORITY_META, SLA_META,
  TICKET_FILTERS, TICKET_BULK_ACTIONS,
} from '@/utils/mockOperations';

/** Enterprise support management — category overview, support dashboard & ticket workspace. */
export default function SupportHubTab({
  tickets: ticketsProp,
  metrics,
  loading = false,
  error = false,
  onRetry,
  onSelectTicket,
  onBulkAction,
  onExport,
}) {
  const tickets = ticketsProp ?? TICKETS;
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({ category: 'All', priority: 'All', status: 'All', sla: 'All' });
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    let rows = tickets;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        (t.rawId && t.rawId.toLowerCase().includes(q)) ||
        t.subject.toLowerCase().includes(q) ||
        t.user.toLowerCase().includes(q) ||
        t.agent.toLowerCase().includes(q)
      );
    }
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value || value === 'All') return;
      rows = rows.filter((t) => t[key] === value);
    });
    return rows;
  }, [tickets, search, filterValues]);

  function toggleRow(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((t) => t.rawId ?? t.id)));
  }

  function handleBulkAction(actionId) {
    onBulkAction?.(actionId, selected);
    setSelected([]);
  }

  const categories = useMemo(() => {
    const fromData = [...new Set(tickets.map((t) => t.category))].filter(Boolean);
    return fromData.length ? fromData : SUPPORT_CATEGORIES;
  }, [tickets]);

  const categoryCounts = categories.map((cat) => ({
    category: cat,
    count: tickets.filter((t) => t.category === cat && !['resolved', 'closed'].includes(t.status)).length,
  }));

  const dashboardMetrics = metrics ?? {
    openTickets: tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length,
    pendingResponses: tickets.filter((t) => t.status === 'open').length,
    escalatedCases: tickets.filter((t) => t.priority === 'urgent').length,
    resolvedToday: tickets.filter((t) => t.status === 'resolved').length,
    avgResponseTimeMin: '—',
    csat: '—',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card rounded-2xl p-8 text-center space-y-3">
        <p className="text-danger text-sm">Could not load support tickets from the server.</p>
        {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Support Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoryCounts.map((c) => (
            <div key={c.category} className="card rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{c.count}</p>
              <p className="text-xs text-fg-muted leading-tight mt-1">{c.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Support Dashboard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: 'Open Tickets', value: dashboardMetrics.openTickets },
            { label: 'Pending Responses', value: dashboardMetrics.pendingResponses },
            { label: 'Escalated Cases', value: dashboardMetrics.escalatedCases },
            { label: 'Resolved Today', value: dashboardMetrics.resolvedToday },
            { label: 'Avg. Response Time', value: typeof dashboardMetrics.avgResponseTimeMin === 'number' ? `${dashboardMetrics.avgResponseTimeMin}m` : dashboardMetrics.avgResponseTimeMin },
            { label: 'Customer Satisfaction', value: typeof dashboardMetrics.csat === 'number' ? `${dashboardMetrics.csat}/5` : dashboardMetrics.csat },
          ].map((m) => (
            <div key={m.label} className="card rounded-2xl p-4">
              <p className="text-xs text-fg-muted">{m.label}</p>
              <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Support Workspace</h3>
        <div className="space-y-4">
          <EntityToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by ticket ID, subject, user or agent…"
            filters={TICKET_FILTERS}
            filterValues={filterValues}
            onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
            selectedCount={selected.length}
            bulkActions={TICKET_BULK_ACTIONS}
            onBulkAction={handleBulkAction}
            onExport={onExport}
          />

          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 1000 }}>
                <thead>
                  <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
                    </th>
                    <th className="px-3 py-3 text-left">Ticket</th>
                    <th className="px-3 py-3 text-left">User</th>
                    <th className="px-3 py-3 text-left">Category</th>
                    <th className="px-3 py-3 text-center">Priority</th>
                    <th className="px-3 py-3 text-left">Assigned Agent</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Created</th>
                    <th className="px-3 py-3 text-center">SLA</th>
                    <th className="px-3 py-3 text-center">Satisfaction</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const rowId = t.rawId ?? t.id;
                    const status = TICKET_STATUS_META[t.status] ?? TICKET_STATUS_META.open;
                    const priority = TICKET_PRIORITY_META[t.priority] ?? TICKET_PRIORITY_META.medium;
                    const sla = SLA_META[t.sla] ?? SLA_META.on_track;
                    return (
                      <tr key={rowId} style={{ borderTop: '1px solid var(--border)' }}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.includes(rowId)} onChange={() => toggleRow(rowId)} />
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-fg font-medium whitespace-nowrap">{t.id}</p>
                          <p className="text-xs text-fg-muted truncate max-w-[200px]">{t.subject}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar initials={t.userInitials} color={t.userColor} size="xs" />
                            <span className="text-fg whitespace-nowrap">{t.user}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{t.category}</td>
                        <td className="px-3 py-3 text-center"><Badge variant={priority.variant} label={priority.label} /></td>
                        <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{t.agent}</td>
                        <td className="px-3 py-3 text-center"><Badge variant={status.variant} label={status.label} dot /></td>
                        <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{timeAgo(t.created)} ago</td>
                        <td className="px-3 py-3 text-center"><Badge variant={sla.variant} label={sla.label} /></td>
                        <td className="px-3 py-3 text-center text-fg-muted">{t.satisfaction ? `${t.satisfaction}/5` : '—'}</td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => onSelectTicket?.(t)}
                            className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg transition-colors whitespace-nowrap"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-fg-muted">No tickets match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SupportHubTab.propTypes = {
  tickets:        PropTypes.array,
  metrics:        PropTypes.object,
  loading:        PropTypes.bool,
  error:          PropTypes.bool,
  onRetry:        PropTypes.func,
  onSelectTicket: PropTypes.func,
  onBulkAction:   PropTypes.func,
  onExport:       PropTypes.func,
};
