import PropTypes from 'prop-types';
import Button from '@/components/common/Button';

const ACTIONS = [
  { key: 'export', icon: '⬇', title: 'Export Workspace Data', description: 'Download all your campaigns, creator data, and analytics as a ZIP archive.', variant: 'secondary', cta: 'Export Data' },
  { key: 'transfer', icon: '🔄', title: 'Transfer Ownership', description: 'Transfer this workspace to another team member. You will lose Owner access.', variant: 'secondary', cta: 'Transfer Ownership' },
  { key: 'archive', icon: '📦', title: 'Archive Workspace', description: 'Temporarily disable this workspace. Your data is preserved and can be restored later.', variant: 'danger', cta: 'Archive Workspace' },
  { key: 'delete', icon: '🗑', title: 'Delete Workspace', description: 'Permanently delete this workspace and all associated data. This cannot be undone.', variant: 'danger', cta: 'Delete Workspace' },
];

export default function DangerZoneSection({ onAction }) {
  return (
    <div className="space-y-3">
      <p className="text-fg-muted text-sm">These actions are irreversible or affect your entire workspace. Proceed with caution.</p>
      {ACTIONS.map((a) => (
        <div
          key={a.key}
          className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
          style={{ border: `1px solid ${a.variant === 'danger' ? 'rgba(240,68,95,0.25)' : 'var(--border)'}`, background: a.variant === 'danger' ? 'rgba(240,68,95,0.04)' : 'var(--surface-2)' }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">{a.icon}</span>
            <div className="min-w-0">
              <p className="text-fg font-medium text-sm">{a.title}</p>
              <p className="text-fg-muted text-xs mt-0.5 max-w-md">{a.description}</p>
            </div>
          </div>
          <Button variant={a.variant} size="sm" onClick={() => onAction(a.key)}>{a.cta}</Button>
        </div>
      ))}
    </div>
  );
}

DangerZoneSection.propTypes = {
  onAction: PropTypes.func.isRequired,
};
