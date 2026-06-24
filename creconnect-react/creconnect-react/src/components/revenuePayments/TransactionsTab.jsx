import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import EntityToolbar from '@/components/userIntelligence/EntityToolbar';
import { formatPKR, timeAgo } from '@/utils/formatters';
import {
  TRANSACTIONS, TRANSACTION_STATUS_META, RISK_LEVEL_META, TRANSACTION_FILTERS, BULK_ACTIONS,
} from '@/utils/mockRevenuePayments';

/** Enterprise transaction management — searchable, filterable ledger with risk-aware detail drill-down. */
export default function TransactionsTab({ onSelectTransaction, onBulkAction, onExport }) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({ status: 'All', method: 'All', industry: 'All', campaignType: 'All', riskLevel: 'All' });
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    let rows = TRANSACTIONS;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        t.campaign.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        t.creator.toLowerCase().includes(q)
      );
    }
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value || value === 'All') return;
      rows = rows.filter((t) => t[key] === value);
    });
    return rows;
  }, [search, filterValues]);

  function toggleRow(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((t) => t.id)));
  }

  function handleBulkAction(actionId) {
    onBulkAction?.(actionId, selected);
    setSelected([]);
  }

  return (
    <div className="space-y-4">
      <EntityToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by transaction ID, campaign, brand or creator…"
        filters={TRANSACTION_FILTERS}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
        selectedCount={selected.length}
        bulkActions={BULK_ACTIONS}
        onBulkAction={handleBulkAction}
        onExport={onExport}
      />

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-3 py-3 text-left">Transaction</th>
                <th className="px-3 py-3 text-left">Campaign</th>
                <th className="px-3 py-3 text-left">Brand</th>
                <th className="px-3 py-3 text-left">Creator</th>
                <th className="px-3 py-3 text-right">Amount</th>
                <th className="px-3 py-3 text-right">Fee</th>
                <th className="px-3 py-3 text-right">Net</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Method</th>
                <th className="px-3 py-3 text-center">Date</th>
                <th className="px-3 py-3 text-center">Risk</th>
                <th className="px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const status = TRANSACTION_STATUS_META[t.status] ?? TRANSACTION_STATUS_META.pending;
                const risk = RISK_LEVEL_META[t.riskLevel] ?? RISK_LEVEL_META.low;
                return (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleRow(t.id)} />
                    </td>
                    <td className="px-3 py-3 text-fg font-medium whitespace-nowrap">{t.id}</td>
                    <td className="px-3 py-3 text-fg-muted truncate max-w-[180px]">{t.campaign}</td>
                    <td className="px-3 py-3 text-fg whitespace-nowrap">{t.brand}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={t.creatorInitials} color={t.creatorColor} size="xs" />
                        <span className="text-fg whitespace-nowrap">{t.creator}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-fg font-semibold whitespace-nowrap">{formatPKR(t.amount)}</td>
                    <td className="px-3 py-3 text-right text-fg-muted whitespace-nowrap">{formatPKR(t.fee)}</td>
                    <td className="px-3 py-3 text-right text-fg whitespace-nowrap">{formatPKR(t.net)}</td>
                    <td className="px-3 py-3 text-center"><Badge variant={status.variant} label={status.label} dot /></td>
                    <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{t.method}</td>
                    <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{timeAgo(t.date)} ago</td>
                    <td className="px-3 py-3 text-center"><Badge variant={risk.variant} label={risk.label} /></td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectTransaction?.(t)}
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
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-fg-muted">No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
