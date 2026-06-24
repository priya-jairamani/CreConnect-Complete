import { useState } from 'react';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import CreatorEarningsCard from './CreatorEarningsCard';
import { formatCompactPKR, formatPKR } from '@/utils/formatters';
import { CREATOR_PAYOUT_METRICS, CREATOR_PAYOUTS, TOP_CREATORS_LEADERBOARD } from '@/utils/mockRevenuePayments';

const STATUS_VARIANT = { Active: 'success', 'Under Review': 'warning', Suspended: 'danger' };

const LEADERBOARD_TABS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'campaignSuccess', label: 'Campaign Success' },
  { id: 'engagementROI', label: 'Engagement ROI' },
  { id: 'brandSatisfaction', label: 'Brand Satisfaction' },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Creator earnings center — payout metrics, full payout table & top-creator leaderboards. */
export default function CreatorPayoutsTab({ onSelectCreator }) {
  const [leaderboard, setLeaderboard] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Creator Earnings', value: formatCompactPKR(CREATOR_PAYOUT_METRICS.totalCreatorEarnings) },
          { label: 'Pending Payouts', value: formatCompactPKR(CREATOR_PAYOUT_METRICS.pendingPayouts) },
          { label: 'Completed Payouts', value: formatCompactPKR(CREATOR_PAYOUT_METRICS.completedPayouts) },
          { label: 'Average Creator Income', value: formatCompactPKR(CREATOR_PAYOUT_METRICS.avgCreatorIncome) },
          { label: 'Highest Earning Creator', value: CREATOR_PAYOUT_METRICS.highestEarningCreator },
        ].map((m) => (
          <div key={m.label} className="card rounded-2xl p-4">
            <p className="text-xs text-fg-muted">{m.label}</p>
            <p className="text-lg font-bold text-fg mt-1 truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Creator payout table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left">Creator</th>
                <th className="px-3 py-3 text-center">Campaigns</th>
                <th className="px-3 py-3 text-right">Total Earnings</th>
                <th className="px-3 py-3 text-right">Pending</th>
                <th className="px-3 py-3 text-right">Paid</th>
                <th className="px-3 py-3 text-center">Last Payout</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Tax Status</th>
                <th className="px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {CREATOR_PAYOUTS.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={c.initials} color={c.color} size="sm" />
                      <span className="text-fg font-medium whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-fg">{c.campaigns}</td>
                  <td className="px-3 py-3 text-right text-fg font-semibold whitespace-nowrap">{formatPKR(c.totalEarnings)}</td>
                  <td className="px-3 py-3 text-right text-fg-muted whitespace-nowrap">{formatPKR(c.pendingAmount)}</td>
                  <td className="px-3 py-3 text-right text-fg-muted whitespace-nowrap">{formatPKR(c.paidAmount)}</td>
                  <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{formatDate(c.lastPayout)}</td>
                  <td className="px-3 py-3 text-center"><Badge variant={STATUS_VARIANT[c.status] ?? 'neutral'} label={c.status} dot /></td>
                  <td className="px-3 py-3 text-center">
                    <Badge variant={c.taxStatus === 'Filed' ? 'success' : c.taxStatus === 'Exempt' ? 'neutral' : 'warning'} label={c.taxStatus} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectCreator?.(c)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg transition-colors whitespace-nowrap"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Creators Leaderboard */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Top Creators Leaderboard</h3>
          <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 overflow-x-auto">
            {LEADERBOARD_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLeaderboard(t.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  leaderboard === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card rounded-2xl p-4 space-y-2">
          {TOP_CREATORS_LEADERBOARD[leaderboard].map((c, i) => (
            <CreatorEarningsCard key={c.id} creator={c} rank={i + 1} onClick={onSelectCreator} />
          ))}
        </div>
      </div>
    </div>
  );
}
