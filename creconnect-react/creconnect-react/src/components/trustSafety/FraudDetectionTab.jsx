import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import EmptyState from '@/components/common/EmptyState';
import EntityToolbar from '@/components/userIntelligence/EntityToolbar';
import FraudAlertCard from './FraudAlertCard';
import RiskBadge from './RiskBadge';
import {
  FRAUD_MONITOR_STATS, FRAUD_ALERTS, SUSPICIOUS_ACCOUNTS, AI_FRAUD_DETECTION,
  ACCOUNT_FILTER_OPTIONS, SEVERITY_META,
} from '@/utils/mockTrustSafety';
import { timeAgo } from '@/utils/formatters';

const BULK_ACTIONS = [
  { id: 'suspend', label: 'Suspend Users', icon: '🚫' },
  { id: 'flag', label: 'Flag for Review', icon: '🚩' },
  { id: 'export', label: 'Export Cases', icon: '⬇' },
];

const FILTERS = [
  { key: 'riskLevel', label: 'Risk Level', options: ACCOUNT_FILTER_OPTIONS.riskLevel },
  { key: 'userType', label: 'User Type', options: ACCOUNT_FILTER_OPTIONS.userType },
  { key: 'status', label: 'Status', options: ACCOUNT_FILTER_OPTIONS.status },
];

function defaultFilters() {
  return {
    riskLevel: ACCOUNT_FILTER_OPTIONS.riskLevel[0],
    userType: ACCOUNT_FILTER_OPTIONS.userType[0],
    status: ACCOUNT_FILTER_OPTIONS.status[0],
  };
}

const STATUS_VARIANT = { Active: 'success', Restricted: 'warning', Suspended: 'danger', 'Under Review': 'brand' };

function AiList({ title, icon, items, render }) {
  return (
    <div className="card rounded-2xl p-4">
      <h4 className="text-sm font-semibold text-fg mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
        <span>{icon}</span> {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-xs text-fg-muted">No items flagged.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => <li key={i}>{render(item)}</li>)}
        </ul>
      )}
    </div>
  );
}

/** Fraud Intelligence Center — fraud monitoring, alerts, AI predictions & suspicious accounts. */
export default function FraudDetectionTab() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return SUSPICIOUS_ACCOUNTS.filter((a) => {
      if (search && !`${a.user} ${a.reason}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.riskLevel !== ACCOUNT_FILTER_OPTIONS.riskLevel[0] && a.riskLevel !== filters.riskLevel.toLowerCase().replace(' risk', '')) return false;
      if (filters.userType !== ACCOUNT_FILTER_OPTIONS.userType[0] && a.userInfo.type !== filters.userType) return false;
      if (filters.status !== ACCOUNT_FILTER_OPTIONS.status[0] && a.status !== filters.status) return false;
      return true;
    });
  }, [search, filters]);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((a) => a.id)));
  }

  function exportCsv() {
    const rows = [
      ['User', 'Type', 'Risk Score', 'Reason', 'Violation Count', 'Last Activity', 'Status'],
      ...filtered.map((a) => [a.user, a.userInfo.type, a.riskScore, a.reason, a.violationCount, a.lastActivity, a.status]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a2 = document.createElement('a');
    a2.href = url;
    a2.download = 'suspicious-accounts.csv';
    a2.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Fraud monitor */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Fraud Monitor</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FRAUD_MONITOR_STATS.map((stat) => {
            const severity = SEVERITY_META[stat.severity] ?? SEVERITY_META.low;
            return (
              <div key={stat.id} className="card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{stat.icon}</span>
                  <Badge variant={severity.variant} label={severity.label} />
                </div>
                <p className="text-2xl font-bold text-fg mt-2" style={{ fontFamily: 'Sora, sans-serif' }}>{stat.detected}</p>
                <p className="text-xs text-fg-muted mt-0.5">{stat.label}</p>
                <p className={`text-xs mt-1 ${stat.trend >= 0 ? 'text-danger' : 'text-success'}`}>
                  {stat.trend >= 0 ? '▲' : '▼'} {Math.abs(stat.trend)}% this week
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fraud alerts */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Fraud Alerts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {FRAUD_ALERTS.map((alert) => <FraudAlertCard key={alert.id} alert={alert} />)}
        </div>
      </div>

      {/* AI Fraud Detection */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Fraud Detection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AiList
            title="Potential Fraud Cases"
            icon="🚨"
            items={AI_FRAUD_DETECTION.potentialFraudCases}
            render={(a) => (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-fg truncate">{a.user}</span>
                <RiskBadge level={a.riskLevel} />
              </div>
            )}
          />
          <AiList
            title="Likely Repeat Offenders"
            icon="🔁"
            items={AI_FRAUD_DETECTION.likelyRepeatOffenders}
            render={(a) => (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-fg truncate">{a.user}</span>
                <Badge variant="warning" label={`${a.violationCount} violations`} />
              </div>
            )}
          />
          <AiList
            title="Suspicious Growth Patterns"
            icon="📈"
            items={AI_FRAUD_DETECTION.suspiciousGrowthPatterns}
            render={(a) => (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-fg truncate">{a.userInfo.name}</span>
                <Badge variant="neutral" label={a.type} />
              </div>
            )}
          />
          <AiList
            title="Payment Abuse Risks"
            icon="💳"
            items={AI_FRAUD_DETECTION.paymentAbuseRisks}
            render={(a) => (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-fg truncate">{a.userInfo.name}</span>
                <Badge variant="danger" label={`Risk ${a.riskScore}`} />
              </div>
            )}
          />
        </div>
      </div>

      {/* Suspicious accounts table */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Suspicious Accounts</h3>
        <div className="space-y-4">
          <EntityToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search suspicious accounts by user or reason…"
            filters={FILTERS}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
            selectedCount={selected.length}
            bulkActions={BULK_ACTIONS}
            onBulkAction={() => setSelected([])}
            onExport={exportCsv}
          />

          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 1080 }}>
                <thead>
                  <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    <th className="px-4 py-3 text-left w-10">
                      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                    </th>
                    <th className="px-4 py-3 text-left min-w-[180px]">User</th>
                    <th className="px-3 py-3 text-left">Type</th>
                    <th className="px-3 py-3 text-center">Risk Score</th>
                    <th className="px-3 py-3 text-left min-w-[260px]">Reason</th>
                    <th className="px-3 py-3 text-center">Violations</th>
                    <th className="px-3 py-3 text-left">Last Activity</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9}><EmptyState icon="🔍" title="No suspicious accounts found" message="Try adjusting your search or filters." /></td></tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar initials={a.userInfo.initials} color={a.userInfo.color} size="xs" />
                            <span className="text-fg truncate">{a.user}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-fg-muted">{a.userInfo.type}</td>
                        <td className="px-3 py-3 text-center"><RiskBadge level={a.riskLevel} /></td>
                        <td className="px-3 py-3 text-fg-muted">{a.reason}</td>
                        <td className="px-3 py-3 text-center text-fg">{a.violationCount}</td>
                        <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{timeAgo(a.lastActivity)} ago</td>
                        <td className="px-3 py-3"><Badge variant={STATUS_VARIANT[a.status] ?? 'neutral'} label={a.status} dot /></td>
                        <td className="px-3 py-3 text-right">
                          <button type="button" className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">Investigate →</button>
                        </td>
                      </tr>
                    ))
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
