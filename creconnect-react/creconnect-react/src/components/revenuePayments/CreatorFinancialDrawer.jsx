import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import RevenueChart from './RevenueChart';
import { formatPKR, formatCompactPKR } from '@/utils/formatters';

const STATUS_VARIANT = { Active: 'success', 'Under Review': 'warning', Suspended: 'danger' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Creator financial profile — revenue history, campaign income, payment reliability & tax status. */
export default function CreatorFinancialDrawer({ creator, onClose, onAction }) {
  if (!creator) return <Drawer isOpen={false} onClose={onClose} />;

  const revenueData = creator.revenueHistory.map((r) => ({ label: r.label, earnings: r.amount }));

  return (
    <Drawer
      isOpen={!!creator}
      onClose={onClose}
      size="2xl"
      icon="🎙️"
      title={creator.name}
      subtitle={`${creator.campaigns} campaigns · Tax status: ${creator.taxStatus}`}
      headerExtra={<Badge variant={STATUS_VARIANT[creator.status] ?? 'neutral'} label={creator.status} dot />}
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => onAction?.('export', creator)}>Export Earnings Report</Button>
          <Button variant="success" size="sm" onClick={() => onAction?.('release_payout', creator)}>Release Pending Payout</Button>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Earnings', value: formatCompactPKR(creator.totalEarnings) },
            { label: 'Paid Amount', value: formatCompactPKR(creator.paidAmount) },
            { label: 'Pending Amount', value: formatCompactPKR(creator.pendingAmount) },
            { label: 'Payment Reliability', value: `${creator.paymentReliability}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs text-fg-muted">{item.label}</p>
              <p className="text-sm font-semibold text-fg mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue history */}
        <RevenueChart
          title="Monthly Earnings"
          subtitle="Earnings trend over the last 8 months"
          data={revenueData}
          series={[{ key: 'earnings', label: 'Earnings', color: '#6d5cff' }]}
          height={200}
        />

        {/* Campaign income */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Campaign Income</p>
          <div className="space-y-2">
            {creator.campaignIncome.map((c, i) => (
              <div key={`${c.campaign}-${i}`} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm text-fg truncate flex-1 mr-3">{c.campaign}</span>
                <span className="text-sm font-semibold text-fg">{formatPKR(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payout timeline */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Payout Timeline</p>
          <div className="space-y-2">
            {creator.payoutTimeline.map((p, i) => (
              <div key={i} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-xs text-fg-muted">{formatDate(p.date)}</span>
                <span className="text-sm font-semibold text-fg">{formatPKR(p.amount)}</span>
                <Badge variant={p.status === 'Paid' ? 'success' : 'warning'} label={p.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Tax information */}
        <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
          <span className="text-sm text-fg">Tax Information</span>
          <Badge variant={creator.taxStatus === 'Filed' ? 'success' : creator.taxStatus === 'Exempt' ? 'neutral' : 'warning'} label={creator.taxStatus} />
        </div>
      </div>
    </Drawer>
  );
}

CreatorFinancialDrawer.propTypes = {
  creator: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
