import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import EscrowTracker from './EscrowTracker';
import { formatCompactPKR, formatPKR, timeAgo } from '@/utils/formatters';
import {
  ESCROW_METRICS, ESCROW_PIPELINE, ESCROW_TABLE, ESCROW_STATUS_META,
  DISPUTE_METRICS, PAYMENT_DISPUTES, DISPUTE_STATUS_META, RISK_LEVEL_META,
} from '@/utils/mockRevenuePayments';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Escrow management center — pipeline tracker, escrow ledger & payment disputes workspace. */
export default function EscrowDisputesTab({ onSelectDispute }) {
  return (
    <div className="space-y-6">
      {/* Escrow metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Escrow Balance', value: formatCompactPKR(ESCROW_METRICS.escrowBalance) },
          { label: 'Funds Locked', value: formatCompactPKR(ESCROW_METRICS.fundsLocked) },
          { label: 'Pending Releases', value: formatCompactPKR(ESCROW_METRICS.pendingReleases) },
          { label: 'Disputed Funds', value: formatCompactPKR(ESCROW_METRICS.disputedFunds) },
          { label: 'Released Funds', value: formatCompactPKR(ESCROW_METRICS.releasedFunds) },
        ].map((m) => (
          <div key={m.label} className="card rounded-2xl p-4">
            <p className="text-xs text-fg-muted">{m.label}</p>
            <p className="text-lg font-bold text-fg mt-1 truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Escrow pipeline */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Escrow Pipeline</h3>
        <EscrowTracker stages={ESCROW_PIPELINE} />
      </div>

      {/* Escrow table */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Escrow Ledger</h3>
        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 900 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Campaign</th>
                  <th className="px-3 py-3 text-left">Brand</th>
                  <th className="px-3 py-3 text-left">Creator</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center">Days Held</th>
                  <th className="px-3 py-3 text-center">Release Date</th>
                  <th className="px-3 py-3 text-center">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {ESCROW_TABLE.map((e) => {
                  const status = ESCROW_STATUS_META[e.status] ?? ESCROW_STATUS_META.deposited;
                  const risk = RISK_LEVEL_META[e.riskLevel] ?? RISK_LEVEL_META.low;
                  return (
                    <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 text-fg truncate max-w-[200px]">{e.campaign}</td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{e.brand}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar initials={e.creatorInitials} color={e.creatorColor} size="xs" />
                          <span className="text-fg whitespace-nowrap">{e.creator}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-fg font-semibold whitespace-nowrap">{formatPKR(e.amount)}</td>
                      <td className="px-3 py-3 text-center"><Badge variant={status.variant} label={status.label} dot /></td>
                      <td className="px-3 py-3 text-center text-fg-muted">{e.daysHeld}d</td>
                      <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{formatDate(e.releaseDate)}</td>
                      <td className="px-3 py-3 text-center"><Badge variant={risk.variant} label={`${e.riskScore}`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Disputes Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Payment Disputes Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Open Disputes', value: DISPUTE_METRICS.openDisputes },
            { label: 'Resolved Disputes', value: DISPUTE_METRICS.resolvedDisputes },
            { label: 'Disputed Amount', value: formatCompactPKR(DISPUTE_METRICS.disputedAmount) },
            { label: 'Avg. Resolution Time', value: `${DISPUTE_METRICS.avgResolutionTimeHours}h` },
          ].map((m) => (
            <div key={m.label} className="card rounded-2xl p-4">
              <p className="text-xs text-fg-muted">{m.label}</p>
              <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 800 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Dispute</th>
                  <th className="px-3 py-3 text-left">Campaign</th>
                  <th className="px-3 py-3 text-left">Creator</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-left">Reason</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center">Filed</th>
                  <th className="px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_DISPUTES.map((d) => {
                  const status = DISPUTE_STATUS_META[d.status] ?? DISPUTE_STATUS_META.open;
                  return (
                    <tr key={d.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 text-fg font-medium whitespace-nowrap">{d.id}</td>
                      <td className="px-3 py-3 text-fg-muted truncate max-w-[180px]">{d.campaign}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar initials={d.creatorInitials} color={d.creatorColor} size="xs" />
                          <span className="text-fg whitespace-nowrap">{d.creator}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-fg font-semibold whitespace-nowrap">{formatPKR(d.amount)}</td>
                      <td className="px-3 py-3 text-fg-muted truncate max-w-[220px]">{d.reason}</td>
                      <td className="px-3 py-3 text-center"><Badge variant={status.variant} label={status.label} dot /></td>
                      <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{timeAgo(d.timeline[0].date)} ago</td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectDispute?.(d)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg transition-colors whitespace-nowrap"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
