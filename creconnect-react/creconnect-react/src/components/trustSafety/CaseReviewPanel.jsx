import PropTypes from 'prop-types';
import Button from '@/components/common/Button';

const ACTIONS = [
  { id: 'assign',           label: 'Assign Case',            icon: '🧑‍💼', variant: 'secondary' },
  { id: 'escalate',         label: 'Escalate',               icon: '⬆️',  variant: 'danger' },
  { id: 'request_evidence', label: 'Request More Evidence',  icon: '📎',  variant: 'secondary' },
  { id: 'resolve',          label: 'Resolve',                icon: '✅',  variant: 'success' },
  { id: 'suspend',          label: 'Suspend User',           icon: '🚫',  variant: 'danger' },
  { id: 'dismiss',          label: 'Dismiss',                icon: '🗂️',  variant: 'ghost' },
];

/** Case management action panel for report / investigation review workspaces. */
export default function CaseReviewPanel({ onAction, disabledActions = [] }) {
  return (
    <div className="card rounded-2xl p-4">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-3">Case Actions</p>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => (
          <Button
            key={a.id}
            variant={a.variant}
            size="sm"
            icon={a.icon}
            disabled={disabledActions.includes(a.id)}
            onClick={() => onAction?.(a.id)}
            className="!justify-start"
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

CaseReviewPanel.propTypes = {
  onAction: PropTypes.func,
  disabledActions: PropTypes.arrayOf(PropTypes.string),
};
