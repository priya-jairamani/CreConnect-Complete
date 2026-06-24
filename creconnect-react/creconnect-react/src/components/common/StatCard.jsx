import PropTypes from 'prop-types';
import { clsx } from 'clsx';

export default function StatCard({
  value,
  label,
  icon,
  trend,
  trendLabel,
  highlight = false,
  className = '',
}) {
  const isPositive = typeof trend === 'number' ? trend >= 0 : trend?.startsWith?.('+');

  return (
    <div
      className={clsx(
        'card rounded-2xl p-5 flex flex-col gap-3',
        highlight && 'border-brand-500/30 bg-brand-500/5',
        className
      )}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between">
        {icon ? (
          <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">
            {icon}
          </div>
        ) : (
          <div />
        )}
        {trend !== undefined && (
          <span
            className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              isPositive
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger'
            )}
          >
            {typeof trend === 'number'
              ? `${trend >= 0 ? '+' : ''}${trend}%`
              : trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className={clsx(
            'font-display font-700 leading-none',
            highlight ? 'text-3xl grad-text' : 'text-3xl text-fg'
          )}
          style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}
        >
          {value}
        </p>
        <p className="text-fg-muted text-sm mt-1.5">{label}</p>
        {trendLabel && (
          <p className="text-fg-muted text-xs mt-0.5">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  value:      PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
  label:      PropTypes.string.isRequired,
  icon:       PropTypes.node,
  trend:      PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  trendLabel: PropTypes.string,
  highlight:  PropTypes.bool,
  className:  PropTypes.string,
};
