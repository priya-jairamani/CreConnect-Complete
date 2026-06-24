import PropTypes from 'prop-types';
import AnimatedCounter from '@/components/common/AnimatedCounter';

const SEVERITY_STYLES = {
  danger:  { dot: 'bg-danger',  badge: 'bg-danger/15 text-danger' },
  warning: { dot: 'bg-warning', badge: 'bg-warning/15 text-warning' },
  success: { dot: 'bg-success', badge: 'bg-success/15 text-success' },
};

/** Trust & Safety risk card — severity, trend, value, quick action. */
export default function RiskCard({ icon, label, value, severity, trend, action, onAction }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.warning;
  const trendUp = trend > 0;
  const trendFlat = trend === 0;

  return (
    <div className="card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-fg-muted text-xs uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-lg">{icon}</span>
      </div>

      <p className="text-3xl font-700 text-fg leading-none" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
        <AnimatedCounter value={value} />
      </p>

      <div className="flex items-center justify-between">
        <span
          className={
            'text-xs font-semibold px-2 py-0.5 rounded-full ' +
            (trendFlat ? 'bg-surface-2 text-fg-muted' : trendUp ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success')
          }
        >
          {trendFlat ? 'No change' : `${trendUp ? '+' : ''}${trend} vs last period`}
        </span>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors text-left mt-auto"
      >
        {action} →
      </button>
    </div>
  );
}

RiskCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  severity: PropTypes.oneOf(['danger', 'warning', 'success']).isRequired,
  trend: PropTypes.number.isRequired,
  action: PropTypes.string.isRequired,
  onAction: PropTypes.func,
};
