import { useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/useToast';
import { paymentsApi } from '@/api/payments.api';
import { creatorsApi } from '@/api/creators.api';
import Skeleton from '@/components/common/Skeleton';
import StatCard from '@/components/common/StatCard';
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, collabRes] = await Promise.all([
        paymentsApi.getHistory(),
        creatorsApi.getCollaborations({}),
      ]);
      const payList    = Array.isArray(payRes.data)    ? payRes.data    : (payRes.data?.data    ?? []);
      const collabList = Array.isArray(collabRes.data) ? collabRes.data : (collabRes.data?.data ?? []);
      setPayments(payList);
      setCollabs(collabList.filter(c => c.status === 'ACCEPTED' || c.rawStatus === 'ACCEPTED'));
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

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

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="💰" value={formatPKR(kpis.earned)}      label="Total Earned"   />
        <StatCard icon="🔒" value={formatPKR(kpis.inEscrow)}    label="In Escrow"      />
        <StatCard icon="○"  value={kpis.pendingBrands}          label="Pending Brands" />
      </div>

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
