import PropTypes from 'prop-types';
import { clsx } from 'clsx';

const VARIANTS = {
  primary:   'bg-brand-gradient text-white btn-brand-glow font-semibold',
  secondary: 'bg-surface2 text-fg border border-[var(--border)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#232540] transition-colors font-medium',
  danger:    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors font-medium',
  ghost:     'bg-transparent text-fg-muted hover:text-fg hover:bg-white/5 transition-colors font-medium',
  outline:   'bg-transparent text-brand-400 border border-brand-500/50 hover:border-brand-500 hover:bg-brand-500/10 transition-colors font-medium',
  success:   'bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-colors font-medium',
};

const SIZES = {
  xs:   'px-3 py-1.5 text-xs rounded-lg gap-1.5 h-7',
  sm:   'px-3.5 py-2 text-xs rounded-lg gap-1.5 h-8',
  md:   'px-4 py-2.5 text-sm rounded-[10px] gap-2 h-10',
  lg:   'px-6 py-3 text-base rounded-xl gap-2 h-12',
  full: 'w-full px-5 py-3 text-sm rounded-xl gap-2 h-11',
};

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  isLoading = false,
  type      = 'button',
  onClick,
  className = '',
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className
      )}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

Button.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(Object.keys(VARIANTS)),
  size:      PropTypes.oneOf(Object.keys(SIZES)),
  disabled:  PropTypes.bool,
  isLoading: PropTypes.bool,
  type:      PropTypes.string,
  onClick:   PropTypes.func,
  className: PropTypes.string,
  icon:      PropTypes.node,
};
