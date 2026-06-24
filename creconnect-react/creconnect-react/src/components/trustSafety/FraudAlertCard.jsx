import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import RiskBadge from './RiskBadge';
import { SEVERITY_META, riskLevelFor } from '@/utils/mockTrustSafety';
import { timeAgo } from '@/utils/formatters';

const TYPE_ICON = {
  'Sudden Follower Spike': '📈',
  'Abnormal Engagement Growth': '⚡',
  'Suspicious Login Activity': '🔐',
  'Mass Messaging': '✉️',
  'Repeated Violations': '🔁',
  'Unusual Payment Activity': '💳',
};

/** Fraud alert card — used in the Fraud Detection feed. */
export default function FraudAlertCard({ alert, onInvestigate }) {
  const severity = SEVERITY_META[alert.severity] ?? SEVERITY_META.low;
  return (
    <div className="card rounded-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-danger/12 text-danger flex items-center justify-center text-lg flex-shrink-0">
        {TYPE_ICON[alert.type] ?? '🚨'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-fg">{alert.type}</p>
          <Badge variant={severity.variant} label={severity.label} />
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Avatar initials={alert.userInfo.initials} color={alert.userInfo.color} size="xs" />
          <span className="text-xs text-fg">{alert.userInfo.name}</span>
          <span className="text-xs text-fg-muted">· {alert.userInfo.type}</span>
        </div>
        <p className="text-xs text-fg-muted mt-1.5 leading-snug">{alert.description}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-fg-muted flex items-center gap-2">
            Detected {timeAgo(alert.detectedDate)} ago
            <RiskBadge level={riskLevelFor(alert.riskScore)} />
          </span>
          {onInvestigate && (
            <button
              type="button"
              onClick={() => onInvestigate(alert)}
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
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    userInfo: PropTypes.object.isRequired,
    severity: PropTypes.string.isRequired,
    riskScore: PropTypes.number.isRequired,
    detectedDate: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onInvestigate: PropTypes.func,
};
