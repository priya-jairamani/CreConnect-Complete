import { useState } from 'react';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import BrandSpendCard from './BrandSpendCard';
import { formatCompactPKR, formatPKR } from '@/utils/formatters';
import { BRAND_SPEND_METRICS, BRAND_SPENDING, TOP_SPENDING_BRANDS } from '@/utils/mockRevenuePayments';

const STATUS_VARIANT = { Active: 'success', 'On Hold': 'warning' };

const LEADERBOARD_TABS = [
  { id: 'lifetimeSpend', label: 'Lifetime Spend' },
  { id: 'monthlySpend', label: 'Monthly Spend' },
  { id: 'campaignVolume', label: 'Campaign Volume' },
  { id: 'creatorRetention', label: 'Creator Retention' },
];

/** Brand finance center — spending metrics, full brand table & top-spender leaderboards. */
export default function BrandSpendingTab({ onSelectBrand }) {
  const [leaderboard, setLeaderboard] = useState('lifetimeSpend');

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Brand Spend', value: formatCompactPKR(BRAND_SPEND_METRICS.totalBrandSpend) },
          { label: 'Active Spending', value: formatCompactPKR(BRAND_SPEND_METRICS.activeSpending) },
          { label: 'Average Campaign Budget', value: formatCompactPKR(BRAND_SPEND_METRICS.avgCampaignBudget) },
          { label: 'Highest Spending Brand', value: BRAND_SPEND_METRICS.highestSpendingBrand },
          { label: 'Payment Reliability', value: `${BRAND_SPEND_METRICS.paymentReliability}%` },
        ].map((m) => (
          <div key={m.label} className="card rounded-2xl p-4">
            <p className="text-xs text-fg-muted">{m.label}</p>
            <p className="text-lg font-bold text-fg mt-1 truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Brand spending table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-3 py-3 text-left">Industry</th>
                <th className="px-3 py-3 text-center">Campaigns</th>
                <th className="px-3 py-3 text-right">Total Spend</th>
                <th className="px-3 py-3 text-right">Pending Spend</th>
                <th className="px-3 py-3 text-right">Completed</th>
                <th className="px-3 py-3 text-center">Reliability</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {BRAND_SPENDING.map((b) => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={b.initials} color={b.color} size="sm" />
                      <span className="text-fg font-medium whitespace-nowrap">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{b.industry}</td>
                  <td className="px-3 py-3 text-center text-fg">{b.campaigns}</td>
                  <td className="px-3 py-3 text-right text-fg font-semibold whitespace-nowrap">{formatPKR(b.totalSpend)}</td>
                  <td className="px-3 py-3 text-right text-fg-muted whitespace-nowrap">{formatPKR(b.pendingSpend)}</td>
                  <td className="px-3 py-3 text-right text-fg-muted whitespace-nowrap">{formatPKR(b.completedPayments)}</td>
                  <td className="px-3 py-3 text-center text-fg">{b.paymentReliability}%</td>
                  <td className="px-3 py-3 text-center"><Badge variant={STATUS_VARIANT[b.status] ?? 'neutral'} label={b.status} dot /></td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectBrand?.(b)}
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

      {/* Top Spending Brands Leaderboard */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Top Spending Brands</h3>
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
          {TOP_SPENDING_BRANDS[leaderboard].map((b, i) => (
            <BrandSpendCard key={b.id} brand={b} rank={i + 1} onClick={onSelectBrand} />
          ))}
        </div>
      </div>
    </div>
  );
}
