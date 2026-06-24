import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import VerificationReviewCard from './VerificationReviewCard';
import VerificationBadge from './VerificationBadge';
import RiskIndicator from './RiskIndicator';
import UserTimeline from './UserTimeline';
import { VERIFICATION_QUEUE } from '@/utils/mockUserIntelligence';

const ENTITY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'creator', label: 'Creator Verification' },
  { id: 'brand', label: 'Brand Verification' },
];

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'needs_review', label: 'Needs Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const DOC_LABELS = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' };
const DOC_VARIANT = { approved: 'success', pending: 'warning', rejected: 'danger' };

/** Verification Queue tab — dedicated review workspace for creators & brands. */
export default function VerificationQueueTab({ onAction }) {
  const [entityFilter, setEntityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(VERIFICATION_QUEUE[0]?.id ?? null);

  const filtered = useMemo(() => {
    return VERIFICATION_QUEUE.filter((item) => {
      if (entityFilter !== 'all' && item.entityType !== entityFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [entityFilter, statusFilter]);

  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1">
          {ENTITY_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setEntityFilter(t.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${entityFilter === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${statusFilter === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-fg-muted ml-auto">{filtered.length} item(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Queue list */}
        <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <EmptyState icon="🛂" title="Queue is empty" message="No items match the current filters." />
          ) : (
            filtered.map((item) => (
              <VerificationReviewCard
                key={item.id}
                item={item}
                active={selected?.id === item.id}
                onClick={() => setSelectedId(item.id)}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="card rounded-2xl p-5">
          {!selected ? (
            <EmptyState icon="🛂" title="Select an item" message="Choose a creator or brand from the queue to review their verification details." />
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{selected.name}</h3>
                  <p className="text-fg-muted text-sm">{selected.handle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <VerificationBadge status={selected.status} />
                    <RiskIndicator level={selected.riskLevel} />
                    <Badge variant="neutral" label={selected.entityType === 'creator' ? 'Creator' : 'Brand'} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="success" size="sm" onClick={() => onAction?.('approve', selected)}>Approve</Button>
                  <Button variant="secondary" size="sm" onClick={() => onAction?.('needs_review', selected)}>Needs Review</Button>
                  <Button variant="danger" size="sm" onClick={() => onAction?.('reject', selected)}>Reject</Button>
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
                  {selected.entityType === 'creator' ? 'Identity Documents' : 'Business Documents'}
                </p>
                <div className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <span className="text-sm text-fg">
                    {selected.entityType === 'creator' ? 'Government ID / Passport' : 'Business Registration Certificate'}
                  </span>
                  <Badge
                    variant={DOC_VARIANT[selected.documents.identity ?? selected.documents.business]}
                    label={DOC_LABELS[selected.documents.identity ?? selected.documents.business]}
                  />
                </div>
              </div>

              {/* Social Accounts / Registration Records */}
              {selected.entityType === 'creator' ? (
                <div>
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Social Accounts</p>
                  <div className="space-y-2">
                    {selected.documents.socialAccounts.map((s) => (
                      <div key={s.platform} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                        <span className="text-sm text-fg">{s.platform} — {s.handle}</span>
                        <Badge variant={s.verified ? 'success' : 'neutral'} label={s.verified ? 'Verified' : 'Unverified'} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Registration Records</p>
                  <div className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                    <span className="text-sm text-fg">Tax / Registration Number on File</span>
                    <Badge variant={DOC_VARIANT[selected.documents.registration]} label={DOC_LABELS[selected.documents.registration]} />
                  </div>
                </div>
              )}

              {/* Website */}
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Website</p>
                <p className="text-sm text-fg">{selected.documents.website ?? '— not provided —'}</p>
              </div>

              {/* Risk Assessment */}
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Risk Assessment</p>
                <div className="rounded-xl p-3 border border-warning/25 bg-warning/10">
                  <p className="text-sm text-fg-muted leading-relaxed">{selected.riskAssessment}</p>
                </div>
              </div>

              {/* Admin Notes */}
              {selected.adminNotes && (
                <div>
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Admin Notes</p>
                  <p className="text-sm text-fg-muted">{selected.adminNotes}</p>
                </div>
              )}

              {/* Verification History */}
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Verification History</p>
                <UserTimeline items={selected.history} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
