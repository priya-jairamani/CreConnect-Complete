import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { SUSPENDED_ACCOUNTS } from '@/utils/mockUserIntelligence';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

const APPEAL_VARIANT = { 'None': 'neutral', 'Pending Review': 'warning', 'Denied': 'danger' };

/** Suspended Accounts tab — review suspension history, appeals & enforcement actions. */
export default function SuspendedTab({ onAction }) {
  if (SUSPENDED_ACCOUNTS.length === 0) {
    return <EmptyState icon="✅" title="No suspended accounts" message="Everything looks clean — there are currently no suspended creators or brands." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {SUSPENDED_ACCOUNTS.map((acc) => (
        <div key={acc.id} className="card rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initials={getInitials(acc.name)} size="md" color={acc.entityType === 'brand' ? '#4c2dd1' : undefined} />
              <div className="min-w-0">
                <p className="text-fg font-semibold truncate">{acc.name}</p>
                <p className="text-fg-muted text-xs truncate">{acc.handle} · {acc.entityType === 'creator' ? 'Creator' : 'Brand'}</p>
              </div>
            </div>
            <Badge variant="danger" label={`Risk ${acc.riskScore}`} />
          </div>

          <div className="rounded-xl p-3 border border-danger/25 bg-danger/10">
            <p className="text-xs font-semibold text-danger mb-1">Suspension Reason</p>
            <p className="text-sm text-fg-muted leading-snug">{acc.suspensionReason}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-fg-muted text-xs">Date Suspended</p>
              <p className="text-fg font-medium">{new Date(acc.dateSuspended).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">Previous Violations</p>
              <p className="text-fg font-medium">{acc.previousViolations}</p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">Appeal Status</p>
              <Badge variant={APPEAL_VARIANT[acc.appealStatus] ?? 'neutral'} label={acc.appealStatus} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-subtle">
            <Button variant="success" size="sm" onClick={() => onAction?.('restore', acc)}>Restore</Button>
            <Button variant="secondary" size="sm" onClick={() => onAction?.('extend', acc)}>Extend Suspension</Button>
            <Button variant="danger" size="sm" onClick={() => onAction?.('delete', acc)}>Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
