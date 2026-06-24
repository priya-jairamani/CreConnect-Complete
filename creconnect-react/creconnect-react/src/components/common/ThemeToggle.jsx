import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ variant = 'full', className = '' }) {
  const { theme, cycleTheme } = useTheme();
  const isLight = theme === 'light';
  const icon = isLight ? '☀️' : '🌙';
  const label = isLight ? 'Light mode' : 'Dark mode';
  const title = isLight ? 'Switch to dark mode' : 'Switch to light mode';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        title={title}
        aria-label={title}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${className}`}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
      >
        <span aria-hidden="true" className="text-base">{icon}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={title}
      aria-label={title}
      className={`sidebar-link w-full ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

ThemeToggle.propTypes = {
  variant: PropTypes.oneOf(['full', 'icon']),
  className: PropTypes.string,
};
