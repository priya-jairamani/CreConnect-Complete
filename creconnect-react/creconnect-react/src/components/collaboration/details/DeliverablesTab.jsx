import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { APPROVAL_STATUS_VARIANT } from '@/constants/collaborationOptions';

const TYPE_ICONS = {
  Reel: '🎥', Story: '📱', Post: '🖼️', Video: '🎬', Livestream: '📡', 'UGC Content': '✂️',
};

function DeliverableCard({ deliverable }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {TYPE_ICONS[deliverable.type] ?? '📄'}
          </span>
          <div className="min-w-0">
            <p className="text-fg font-semibold text-sm">{deliverable.title}</p>
            <p className="text-fg-muted text-xs mt-0.5">{deliverable.type} · Due {new Date(deliverable.dueDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        <Badge variant={APPROVAL_STATUS_VARIANT[deliverable.approvalStatus] ?? 'neutral'} label={deliverable.approvalStatus} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg-muted text-[10px]">Status</p>
          <p className="text-fg font-medium mt-0.5">{deliverable.status}</p>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg-muted text-[10px]">Submitted</p>
          <p className="text-fg font-medium mt-0.5">{deliverable.submissionDate ? new Date(deliverable.submissionDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }) : '—'}</p>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg-muted text-[10px]">Revisions</p>
          <p className="text-fg font-medium mt-0.5">{deliverable.revisionCount}</p>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg-muted text-[10px]">Due</p>
          <p className="text-fg font-medium mt-0.5">{new Date(deliverable.dueDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      {deliverable.feedback && (
        <div className="mt-3 rounded-xl p-3 text-sm flex items-start gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span className="flex-shrink-0">💬</span>
          <p className="text-fg-muted">{deliverable.feedback}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        {deliverable.approvalStatus === 'Draft' && (
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-400 border border-brand-500/30 hover:bg-brand-500/10 transition-colors">
            📤 Submit for Review
          </button>
        )}
        {deliverable.approvalStatus === 'Needs Revision' && (
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-warning border border-warning/30 hover:bg-warning/10 transition-colors">
            ✏️ Submit Revision
          </button>
        )}
        {deliverable.revisionCount > 0 && (
          <button onClick={() => setShowHistory((v) => !v)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-fg-muted border hover:text-fg transition-colors" style={{ borderColor: 'var(--border)' }}>
            {showHistory ? 'Hide' : 'Show'} Revision History
          </button>
        )}
      </div>

      {showHistory && (
        <div className="mt-3 space-y-2 pl-3 border-l-2" style={{ borderColor: 'var(--border)' }}>
          {Array.from({ length: deliverable.revisionCount }, (_, i) => (
            <p key={i} className="text-fg-muted text-xs">Revision {i + 1}: requested changes — see feedback above.</p>
          ))}
        </div>
      )}
    </div>
  );
}

DeliverableCard.propTypes = { deliverable: PropTypes.object.isRequired };

export default function DeliverablesTab({ deliverables }) {
  const counts = deliverables.reduce((acc, d) => {
    acc[d.approvalStatus] = (acc[d.approvalStatus] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([status, count]) => (
          <Badge key={status} variant={APPROVAL_STATUS_VARIANT[status] ?? 'neutral'} label={`${count} ${status}`} />
        ))}
      </div>
      <div className="space-y-3">
        {deliverables.map((d) => <DeliverableCard key={d.id} deliverable={d} />)}
      </div>
    </div>
  );
}

DeliverablesTab.propTypes = {
  deliverables: PropTypes.arrayOf(PropTypes.object).isRequired,
};
