import PropTypes from 'prop-types';
import { clsx } from 'clsx';

const STYLES = {
  /* Status-based (legacy) */
  pending:   'bg-warning/15 text-warning border border-warning/25',
  accepted:  'bg-success/15 text-success border border-success/25',
  completed: 'bg-brand-500/15 text-brand-400 border border-brand-500/25',
  rejected:  'bg-danger/15 text-danger border border-danger/25',
  approved:  'bg-success/15 text-success border border-success/25',
  new:       'bg-brand-500/15 text-brand-400 border border-brand-500/25',
  suspended: 'bg-warning/15 text-warning border border-warning/25',
  active:    'bg-success/15 text-success border border-success/25',
  inactive:  'bg-white/5 text-fg-muted border border-white/10',

  /* Semantic variants */
  brand:   'bg-brand-500/14 text-brand-400 border border-brand-500/25',
  success: 'bg-success/14 text-success border border-success/25',
  warning: 'bg-warning/16 text-warning border border-warning/25',
  danger:  'bg-danger/14 text-danger border border-danger/25',
  neutral: 'bg-surface2 text-fg-muted border border-white/10',
  accent:  'bg-accent/15 text-accent border border-accent/25',
};

export default function Badge({ status, label, variant, dot = false, className = '' }) {
  const key    = variant ?? status?.toLowerCase() ?? 'neutral';
  const styles = STYLES[key] ?? STYLES.neutral;
  const text   = label ?? status;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        styles,
        className
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
      )}
      {text}
    </span>
  );
}

Badge.propTypes = {
  status:    PropTypes.string,
  label:     PropTypes.string,
  variant:   PropTypes.oneOf(Object.keys(STYLES)),
  dot:       PropTypes.bool,
  className: PropTypes.string,
};
