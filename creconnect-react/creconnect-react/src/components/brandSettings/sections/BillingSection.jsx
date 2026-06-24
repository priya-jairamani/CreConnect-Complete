import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';

function UsageBar({ label, used, limit }) {
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-fg">{label}</span>
        <span className="text-fg-muted">{used} / {isUnlimited ? '∞' : limit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div className="h-full rounded-full" style={{ width: `${isUnlimited ? 8 : pct}%`, background: 'var(--brand-500)' }} />
      </div>
    </div>
  );
}
UsageBar.propTypes = { label: PropTypes.string.isRequired, used: PropTypes.number.isRequired, limit: PropTypes.number.isRequired };

export default function BillingSection({ subscription, invoices, onUpgrade, onChangePlan }) {
  const { plan, plans, usedCampaigns, usedCreators, usedStorageGb, renewsInDays } = subscription;

  return (
    <div className="space-y-6">
      <div className="card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.12), rgba(76,45,209,0.04))' }}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{plan.name} Plan</p>
            <Badge variant="brand" label="Current Plan" />
          </div>
          <p className="text-fg-muted text-sm mt-1">
            {plan.price === null ? 'Custom pricing' : plan.price === 0 ? 'Free' : `${formatPKR(plan.price)} / month`} · Renews in {renewsInDays} days
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onUpgrade}>⬆ Upgrade Plan</Button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Usage This Cycle</h3>
        <div className="space-y-4 card rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
          <UsageBar label="Active Campaigns" used={usedCampaigns} limit={plan.campaignLimit} />
          <UsageBar label="Creators Engaged" used={usedCreators} limit={plan.creatorLimit} />
          <UsageBar label="Storage (GB)" used={usedStorageGb} limit={plan.storageGb} />
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Available Plans</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map((p) => {
            const active = p.id === plan.id;
            return (
              <div key={p.id} className="card rounded-2xl p-4 flex flex-col gap-2" style={active ? { border: '1px solid var(--brand-500)', background: 'rgba(109,92,255,0.08)' } : { background: 'var(--surface-2)' }}>
                <p className="text-fg font-semibold text-sm">{p.name}</p>
                <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {p.price === null ? 'Custom' : p.price === 0 ? 'Free' : formatPKR(p.price)}
                </p>
                <p className="text-fg-muted text-xs">{Number.isFinite(p.campaignLimit) ? `${p.campaignLimit} campaigns` : 'Unlimited campaigns'}</p>
                <Button variant={active ? 'secondary' : 'outline'} size="xs" disabled={active} onClick={() => onChangePlan(p.id)}>
                  {active ? 'Current Plan' : 'Switch'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Invoices &amp; Billing History</h3>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="card rounded-2xl p-3 flex items-center justify-between gap-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-fg text-sm">{inv.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-fg-muted text-sm">{formatPKR(inv.amount)}</span>
                <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'} label={inv.status} />
                <Button variant="ghost" size="xs">Download</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

BillingSection.propTypes = {
  subscription: PropTypes.object.isRequired,
  invoices: PropTypes.array.isRequired,
  onUpgrade: PropTypes.func.isRequired,
  onChangePlan: PropTypes.func.isRequired,
};
