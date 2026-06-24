import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import TransactionTimeline from './TransactionTimeline';
import { formatPKR } from '@/utils/formatters';
import { TRANSACTION_STATUS_META, RISK_LEVEL_META } from '@/utils/mockRevenuePayments';

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'timeline', label: 'Timeline', icon: '🕒' },
  { id: 'fees', label: 'Fees', icon: '💵' },
  { id: 'risk', label: 'Risk Analysis', icon: '⚠️' },
  { id: 'campaign', label: 'Related Campaign', icon: '📣' },
  { id: 'documents', label: 'Documents', icon: '📄' },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Transaction detail workspace — overview, lifecycle timeline, fee breakdown, risk analysis, related campaign & documents. */
export default function TransactionDrawer({ transaction, onClose, onAction }) {
  const [subTab, setSubTab] = useState('overview');

  if (!transaction) return <Drawer isOpen={false} onClose={onClose} />;

  const status = TRANSACTION_STATUS_META[transaction.status] ?? TRANSACTION_STATUS_META.pending;
  const risk = RISK_LEVEL_META[transaction.riskLevel] ?? RISK_LEVEL_META.low;

  return (
    <Drawer
      isOpen={!!transaction}
      onClose={onClose}
      size="2xl"
      icon="💳"
      title={transaction.id}
      subtitle={`${transaction.campaign} · ${formatDate(transaction.date)}`}
      headerExtra={
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} label={status.label} dot />
          <Badge variant={risk.variant} label={risk.label} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-fg-muted">Net amount</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => onAction?.('flag', transaction)}>Flag Transaction</Button>
            <Button variant="success" size="sm" onClick={() => onAction?.('release', transaction)}>Release Escrow</Button>
          </div>
        </div>
      }
    >
      {/* Sub-tab bar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 px-5 py-3 overflow-x-auto border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              subTab === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg hover:bg-white/5'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ── OVERVIEW ── */}
        {subTab === 'overview' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>🏢</span>
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">Brand</p>
                  <p className="text-sm font-semibold text-fg truncate">{transaction.brand}</p>
                  <p className="text-xs text-fg-muted truncate">{transaction.industry}</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                <Avatar initials={transaction.creatorInitials} color={transaction.creatorColor} size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">Creator</p>
                  <p className="text-sm font-semibold text-fg truncate">{transaction.creator}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Amount', value: formatPKR(transaction.amount) },
                { label: 'Platform Fee', value: formatPKR(transaction.fee) },
                { label: 'Net Amount', value: formatPKR(transaction.net) },
                { label: 'Method', value: transaction.method },
                { label: 'Status', value: status.label },
                { label: 'Risk Level', value: risk.label },
                { label: 'Risk Score', value: `${transaction.riskScore}/100` },
                { label: 'Date', value: formatDate(transaction.date) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {subTab === 'timeline' && <TransactionTimeline items={transaction.timeline} />}

        {/* ── FEES ── */}
        {subTab === 'fees' && (
          <div className="space-y-3">
            {[
              { label: 'Platform Fee', value: transaction.fees.platformFee },
              { label: 'Payment Processing Fee', value: transaction.fees.paymentProcessingFee },
              { label: 'Tax Withholding', value: transaction.fees.taxWithholding },
            ].map((row) => (
              <div key={row.label} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm text-fg">{row.label}</span>
                <span className="text-sm font-semibold text-fg">{formatPKR(row.value)}</span>
              </div>
            ))}
            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(109,92,255,0.12)' }}>
              <span className="text-sm font-semibold text-fg">Total Deductions</span>
              <span className="text-sm font-bold text-brand-400">{formatPKR(transaction.fees.total)}</span>
            </div>
            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
              <span className="text-sm font-semibold text-fg">Net to Creator</span>
              <span className="text-sm font-bold text-success">{formatPKR(transaction.net)}</span>
            </div>
          </div>
        )}

        {/* ── RISK ANALYSIS ── */}
        {subTab === 'risk' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-fg-muted">Risk Score</span>
                <Badge variant={risk.variant} label={risk.label} />
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${transaction.riskAnalysis.score}%`,
                    background: risk.variant === 'danger' ? 'var(--danger)' : risk.variant === 'warning' ? 'var(--warning)' : risk.variant === 'brand' ? 'var(--brand-500)' : 'var(--success)',
                    transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
                  }}
                />
              </div>
              <p className="text-xs text-fg-muted mt-1">{transaction.riskAnalysis.score}/100</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Risk Flags</p>
              {transaction.riskAnalysis.flags.length === 0 ? (
                <p className="text-sm text-fg-muted">No risk flags detected for this transaction.</p>
              ) : (
                <div className="space-y-2">
                  {transaction.riskAnalysis.flags.map((flag) => (
                    <div key={flag} className="rounded-xl p-3 flex items-center gap-2 text-sm text-fg" style={{ background: 'var(--surface-2)' }}>
                      ⚠️ {flag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RELATED CAMPAIGN ── */}
        {subTab === 'campaign' && (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {[
              { label: 'Campaign', value: transaction.relatedCampaign.name },
              { label: 'Campaign ID', value: transaction.relatedCampaign.id },
              { label: 'Brand', value: transaction.relatedCampaign.brand },
              { label: 'Budget', value: formatPKR(transaction.relatedCampaign.budget) },
              { label: 'Status', value: transaction.relatedCampaign.status },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">{item.label}</p>
                <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {subTab === 'documents' && (
          <div className="space-y-2">
            {transaction.documents.map((doc) => (
              <div key={doc.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm text-fg flex items-center gap-2">📄 {doc.name}</span>
                <span className="text-xs text-fg-muted">{doc.type} · {doc.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}

TransactionDrawer.propTypes = {
  transaction: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
