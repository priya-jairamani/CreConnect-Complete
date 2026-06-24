import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import RevenueChart from './RevenueChart';
import GMVChart from './GMVChart';
import FinanceInsightCard from './FinanceInsightCard';
import RiskTransactionCard from './RiskTransactionCard';
import { formatCompactPKR, formatPKR, timeAgo } from '@/utils/formatters';
import {
  REVENUE_INTELLIGENCE, MARKETPLACE_ECONOMICS, INDUSTRY_ANALYTICS, FORECASTING,
  AI_FINANCIAL_INSIGHTS, AI_RISK_DETECTION, FINANCIAL_ALERTS,
} from '@/utils/mockRevenuePayments';

const SEVERITY_VARIANT = { high: 'danger', medium: 'warning', low: 'success' };

/** Platform-wide finance analytics — revenue intelligence, marketplace economics, forecasting & AI risk detection. */
export default function FinancialAnalyticsTab({ onSelectTransaction }) {
  return (
    <div className="space-y-6">
      {/* Revenue Intelligence */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Revenue Intelligence</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueChart title="Revenue Growth" subtitle="Platform revenue, last 12 months" data={REVENUE_INTELLIGENCE.revenueGrowth} series={[{ key: 'value', label: 'Revenue', color: '#6d5cff' }]} />
          <GMVChart title="GMV Growth" subtitle="Gross marketplace volume, last 12 months" data={REVENUE_INTELLIGENCE.gmvGrowth} series={[{ key: 'value', label: 'GMV', color: '#857fff' }]} />
          <RevenueChart title="Payout Trends" subtitle="Creator payouts, last 12 months" data={REVENUE_INTELLIGENCE.payoutTrends} series={[{ key: 'value', label: 'Payouts', color: '#f59e0b' }]} />
          <GMVChart title="Spending Trends" subtitle="Brand spending, last 12 months" data={REVENUE_INTELLIGENCE.spendingTrends} series={[{ key: 'value', label: 'Spend', color: '#0ea5e9' }]} />
          <RevenueChart title="Profit Trends" subtitle="Estimated net platform profit, last 12 months" data={REVENUE_INTELLIGENCE.profitTrends} series={[{ key: 'value', label: 'Profit', color: '#16b364' }]} />
        </div>
      </div>

      {/* Marketplace Economics */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Marketplace Economics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Take Rate', value: `${MARKETPLACE_ECONOMICS.takeRate.toFixed(1)}%` },
            { label: 'Revenue Per User', value: formatCompactPKR(MARKETPLACE_ECONOMICS.revenuePerUser) },
            { label: 'Revenue Per Campaign', value: formatCompactPKR(MARKETPLACE_ECONOMICS.revenuePerCampaign) },
            { label: 'Average Campaign Value', value: formatCompactPKR(MARKETPLACE_ECONOMICS.avgCampaignValue) },
            { label: 'Creator Lifetime Value', value: formatCompactPKR(MARKETPLACE_ECONOMICS.creatorLifetimeValue) },
            { label: 'Brand Lifetime Value', value: formatCompactPKR(MARKETPLACE_ECONOMICS.brandLifetimeValue) },
          ].map((m) => (
            <div key={m.label} className="card rounded-2xl p-4">
              <p className="text-xs text-fg-muted">{m.label}</p>
              <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Analytics */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Industry Analytics</h3>
        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 720 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Industry</th>
                  <th className="px-3 py-3 text-right">Revenue</th>
                  <th className="px-3 py-3 text-center">ROI</th>
                  <th className="px-3 py-3 text-center">Campaign Volume</th>
                  <th className="px-3 py-3 text-right">Creator Earnings</th>
                </tr>
              </thead>
              <tbody>
                {INDUSTRY_ANALYTICS.map((ind) => (
                  <tr key={ind.industry} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 text-fg font-medium whitespace-nowrap">{ind.industry}</td>
                    <td className="px-3 py-3 text-right text-fg font-semibold whitespace-nowrap">{formatPKR(ind.revenue)}</td>
                    <td className="px-3 py-3 text-center text-fg">{ind.roi}%</td>
                    <td className="px-3 py-3 text-center text-fg-muted">{ind.campaignVolume}</td>
                    <td className="px-3 py-3 text-right text-fg-muted whitespace-nowrap">{formatPKR(ind.creatorEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Forecasting Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Forecasting Center</h3>
        <div className="grid grid-cols-1 lg:grid-cols-[repeat(4,minmax(0,1fr))_2fr] gap-4 items-stretch">
          {[
            { label: 'Predicted Next Month Revenue', value: formatCompactPKR(FORECASTING.nextMonthRevenue) },
            { label: 'Expected GMV', value: formatCompactPKR(FORECASTING.expectedGMV) },
            { label: 'Projected Payouts', value: formatCompactPKR(FORECASTING.projectedPayouts) },
            { label: 'Expected Growth', value: `+${FORECASTING.expectedGrowthPct}%` },
          ].map((m) => (
            <div key={m.label} className="card rounded-2xl p-4 flex flex-col justify-center">
              <p className="text-xs text-fg-muted">{m.label}</p>
              <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-1">
            <RevenueChart
              title="Revenue Forecast"
              subtitle="Actual revenue vs. 3-month projection"
              data={FORECASTING.series}
              series={[
                { key: 'actual', label: 'Actual', color: '#6d5cff' },
                { key: 'forecast', label: 'Forecast', color: '#f59e0b', dashed: true },
              ]}
              type="line"
              height={180}
            />
          </div>
        </div>
      </div>

      {/* AI Financial Insights */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Financial Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_FINANCIAL_INSIGHTS.map((insight) => <FinanceInsightCard key={insight.id} insight={insight} />)}
        </div>
      </div>

      {/* AI Risk Detection */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Risk Detection</h3>
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">High Risk Transactions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_RISK_DETECTION.highRiskTransactions.map((t) => <RiskTransactionCard key={t.id} transaction={t} onClick={onSelectTransaction} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Potential Chargebacks</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_RISK_DETECTION.potentialChargebacks.length === 0 ? (
                <p className="text-sm text-fg-muted">No potential chargebacks detected.</p>
              ) : AI_RISK_DETECTION.potentialChargebacks.map((t) => <RiskTransactionCard key={t.id} transaction={t} onClick={onSelectTransaction} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Fraudulent Payments</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_RISK_DETECTION.fraudulentPayments.length === 0 ? (
                <p className="text-sm text-fg-muted">No fraudulent payments detected.</p>
              ) : AI_RISK_DETECTION.fraudulentPayments.map((t) => <RiskTransactionCard key={t.id} transaction={t} onClick={onSelectTransaction} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Abnormal Spending</p>
            <div className="space-y-2">
              {AI_RISK_DETECTION.abnormalSpending.map((b) => (
                <div key={b.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                  <Avatar initials={b.initials} color={b.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-fg truncate">{b.name}</p>
                    <p className="text-xs text-fg-muted">{b.industry}</p>
                  </div>
                  <span className="text-sm font-bold text-fg">{formatCompactPKR(b.totalSpend)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Suspicious Refund Activity</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_RISK_DETECTION.suspiciousRefunds.length === 0 ? (
                <p className="text-sm text-fg-muted">No suspicious refund activity detected.</p>
              ) : AI_RISK_DETECTION.suspiciousRefunds.map((t) => <RiskTransactionCard key={t.id} transaction={t} onClick={onSelectTransaction} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Alerts */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Financial Alerts</h3>
        <div className="space-y-2">
          {FINANCIAL_ALERTS.map((alert) => (
            <div key={alert.id} className="card rounded-2xl p-4 flex items-start gap-3">
              <Badge variant={SEVERITY_VARIANT[alert.severity] ?? 'neutral'} label={alert.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-fg">{alert.message}</p>
                <p className="text-xs text-fg-muted mt-0.5">{timeAgo(alert.timestamp)} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
