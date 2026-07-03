import { useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/useToast';
import { paymentsApi } from '@/api/payments.api';
import { creatorsApi } from '@/api/creators.api';
import { subscriptionsApi } from '@/api/subscriptions.api';
import Skeleton from '@/components/common/Skeleton';
import StatCard from '@/components/common/StatCard';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';

const STATUS_STEPS = ['PENDING', 'ESCROW', 'RELEASED'];

const STATUS_META = {
  PENDING:  { label: 'Checkout Started', color: '#8b5cf6', icon: '💳', desc: 'Brand has started checkout — awaiting payment confirmation' },
  ESCROW:   { label: 'In Escrow',       color: '#f59e0b',         icon: '🔒', desc: 'Payment secured — deliver your content' },
  RELEASED: { label: 'Released',        color: '#22c55e',         icon: '💰', desc: 'Payment released to you' },
  PAID:     { label: 'Paid',            color: '#22c55e',         icon: '💰', desc: 'Payment received' },
};

function PaymentProgressBar({ status }) {
  const norm = status === 'PAID' ? 'RELEASED' : status;
  const idx  = STATUS_STEPS.indexOf(norm);
  return (
    <div className="flex items-center gap-0 mt-2">
      {STATUS_STEPS.map((s, i) => {
        const done  = i <= idx;
        const label = s === 'PENDING' ? 'Pending' : s === 'ESCROW' ? 'Escrow' : 'Released';
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1" style={{ minWidth: 56 }}>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={done
                  ? { background: '#22c55e', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                }
              >
                {done ? '✓' : i + 1}
              </div>
              <p className="text-[10px] text-fg-muted">{label}</p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-4"
                style={{ background: i < idx ? '#22c55e' : 'var(--border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CreatorPayments() {
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [collabs,  setCollabs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [payoutsEnabled, setPayoutsEnabled] = useState(true); // assume true until profile loads, to avoid a flash of the banner
  const [onboarding, setOnboarding] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [billingBusyTier, setBillingBusyTier] = useState(null);

  const loadBilling = useCallback(() => {
    Promise.all([subscriptionsApi.getMine(), subscriptionsApi.listPlans()])
      .then(([subRes, plansRes]) => {
        setSubscription(subRes.data);
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadBilling(); }, [loadBilling]);

  // Returning from a subscription Checkout session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('subscription');
    if (!result) return;
    if (result === 'success') toast.success('Subscription updated!');
    if (result === 'cancelled') toast.error('Checkout was cancelled');
    window.history.replaceState({}, '', window.location.pathname);
    loadBilling();
  }, [loadBilling, toast]);

  const handleManageBilling = useCallback(async () => {
    try {
      const { data } = await subscriptionsApi.billingPortal();
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.message || 'No billing account yet — subscribe to a plan first.');
    }
  }, [toast]);

  const handleChangePlan = useCallback(async (tier) => {
    setBillingBusyTier(tier);
    try {
      const { data } = await subscriptionsApi.checkout(tier);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.message || 'Failed to start checkout');
      setBillingBusyTier(null);
    }
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, collabRes, profileRes] = await Promise.all([
        paymentsApi.getHistory(),
        creatorsApi.getCollaborations({}),
        creatorsApi.getProfile(),
      ]);
      const payList    = Array.isArray(payRes.data)    ? payRes.data    : (payRes.data?.data    ?? []);
      const collabList = Array.isArray(collabRes.data) ? collabRes.data : (collabRes.data?.data ?? []);
      setPayments(payList);
      setCollabs(collabList.filter(c => c.status === 'ACCEPTED' || c.rawStatus === 'ACCEPTED'));
      setPayoutsEnabled(!!profileRes.data?.payoutsEnabled);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Returning from Stripe Connect onboarding — check status directly with Stripe
  // rather than waiting on a webhook, which can be delayed or, for some accounts,
  // delivered as a newer event type this backend doesn't listen for.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payouts = params.get('payouts');
    if (!payouts) return;
    window.history.replaceState({}, '', window.location.pathname);

    if (payouts === 'onboarded') {
      toast.success('Payout setup complete — checking status…');
      creatorsApi.refreshPayoutStatus().catch(() => {}).finally(load);
    } else {
      load();
    }
  }, [load, toast]);

  const handleRecheckPayouts = useCallback(async () => {
    setCheckingStatus(true);
    try {
      await creatorsApi.refreshPayoutStatus();
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to check payout status');
    } finally {
      setCheckingStatus(false);
    }
  }, [load, toast]);

  const handleSetupPayouts = useCallback(async () => {
    setOnboarding(true);
    try {
      const res = await creatorsApi.startPayoutOnboarding();
      const url = res.data?.url;
      if (!url) throw new Error('No onboarding URL returned');
      window.location.href = url;
    } catch (err) {
      toast.error(err?.message || 'Failed to start payout setup');
      setOnboarding(false);
    }
  }, [toast]);

  const kpis = useMemo(() => {
    const earned   = payments
      .filter(p => ['RELEASED', 'PAID'].includes(p.status))
      .reduce((s, p) => s + (p.amountPKR || 0), 0);

    const inEscrow = payments
      .filter(p => p.status === 'ESCROW')
      .reduce((s, p) => s + (p.amountPKR || 0), 0);

    // "Pending brands" = accepted collaborations that have no Payment record yet
    const paymentCollabIds = new Set(payments.map(p => p.collaborationId));
    const pendingBrands = collabs.filter(c => !paymentCollabIds.has(c.id)).length;

    return { earned, inEscrow, pendingBrands };
  }, [payments, collabs]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Payments</h1>
        <p className="text-fg-muted text-sm mt-0.5">Track what you've earned and what's secured in escrow.</p>
      </header>

      {!loading && !payoutsEnabled && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <div>
            <p className="text-sm font-semibold text-fg">⚠ Set up payouts to get paid</p>
            <p className="text-fg-muted text-xs mt-0.5">
              Brands can still lock escrow, but released payments can't reach you until you connect a payout account.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" isLoading={checkingStatus} disabled={checkingStatus} onClick={handleRecheckPayouts}>
              Recheck status
            </Button>
            <Button variant="primary" size="sm" isLoading={onboarding} disabled={onboarding} onClick={handleSetupPayouts}>
              Set up payouts
            </Button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="💰" value={formatPKR(kpis.earned)}      label="Total Earned"   />
        <StatCard icon="🔒" value={formatPKR(kpis.inEscrow)}    label="In Escrow"      />
        <StatCard icon="○"  value={kpis.pendingBrands}          label="Pending Brands" />
      </div>

      {/* Subscription plan */}
      {subscription && (
        <div className="card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{subscription.name} Plan</p>
              <p className="text-fg-muted text-sm mt-0.5">
                {subscription.price === null ? 'Custom pricing' : subscription.price === 0 ? 'Free' : `${formatPKR(subscription.price)} / month`}
                {!subscription.aiEnabled && ' · AI features locked'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleManageBilling}>Manage Billing</Button>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-fg">New brand collaborations this month</span>
              <span className="text-fg-muted">
                {subscription.used} / {Number.isFinite(subscription.collabLimit) ? subscription.collabLimit : '∞'}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: Number.isFinite(subscription.collabLimit)
                    ? `${Math.min(100, Math.round((subscription.used / subscription.collabLimit) * 100))}%`
                    : '8%',
                  background: 'var(--brand-500)',
                }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {plans.map((p) => {
              const active = p.tier === subscription.tier;
              return (
                <div
                  key={p.tier}
                  className="rounded-xl p-3 flex flex-col gap-1.5"
                  style={active ? { border: '1px solid var(--brand-500)', background: 'rgba(109,92,255,0.08)' } : { background: 'var(--surface-2)' }}
                >
                  <p className="text-fg font-semibold text-sm">{p.name}</p>
                  <p className="text-fg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {p.price === null ? 'Custom' : p.price === 0 ? 'Free' : formatPKR(p.price)}
                  </p>
                  <p className="text-fg-muted text-xs">{Number.isFinite(p.collabLimit) ? `${p.collabLimit} brands/mo` : 'Unlimited brands'}</p>
                  <Button
                    variant={active ? 'secondary' : 'outline'}
                    size="xs"
                    disabled={active || !p.selfServe || billingBusyTier === p.tier}
                    isLoading={billingBusyTier === p.tier}
                    onClick={() => handleChangePlan(p.tier)}
                  >
                    {active ? 'Current Plan' : p.selfServe ? 'Switch' : 'Contact Sales'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info banner */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.18)' }}
      >
        <p className="text-fg-muted text-xs">
          <span className="font-semibold text-fg">How you get paid: </span>
          Brand locks payment in escrow → you deliver the content → brand releases → money is yours.
          You'll receive a notification at each step.
        </p>
      </div>

      {/* Payment cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="card rounded-2xl py-16 text-center space-y-2">
          <p className="text-3xl">💳</p>
          <p className="text-sm font-semibold text-fg">No payments yet</p>
          <p className="text-xs text-fg-muted">
            Your payment history will appear here once a brand secures payment for your collaboration.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => {
            const collab   = payment.collaboration ?? {};
            const campaign = collab.campaign ?? {};
            const meta     = STATUS_META[payment.status] ?? STATUS_META.PENDING;

            return (
              <div key={payment.id} className="card rounded-2xl p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {campaign.title || 'Campaign'}
                    </p>
                    <p className="text-fg-muted text-xs mt-0.5">{meta.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {formatPKR(payment.amountPKR || 0)}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold mt-0.5"
                      style={{ color: meta.color }}
                    >
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <PaymentProgressBar status={payment.status} />

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[11px] text-fg-muted">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                  {payment.releasedAt && (
                    <p className="text-[11px]" style={{ color: '#22c55e' }}>
                      Released {new Date(payment.releasedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
