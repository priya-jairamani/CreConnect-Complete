import PropTypes from 'prop-types';
import { clsx } from 'clsx';

export default function Switch({ checked, onChange, label, description, disabled = false, className = '' }) {
  return (
    <label className={clsx('flex items-center justify-between gap-4 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm text-fg font-medium">{label}</span>}
          {description && <span className="block text-fg-muted text-xs mt-0.5">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className="relative flex-shrink-0 w-10 h-6 rounded-full transition-colors"
        style={{ background: checked ? 'var(--brand-500)' : 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
