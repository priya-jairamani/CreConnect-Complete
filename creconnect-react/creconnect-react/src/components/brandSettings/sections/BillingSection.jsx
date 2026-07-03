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
UsageBar.propTypes = { label: PropTypes.string.isRequired, used: PropTypes.number.isRequired, limit: PropTypes.number };

export default function BillingSection({ subscription, plans, onManageBilling, onChangePlan, busyTier }) {
  const { tier, name, price, campaignLimit, collabLimitPerCampaign, used, periodEnd, status } = subscription;
  const renewsInDays = periodEnd ? Math.max(0, Math.ceil((new Date(periodEnd) - new Date()) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <div className="card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.12), rgba(76,45,209,0.04))' }}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{name} Plan</p>
            <Badge variant="brand" label="Current Plan" />
            {status === 'PAST_DUE' && <Badge variant="warning" label="Payment failed" />}
          </div>
          <p className="text-fg-muted text-sm mt-1">
            {price === null ? 'Custom pricing' : price === 0 ? 'Free' : `${formatPKR(price)} / month`}
            {renewsInDays !== null && ` · Renews in ${renewsInDays} day${renewsInDays === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onManageBilling}>Manage Billing</Button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Usage This Cycle</h3>
        <div className="space-y-4 card rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
          <UsageBar label="Campaigns Created" used={used} limit={campaignLimit} />
          {Number.isFinite(collabLimitPerCampaign) && (
            <p className="text-fg-muted text-xs">
              Free plan: each campaign can have at most {collabLimitPerCampaign} accepted creators.
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Available Plans</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map((p) => {
            const active = p.tier === tier;
            return (
              <div key={p.tier} className="card rounded-2xl p-4 flex flex-col gap-2" style={active ? { border: '1px solid var(--brand-500)', background: 'rgba(109,92,255,0.08)' } : { background: 'var(--surface-2)' }}>
                <p className="text-fg font-semibold text-sm">{p.name}</p>
                <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {p.price === null ? 'Custom' : p.price === 0 ? 'Free' : formatPKR(p.price)}
                </p>
                <p className="text-fg-muted text-xs">{Number.isFinite(p.campaignLimit) ? `${p.campaignLimit} campaigns/mo` : 'Unlimited campaigns'}</p>
                <Button
                  variant={active ? 'secondary' : 'outline'}
                  size="xs"
                  disabled={active || busyTier === p.tier}
                  isLoading={busyTier === p.tier}
                  onClick={() => p.selfServe
                    ? onChangePlan(p.tier)
                    : (window.location.href = `mailto:sales@creconnect.com?subject=${encodeURIComponent(`${p.name} plan inquiry`)}`)}
                >
                  {active ? 'Current Plan' : p.selfServe ? 'Switch' : 'Contact Sales'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Invoices &amp; Payment Method</h3>
        <p className="text-fg-muted text-xs mb-3">Manage your card on file and download past invoices via Stripe&apos;s billing portal.</p>
        <Button variant="secondary" size="sm" onClick={onManageBilling}>Open Billing Portal</Button>
      </div>
    </div>
  );
}

BillingSection.propTypes = {
  subscription: PropTypes.object.isRequired,
  plans: PropTypes.array.isRequired,
  onManageBilling: PropTypes.func.isRequired,
  onChangePlan: PropTypes.func.isRequired,
  busyTier: PropTypes.string,
};
