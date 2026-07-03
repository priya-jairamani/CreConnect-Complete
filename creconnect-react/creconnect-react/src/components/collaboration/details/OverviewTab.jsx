import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import BrandInfoPanel from '@/components/collaboration/details/BrandInfoPanel';
import { formatPKR } from '@/utils/formatters';
import {
  STAGE_BADGE_VARIANT, PRIORITY_VARIANT, PAYMENT_STATUS_VARIANT,
} from '@/constants/collaborationOptions';

export default function OverviewTab({ item, intel }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 flex flex-col items-center justify-center gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Badge variant={PRIORITY_VARIANT[intel.priority] ?? 'neutral'} label={intel.priority} />
            <p className="text-fg-muted text-[10px] mt-0.5">Priority</p>
          </div>
          <div className="rounded-xl p-3 flex flex-col items-center justify-center gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Badge variant={STAGE_BADGE_VARIANT[intel.stage] ?? 'neutral'} label={intel.stage} />
            <p className="text-fg-muted text-[10px] mt-0.5">Pipeline Stage</p>
          </div>
        </div>

        {/* Campaign details */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h4 className="text-fg font-semibold text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Campaign Details</h4>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between"><span className="text-fg-muted">Campaign</span><span className="text-fg font-medium text-right">{item.campaignTitle}</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Type</span><span className="text-fg font-medium">{item.campaignType ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Budget</span><span className="text-brand-400 font-semibold">{formatPKR(item.budget)}</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Deadline</span><span className="text-fg font-medium">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Payment Status</span><Badge variant={PAYMENT_STATUS_VARIANT[intel.paymentStatus] ?? 'neutral'} label={intel.paymentStatus} /></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <BrandInfoPanel item={item} />
      </div>
    </div>
  );
}

OverviewTab.propTypes = {
  item: PropTypes.object.isRequired,
  intel: PropTypes.object.isRequired,
};
