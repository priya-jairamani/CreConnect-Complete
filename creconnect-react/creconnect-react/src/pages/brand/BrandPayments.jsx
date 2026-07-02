import { useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/useToast';
import { brandsApi } from '@/api/brands.api';
import { paymentsApi } from '@/api/payments.api';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import StatCard from '@/components/common/StatCard';
import { formatPKR } from '@/utils/formatters';

const STATUS_META = {
  PENDING:  { label: 'Pending',   color: 'var(--fg-muted)', bg: 'var(--surface-2)',          icon: '○' },
  CHECKOUT: { label: 'Checkout…', color: '#8b5cf6',         bg: 'rgba(139,92,246,0.1)',      icon: '💳' },
  ESCROW:   { label: 'Escrow',    color: '#f59e0b',         bg: 'rgba(245,158,11,0.1)',      icon: '🔒' },
  RELEASED: { label: 'Released',  color: '#22c55e',         bg: 'rgba(34,197,94,0.1)',       icon: '✓' },
  PAID:     { label: 'Paid',      color: '#22c55e',         bg: 'rgba(34,197,94,0.1)',       icon: '💰' },
};

function StatusChip({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: m.bg, color: m.color }}
    >
      {m.icon} {m.label}
    </span>
  );
}

export default function BrandPayments() {
  const toast = useToast();

  const [collabs,  setCollabs]  = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [collabRes, payRes] = await Promise.all([
        brandsApi.getCollaborations({ limit: 200 }),
        paymentsApi.getHistory({ limit: 200 }),
      ]);
      const collabList  = Array.isArray(collabRes.data) ? collabRes.data : (collabRes.data?.data ?? []);
      const paymentList = Array.isArray(payRes.data)   ? payRes.data   : (payRes.data?.data   ?? []);
      setCollabs(collabList.filter(c => c.status === 'ACCEPTED' || c.rawStatus === 'ACCEPTED'));
      setPayments(paymentList);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  /* Merge: each accepted collab + its payment record (if any) */
  const rows = useMemo(() => collabs.map(c => ({
    collab:  c,
    payment: payments.find(p => p.collaborationId === c.id) ?? null,
  })), [collabs, payments]);

  const handleEscrow = useCallback(async (collabId) => {
    setBusy(p => ({ ...p, [collabId]: true }));
    try {
      const res = await paymentsApi.createEscrow(collabId);
      const checkoutUrl = res.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('No checkout URL returned');
      window.location.href = checkoutUrl; // hand off to Stripe Checkout
      return;
    } catch (err) {
      toast.error(err?.message || 'Failed to start checkout');
      setBusy(p => ({ ...p, [collabId]: false }));
    }
  }, [toast]);

  // Returning from Stripe Checkout — the webhook has (usually) already
  // confirmed escrow by the time the browser gets back here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const escrow = params.get('escrow');
    if (!escrow) return;
    if (escrow === 'success') toast.success('Payment locked in escrow');
    if (escrow === 'cancelled') toast.error('Checkout was cancelled');
    window.history.replaceState({}, '', window.location.pathname);
    load();
  }, [load, toast]);

  const handleRelease = useCallback(async (paymentId, collabId) => {
    if (!window.confirm('Release payment to the creator? This cannot be undone.')) return;
    setBusy(p => ({ ...p, [collabId]: true }));
    try {
      await paymentsApi.releasePayment(paymentId);
      toast.success('Payment released to creator');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to release payment');
    } finally {
      setBusy(p => ({ ...p, [collabId]: false }));
    }
  }, [load, toast]);

  /* KPI summary */
  const kpis = useMemo(() => {
    const inEscrow  = payments.filter(p => p.status === 'ESCROW').reduce((s, p) => s + (p.amountPKR || 0), 0);
    const released  = payments.filter(p => ['RELEASED','PAID'].includes(p.status)).reduce((s, p) => s + (p.amountPKR || 0), 0);
    const pending   = rows.filter(r => !r.payment).length;
    const total     = inEscrow + released;
    return { total, inEscrow, released, pending };
  }, [payments, rows]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Payments</h1>
        <p className="text-fg-muted text-sm mt-0.5">Lock escrow when work begins. Release when content is delivered.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="💳" value={formatPKR(kpis.total)}    label="Total Committed"  />
        <StatCard icon="🔒" value={formatPKR(kpis.inEscrow)} label="In Escrow"        />
        <StatCard icon="✓"  value={formatPKR(kpis.released)} label="Released"         />
        <StatCard icon="○"  value={kpis.pending}             label="Awaiting Escrow"  />
      </div>

      {/* How it works */}
      <div
        className="rounded-2xl p-4 flex flex-wrap gap-4 items-center text-sm"
        style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.18)' }}
      >
        <span className="text-fg-muted text-xs font-semibold uppercase tracking-wider flex-shrink-0">How it works:</span>
        {[
          { icon: '1️⃣', text: 'Accept a creator application' },
          { icon: '2️⃣', text: 'Lock payment in Escrow — creator is notified' },
          { icon: '3️⃣', text: 'Creator delivers the content' },
          { icon: '4️⃣', text: 'Release payment — creator is paid' },
        ].map(s => (
          <span key={s.text} className="flex items-center gap-1.5 text-fg-muted text-xs">
            <span>{s.icon}</span> {s.text}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-5 py-3 border-b grid text-xs font-semibold uppercase tracking-widest text-fg-muted"
          style={{ borderColor: 'var(--border)', gridTemplateColumns: '1fr 140px 110px 140px 160px' }}
        >
          <span>Creator / Campaign</span>
          <span className="text-right">Amount (PKR)</span>
          <span className="text-center">Stage</span>
          <span className="text-center">Payment Status</span>
          <span className="text-right">Action</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-3xl">💳</p>
            <p className="text-sm font-semibold text-fg">No active collaborations</p>
            <p className="text-xs text-fg-muted">Accept creator applications to start managing payments.</p>
          </div>
        ) : (
          rows.map(({ collab, payment }) => {
            const creator  = collab.creator  ?? {};
            const campaign = collab.campaign ?? {};
            // null → no payment yet; 'PENDING' → Stripe session open (not confirmed yet)
            const payStatus = !payment ? 'PENDING' : payment.status === 'PENDING' ? 'CHECKOUT' : payment.status;
            const amount    = collab.offerAmountPKR || campaign.budgetPKR || 0;
            const isBusy    = !!busy[collab.id];

            return (
              <div
                key={collab.id}
                className="px-5 py-4 border-b grid items-center gap-4 hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: 'var(--border)', gridTemplateColumns: '1fr 140px 110px 140px 160px' }}
              >
                {/* Creator + campaign */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={creator.avatarUrl}
                    initials={(creator.displayName || creator.username || '?').slice(0, 2).toUpperCase()}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-fg text-sm font-semibold truncate">
                      {creator.displayName || creator.username || '—'}
                    </p>
                    <p className="text-fg-muted text-xs truncate">{campaign.title || 'Campaign'}</p>
                  </div>
                </div>

                {/* Amount */}
                <p className="text-fg text-sm font-bold text-right">{formatPKR(amount)}</p>

                {/* Stage */}
                <div className="text-center">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)' }}
                  >
                    {collab.stage ?? 'INQUIRY'}
                  </span>
                </div>

                {/* Payment status */}
                <div className="flex justify-center">
                  <StatusChip status={payStatus} />
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  {payStatus === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="xs"
                      disabled={isBusy}
                      isLoading={isBusy}
                      onClick={() => handleEscrow(collab.id)}
                    >
                      🔒 Lock Escrow
                    </Button>
                  )}
                  {payStatus === 'CHECKOUT' && (
                    <Button
                      variant="primary"
                      size="xs"
                      disabled={isBusy}
                      isLoading={isBusy}
                      onClick={() => handleEscrow(collab.id)}
                    >
                      💳 Complete Payment
                    </Button>
                  )}
                  {payStatus === 'ESCROW' && (
                    <Button
                      variant="secondary"
                      size="xs"
                      disabled={isBusy}
                      isLoading={isBusy}
                      onClick={() => handleRelease(payment.id, collab.id)}
                    >
                      💸 Release
                    </Button>
                  )}
                  {(payStatus === 'RELEASED' || payStatus === 'PAID') && (
                    <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>✓ Paid</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
