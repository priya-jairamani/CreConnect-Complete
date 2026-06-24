import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import GMVChart from './GMVChart';
import { formatPKR, formatCompactPKR } from '@/utils/formatters';

const STATUS_VARIANT = { Active: 'success', 'On Hold': 'warning' };

/** Brand financial profile — spending trends, campaign budgets, payment reliability, disputes & ROI. */
export default function BrandFinancialDrawer({ brand, onClose, onAction }) {
  if (!brand) return <Drawer isOpen={false} onClose={onClose} />;

  const spendData = brand.spendingTrend.map((s) => ({ label: s.label, spend: s.amount }));
  const roiData = brand.roiTrends.map((r) => ({ label: r.label, roi: r.roi }));

  return (
    <Drawer
      isOpen={!!brand}
      onClose={onClose}
      size="2xl"
      icon="🏢"
      title={brand.name}
      subtitle={`${brand.industry} · ${brand.campaigns} campaigns`}
      headerExtra={<Badge variant={STATUS_VARIANT[brand.status] ?? 'neutral'} label={brand.status} dot />}
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => onAction?.('export', brand)}>Export Spend Report</Button>
          <Button variant="outline" size="sm" onClick={() => onAction?.('review_disputes', brand)}>Review Disputes</Button>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Spend', value: formatCompactPKR(brand.totalSpend) },
            { label: 'Completed Payments', value: formatCompactPKR(brand.completedPayments) },
            { label: 'Pending Spend', value: formatCompactPKR(brand.pendingSpend) },
            { label: 'Payment Reliability', value: `${brand.paymentReliability}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs text-fg-muted">{item.label}</p>
              <p className="text-sm font-semibold text-fg mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Spending trend */}
        <GMVChart
          title="Spending Trends"
          subtitle="Spend over the last 8 months"
          data={spendData}
          series={[{ key: 'spend', label: 'Spend', color: '#857fff' }]}
          height={200}
        />

        {/* Campaign budget history */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Campaign Budget History</p>
          <div className="space-y-2">
            {brand.campaignBudgetHistory.map((c, i) => (
              <div key={`${c.campaign}-${i}`} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm text-fg truncate flex-1 mr-3">{c.campaign}</span>
                <span className="text-sm font-semibold text-fg">{formatPKR(c.budget)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI trend */}
        <GMVChart
          title="ROI Trends"
          subtitle="Campaign return on ad spend (%)"
          data={roiData}
          series={[{ key: 'roi', label: 'ROI %', color: '#16b364' }]}
          height={180}
          type="line"
          currency={false}
        />

        {/* Dispute history */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Dispute History</p>
          {brand.disputeHistory.length === 0 ? (
            <p className="text-sm text-fg-muted">No disputes filed against this brand.</p>
          ) : (
            <div className="space-y-2">
              {brand.disputeHistory.map((d) => (
                <div key={d.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                  <span className="text-sm text-fg">{d.id}</span>
                  <span className="text-sm font-semibold text-fg">{formatPKR(d.amount)}</span>
                  <Badge variant={d.status === 'Resolved' ? 'success' : 'danger'} label={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

BrandFinancialDrawer.propTypes = {
  brand: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
