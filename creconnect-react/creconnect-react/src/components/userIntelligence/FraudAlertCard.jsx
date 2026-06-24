import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatters';

const SEVERITY_STYLES = {
  critical: { variant: 'danger',  ring: 'border-danger/30' },
  high:     { variant: 'danger',  ring: 'border-danger/20' },
  medium:   { variant: 'warning', ring: 'border-warning/20' },
  low:      { variant: 'brand',   ring: 'border-brand-500/20' },
};

/** Fraud / risk signal card used in the Fraud Detection grid. */
export default function FraudAlertCard({ alert, onAction }) {
  const sev = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.medium;

  return (
    <div className={`card rounded-2xl p-4 flex items-start gap-3 border ${sev.ring}`}>
      <div className="w-10 h-10 rounded-xl bg-danger/12 text-danger flex items-center justify-center text-lg flex-shrink-0">
        {alert.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-fg">{alert.type}</p>
          <Badge variant={sev.variant} label={alert.severity} />
        </div>
        <p className="text-xs text-fg-muted mt-1 leading-snug">{alert.description}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-fg-muted">
            <span className="font-medium text-fg">{alert.entityName}</span> · {timeAgo(alert.date)} ago
          </span>
          {onAction && (
            <button
              type="button"
              onClick={() => onAction(alert)}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Investigate →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

FraudAlertCard.propTypes = {
  alert: PropTypes.shape({
    icon: PropTypes.node,
    type: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    entityName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
  onAction: PropTypes.func,
};
