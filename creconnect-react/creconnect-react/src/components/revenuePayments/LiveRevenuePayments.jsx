import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/api/admin.api';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import FinanceChart from '@/components/revenuePayments/FinanceChart';
import { formatCompactPKR, formatPKR } from '@/utils/formatters';
import {
  aggregateByBrand,
  aggregateByCreator,
  bucketPaymentsByMonth,
  brandNameOf,
  creatorNameOf,
  downloadCSV,
  formatDate,
  paymentStatusMeta,
  paymentsToCSV,
  summarizeByStatus,
} from '@/utils/revenuePaymentsHelpers';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'payouts', label: 'Creator Payouts', icon: '🎙️' },
  { id: 'spending', label: 'Brand Spending', icon: '🏢' },
  { id: 'escrow', label: 'Escrow & Disputes', icon: '🔒' },
];

const STATUS_COLORS = {
  PENDING:  '#94a3b8',
  ESCROW:   '#6d5cff',
  RELEASED: '#16b364',
  PAID:     '#10b981',
  DISPUTED: '#f0445f',
};

const KPI_ACCENTS = ['#6d5cff', '#16b364', '#857fff', '#f59e0b'];

function unwrapList(res) {
  return Array.isArray(res?.data) ? res.data : [];
}

function StatusBadge({ status }) {
  const meta = paymentStatusMeta(status);
  return <Badge variant={meta.variant} label={meta.label} dot />;
}

function OverviewTab({ revenue, payments, monthly, statusBreakdown }) {
  const chartData = monthly.map((m) => ({ label: m.label, released: m.total }));
  const totalReleased = monthly.reduce((s, m) => s + m.total, 0);
  const releasedPayments = payments.filter((p) => ['RELEASED', 'PAID'].includes(String(p.status).toUpperCase()));
  const maxStatusAmount = Math.max(...statusBreakdown.map((s) => s.amount), 1);
  const pieData = statusBreakdown.map((s) => ({
    name: s.label,
    value: s.amount,
    count: s.count,
    status: s.status,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Marketplace Volume', value: revenue?.gmv, icon: '💹' },
          { label: 'Platform Revenue', value: revenue?.platformRevenue, icon: '💰' },
          { label: 'Creator Earnings', value: revenue?.creatorEarnings, icon: '🎯' },
          { label: 'Escrow Balance', value: revenue?.escrowBalance, icon: '🔒' },
        ].map((k, i) => (
          <div key={k.label} className="card rounded-2xl p-4 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: KPI_ACCENTS[i % KPI_ACCENTS.length] }}
            />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-fg-muted">{k.label}</p>
                <p className="text-xl font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {formatCompactPKR(k.value ?? 0)}
                </p>
              </div>
              <span className="text-lg opacity-80">{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {chartData.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-fg-muted text-sm">No released payments yet to chart.</p>
            </div>
          ) : (
            <FinanceChart
              title="Released Payments"
              subtitle={`${formatCompactPKR(totalReleased)} total over ${chartData.length} month${chartData.length === 1 ? '' : 's'}`}
              data={chartData}
              series={[{ key: 'released', label: 'Released (PKR)', color: '#16b364' }]}
              height={280}
              type="area"
            />
          )}
        </div>

        <div className="card rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-fg mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            Payment Status
          </h4>
          <p className="text-xs text-fg-muted mb-4">{payments.length} total transactions</p>
          {pieData.length === 0 ? (
            <p className="text-fg-muted text-sm">No payments recorded.</p>
          ) : (
            <>
              <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={2}
                      animationDuration={500}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCompactPKR(v)}
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {statusBreakdown.map((s) => (
                  <div key={s.status}>
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="flex items-center gap-2 min-w-0">
                        <StatusBadge status={s.status} />
                        <span className="text-fg-muted">×{s.count}</span>
                      </span>
                      <span className="text-fg font-medium flex-shrink-0">{formatCompactPKR(s.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((s.amount / maxStatusAmount) * 100)}%`,
                          background: STATUS_COLORS[s.status] || '#94a3b8',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              Recent Released Payments
            </h4>
            <p className="text-xs text-fg-muted mt-0.5">
              {releasedPayments.length} payment{releasedPayments.length === 1 ? '' : 's'} cleared
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl px-3 py-2 text-right" style={{ background: 'var(--surface-2)' }}>
              <p className="text-[10px] uppercase tracking-wide text-fg-muted">Released total</p>
              <p className="text-sm font-bold text-success" style={{ fontFamily: 'Sora, sans-serif' }}>
                {formatCompactPKR(releasedPayments.reduce((s, p) => s + Number(p.amountPKR || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        <PaymentsTable
          payments={releasedPayments
            .sort((a, b) => new Date(b.releasedAt || b.createdAt) - new Date(a.releasedAt || a.createdAt))
            .slice(0, 8)}
          emptyLabel="No released payments yet."
          compact
        />
      </div>
    </div>
  );
}

export default function LiveRevenuePayments() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      adminApi.getPayments({ limit: 100 }),
      adminApi.getRevenueSummary(),
    ])
      .then(([payRes, revRes]) => {
        if (cancelled) return;
        setPayments(unwrapList(payRes));
        setRevenue(revRes.data ?? revRes);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const creators = useMemo(() => aggregateByCreator(payments), [payments]);
  const brands = useMemo(() => aggregateByBrand(payments), [payments]);
  const disputed = useMemo(
    () => payments.filter((p) => String(p.status).toUpperCase() === 'DISPUTED'),
    [payments],
  );
  const escrow = useMemo(
    () => payments.filter((p) => String(p.status).toUpperCase() === 'ESCROW'),
    [payments],
  );
  const monthly = useMemo(() => bucketPaymentsByMonth(payments), [payments]);
  const statusBreakdown = useMemo(() => summarizeByStatus(payments), [payments]);

  async function handleResolveDispute(paymentId, resolution) {
    try {
      await adminApi.resolveDispute(paymentId, resolution);
      toast.success('Dispute updated.');
      const payRes = await adminApi.getPayments({ limit: 100 });
      setPayments(unwrapList(payRes));
      const revRes = await adminApi.getRevenueSummary();
      setRevenue(revRes.data ?? revRes);
    } catch (err) {
      toast.error(err?.message || 'Failed to resolve dispute.');
    }
  }

  function handleExport() {
    downloadCSV('creconnect-payments.csv', paymentsToCSV(payments));
    toast.success('Payments exported.');
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-danger text-sm">Could not load revenue data from the server.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Revenue &amp; Payments
          </h1>
          <Badge variant="success" label="Live data" />
        </div>
        <p className="text-fg-muted text-sm">Real payment records from the database.</p>
      </header>

      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        <Button variant="secondary" size="sm" className="ml-2" onClick={handleExport}>Export CSV</Button>
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          revenue={revenue}
          payments={payments}
          monthly={monthly}
          statusBreakdown={statusBreakdown}
        />
      )}

      {activeTab === 'transactions' && (
        <PaymentsTable payments={payments} />
      )}

      {activeTab === 'payouts' && (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                <th className="px-4 py-3 text-left">Creator</th>
                <th className="px-3 py-3 text-right">Campaigns</th>
                <th className="px-3 py-3 text-right">Earnings</th>
                <th className="px-3 py-3 text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              {creators.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-fg-muted">No creator payouts yet.</td></tr>
              ) : creators.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-fg">{c.name}</td>
                  <td className="px-3 py-3 text-right text-fg-muted">{c.campaigns}</td>
                  <td className="px-3 py-3 text-right text-fg">{formatPKR(c.totalEarnings)}</td>
                  <td className="px-3 py-3 text-right text-fg-muted">{formatPKR(c.pendingAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-3 py-3 text-right">Campaigns</th>
                <th className="px-3 py-3 text-right">Total spend</th>
                <th className="px-3 py-3 text-right">In escrow</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-fg-muted">No brand spending yet.</td></tr>
              ) : brands.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-fg">{b.name}</td>
                  <td className="px-3 py-3 text-right text-fg-muted">{b.campaigns}</td>
                  <td className="px-3 py-3 text-right text-fg">{formatPKR(b.totalSpend)}</td>
                  <td className="px-3 py-3 text-right text-fg-muted">{formatPKR(b.pendingSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'escrow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="card rounded-2xl p-4">
              <p className="text-xs text-fg-muted">In escrow ({escrow.length})</p>
              <p className="text-xl font-bold text-fg mt-1">{formatCompactPKR(revenue?.escrowBalance ?? 0)}</p>
            </div>
            <div className="card rounded-2xl p-4">
              <p className="text-xs text-fg-muted">Disputed ({disputed.length})</p>
              <p className="text-xl font-bold text-fg mt-1">
                {formatCompactPKR(disputed.reduce((s, p) => s + Number(p.amountPKR || 0), 0))}
              </p>
            </div>
          </div>
          {disputed.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-fg">Open disputes</h3>
              {disputed.map((p) => (
                <div key={p.id} className="card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-fg font-medium">{formatPKR(p.amountPKR)}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-fg-muted">
                      {brandNameOf(p.collaboration)} → {creatorNameOf(p.collaboration)}
                    </p>
                    {p.disputeReason && <p className="text-xs text-fg-muted mt-1">{p.disputeReason}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => handleResolveDispute(p.id, 'release')}>Release</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleResolveDispute(p.id, 'refund')}>Refund</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaymentsTable payments={escrow} emptyLabel="No funds in escrow." />
        </div>
      )}
    </div>
  );
}

function PaymentsTable({ payments, emptyLabel = 'No payments found.', compact = false }) {
  return (
    <div className={compact ? '' : 'card rounded-2xl overflow-hidden'}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr className="text-xs uppercase text-fg-muted" style={{ background: 'var(--surface-2)' }}>
              {!compact && <th className="px-4 py-3 text-left">ID</th>}
              <th className={`${compact ? 'px-4' : 'px-3'} py-3 text-left`}>Brand</th>
              <th className="px-3 py-3 text-left">Creator</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={compact ? 5 : 6} className="px-4 py-8 text-center text-fg-muted">{emptyLabel}</td>
              </tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-surface-2/50 transition-colors">
                {!compact && (
                  <td className="px-4 py-3 font-mono text-xs text-fg-muted">{String(p.id).slice(0, 8)}…</td>
                )}
                <td className={`${compact ? 'px-4' : 'px-3'} py-3 text-fg`}>{brandNameOf(p.collaboration)}</td>
                <td className="px-3 py-3 text-fg">{creatorNameOf(p.collaboration)}</td>
                <td className="px-3 py-3 text-right text-fg font-medium">{formatPKR(p.amountPKR)}</td>
                <td className="px-3 py-3 text-center">
                  <div className="flex justify-center">
                    <StatusBadge status={p.status} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right text-fg-muted text-xs">
                  {formatDate(p.releasedAt || p.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
