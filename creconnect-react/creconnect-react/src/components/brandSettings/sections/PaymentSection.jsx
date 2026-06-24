import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';
import Button from '@/components/common/Button';
import Switch from '@/components/common/Switch';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';

const PAYMENT_KEY = 'cc-brand-payment-methods';
const BANK_KEY    = 'cc-brand-bank-accounts';

function loadList(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}
function saveList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
}

/* ─── Add Card Modal ─────────────────────────────────────────── */
function AddCardModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ cardHolder: '', number: '', expiry: '', cvc: '' });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const valid = form.cardHolder.trim() && form.number.replace(/\s/g, '').length === 16
    && form.expiry.match(/^\d{2}\/\d{2}$/) && form.cvc.length >= 3;

  const handleSubmit = (e) => {
    e.preventDefault();
    const last4 = form.number.replace(/\s/g, '').slice(-4);
    onAdd({ id: Date.now().toString(), brand: 'Card', last4, expiry: form.expiry, cardHolder: form.cardHolder, isDefault: false });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Add Card</h2>
          <button onClick={onClose} className="text-fg-muted hover:text-fg text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Card Holder Name" value={form.cardHolder} onChange={set('cardHolder')} placeholder="Name on card" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Card Number</label>
            <input
              className="input-base w-full"
              value={form.number}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                setForm((p) => ({ ...p, number: v.replace(/(.{4})/g, '$1 ').trim() }));
              }}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">Expiry</label>
              <input
                className="input-base w-full"
                value={form.expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                  setForm((p) => ({ ...p, expiry: v }));
                }}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">CVC</label>
              <input className="input-base w-full" value={form.cvc} onChange={(e) => setForm((p) => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="•••" maxLength={4} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={!valid} className="flex-1">Add Card</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
AddCardModal.propTypes = { onClose: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired };

/* ─── Add Bank Account Modal ─────────────────────────────────── */
function AddBankModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ accountTitle: '', iban: '', bankName: '', branchCode: '' });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const valid = form.accountTitle.trim() && form.iban.trim().length >= 10 && form.bankName.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ id: Date.now().toString(), ...form });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Add Bank Account</h2>
          <button onClick={onClose} className="text-fg-muted hover:text-fg text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Account Title"          value={form.accountTitle} onChange={set('accountTitle')} placeholder="Account holder name" />
          <Input label="IBAN"                   value={form.iban}         onChange={set('iban')}         placeholder="PK00XXXX0000000000000000" />
          <Input label="Bank Name"              value={form.bankName}     onChange={set('bankName')}     placeholder="e.g. HBL, MCB, UBL" />
          <Input label="Branch Code (optional)" value={form.branchCode}   onChange={set('branchCode')}   placeholder="e.g. 0001" />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost"   size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={!valid} className="flex-1">Add Account</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
AddBankModal.propTypes = { onClose: PropTypes.func.isRequired, onAdd: PropTypes.func.isRequired };

/* ─── Main ───────────────────────────────────────────────────── */
export default function PaymentSection({ values, onChange, financials }) {
  const [paymentMethods, setPaymentMethods] = useState(() => loadList(PAYMENT_KEY));
  const [bankAccounts,   setBankAccounts]   = useState(() => loadList(BANK_KEY));
  const [showCardModal,  setShowCardModal]  = useState(false);
  const [showBankModal,  setShowBankModal]  = useState(false);

  const addCard = (card) => {
    const updated = [...paymentMethods, card];
    setPaymentMethods(updated);
    saveList(PAYMENT_KEY, updated);
    setShowCardModal(false);
  };

  const removeCard = (id) => {
    const updated = paymentMethods.filter((m) => m.id !== id);
    setPaymentMethods(updated);
    saveList(PAYMENT_KEY, updated);
  };

  const setDefault = (id) => {
    const updated = paymentMethods.map((m) => ({ ...m, isDefault: m.id === id }));
    setPaymentMethods(updated);
    saveList(PAYMENT_KEY, updated);
  };

  const addBank = (bank) => {
    const updated = [...bankAccounts, bank];
    setBankAccounts(updated);
    saveList(BANK_KEY, updated);
    setShowBankModal(false);
  };

  const removeBank = (id) => {
    const updated = bankAccounts.filter((b) => b.id !== id);
    setBankAccounts(updated);
    saveList(BANK_KEY, updated);
  };

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Financial Center</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard icon="💸" value={financials.totalSpend}      label="Total Spend" />
          <StatCard icon="⏳" value={financials.pendingPayments} label="Pending Payments" />
          <StatCard icon="🔒" value={financials.escrowBalance}   label="Escrow Balance" />
        </div>
      </div>

      {/* Payment methods */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Payment Methods</h3>
        <div className="space-y-2">
          {paymentMethods.length === 0 && <p className="text-fg-muted text-sm">No payment methods on file.</p>}
          {paymentMethods.map((m) => (
            <div key={m.id} className="card rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
              <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">💳</span>
              <div className="min-w-0 flex-1">
                <p className="text-fg font-medium text-sm">{m.cardHolder} — •••• {m.last4}</p>
                <p className="text-fg-muted text-xs mt-0.5">Expires {m.expiry}</p>
              </div>
              {m.isDefault && <Badge variant="brand" label="Default" />}
              <div className="flex gap-1.5 flex-shrink-0">
                {!m.isDefault && <Button variant="ghost" size="xs" onClick={() => setDefault(m.id)}>Set Default</Button>}
                <Button variant="ghost" size="xs" onClick={() => removeCard(m.id)}>Remove</Button>
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setShowCardModal(true)}>+ Add Payment Method</Button>
        </div>
      </div>

      {/* Bank accounts */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Bank Accounts &amp; Payouts</h3>
        <div className="space-y-2">
          {bankAccounts.length === 0 && <p className="text-fg-muted text-sm">No bank accounts added.</p>}
          {bankAccounts.map((b) => (
            <div key={b.id} className="card rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
              <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">🏦</span>
              <div className="min-w-0 flex-1">
                <p className="text-fg font-medium text-sm">{b.accountTitle} — {b.bankName}</p>
                <p className="text-fg-muted text-xs mt-0.5 font-mono">{b.iban}</p>
              </div>
              <Button variant="ghost" size="xs" onClick={() => removeBank(b.id)}>Remove</Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setShowBankModal(true)}>+ Add Bank Account</Button>
        </div>
      </div>

      {/* Escrow */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Escrow Preferences</h3>
        <div className="space-y-1">
          <div className="py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <Switch checked={values.escrowEnabled}       onChange={(v) => onChange('escrowEnabled', v)}       label="Enable escrow for all payments"         description="Payments are held in escrow until you release them" />
          </div>
          <div className="py-2.5">
            <Switch checked={values.autoReleasePayments} onChange={(v) => onChange('autoReleasePayments', v)} label="Auto-release after deliverable approval" description="Automatically release payment when you approve a deliverable" />
          </div>
        </div>
      </div>

      {showCardModal && <AddCardModal onClose={() => setShowCardModal(false)} onAdd={addCard} />}
      {showBankModal && <AddBankModal onClose={() => setShowBankModal(false)} onAdd={addBank} />}
    </div>
  );
}

PaymentSection.propTypes = {
  values:     PropTypes.object.isRequired,
  onChange:   PropTypes.func.isRequired,
  financials: PropTypes.object.isRequired,
};
