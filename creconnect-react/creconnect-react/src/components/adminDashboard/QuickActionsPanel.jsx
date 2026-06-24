import PropTypes from 'prop-types';

const ACTIONS = [
  { id: 'verify',          icon: '✅', label: 'Verify Users',         description: 'Review creator & brand KYC queue' },
  { id: 'announce',        icon: '📣', label: 'Create Announcement',   description: 'Broadcast to creators, brands, or all' },
  { id: 'export',          icon: '📊', label: 'Export Analytics',      description: 'Download platform KPI report as CSV' },
  { id: 'pending_reports', icon: '🚨', label: 'View Pending Reports',  description: 'Open Trust & Safety reports queue' },
];

export default function QuickActionsPanel({ onAction }) {
  return (
    <div className="card rounded-2xl p-5 lg:sticky lg:top-6 space-y-3">
      <h3 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
        Quick Actions
      </h3>
      <div className="space-y-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAction?.(a.id)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-brand-500/10 hover:text-brand-400 text-fg transition-colors text-left group"
          >
            <span className="text-lg mt-0.5 flex-shrink-0">{a.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{a.label}</p>
              <p className="text-xs text-fg-muted mt-0.5 leading-snug group-hover:text-brand-400/70 transition-colors">{a.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

QuickActionsPanel.propTypes = {
  onAction: PropTypes.func,
};
