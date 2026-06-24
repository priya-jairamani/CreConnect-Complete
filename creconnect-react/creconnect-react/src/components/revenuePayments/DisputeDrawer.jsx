import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';
import { DISPUTE_STATUS_META } from '@/utils/mockRevenuePayments';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Payment dispute workspace — campaign, parties, reason, evidence, timeline & admin notes. */
export default function DisputeDrawer({ dispute, onClose, onAction }) {
  const [note, setNote] = useState('');

  if (!dispute) return <Drawer isOpen={false} onClose={onClose} />;

  const status = DISPUTE_STATUS_META[dispute.status] ?? DISPUTE_STATUS_META.open;

  return (
    <Drawer
      isOpen={!!dispute}
      onClose={onClose}
      size="2xl"
      icon="⚖️"
      title={dispute.id}
      subtitle={dispute.campaign}
      headerExtra={<Badge variant={status.variant} label={status.label} dot />}
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm font-bold text-fg">{formatPKR(dispute.amount)}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => onAction?.('reject', dispute, note)}>Reject Dispute</Button>
            <Button variant="success" size="sm" onClick={() => onAction?.('resolve', dispute, note)}>Resolve in Creator&apos;s Favor</Button>
          </div>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        {/* Parties */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>🏢</span>
            <div className="min-w-0">
              <p className="text-xs text-fg-muted">Brand</p>
              <p className="text-sm font-semibold text-fg truncate">{dispute.brand}</p>
            </div>
          </div>
          <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
            <Avatar initials={dispute.creatorInitials} color={dispute.creatorColor} size="md" />
            <div className="min-w-0">
              <p className="text-xs text-fg-muted">Creator</p>
              <p className="text-sm font-semibold text-fg truncate">{dispute.creator}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Dispute Reason</p>
          <p className="text-sm text-fg leading-relaxed">{dispute.reason}</p>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Amount', value: formatPKR(dispute.amount) },
            { label: 'Status', value: status.label },
            { label: 'Campaign', value: dispute.campaign },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs text-fg-muted">{item.label}</p>
              <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Evidence */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Evidence</p>
          <div className="flex items-center gap-2 flex-wrap">
            {dispute.evidence.map((e) => <Badge key={e.id} variant="brand" label={e.label} />)}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Timeline</p>
          <div className="space-y-2">
            {dispute.timeline.map((t, i) => (
              <div key={i} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm text-fg">{t.stage}</span>
                <span className="text-xs text-fg-muted">{formatDate(t.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin notes */}
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Admin Notes</p>
          {dispute.adminNotes.length === 0 ? (
            <p className="text-sm text-fg-muted mb-3">No notes added yet.</p>
          ) : (
            <div className="space-y-2 mb-3">
              {dispute.adminNotes.map((n, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-fg">{n.author}</p>
                    <p className="text-xs text-fg-muted">{formatDate(n.date)}</p>
                  </div>
                  <p className="text-sm text-fg-muted mt-1 leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note about this dispute…"
            rows={3}
            className="w-full rounded-xl p-3 text-sm text-fg bg-surface-2 outline-none resize-none placeholder:text-fg-muted"
          />
        </div>
      </div>
    </Drawer>
  );
}

DisputeDrawer.propTypes = {
  dispute: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
