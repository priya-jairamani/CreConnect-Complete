import PropTypes from 'prop-types';
import { clsx } from 'clsx';

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={clsx(
        'rounded-full border-brand-500/30 border-t-brand-400 animate-spin',
        SIZES[size] ?? SIZES.md,
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

Spinner.propTypes = {
  size:      PropTypes.oneOf(Object.keys(SIZES)),
  className: PropTypes.string,
};
