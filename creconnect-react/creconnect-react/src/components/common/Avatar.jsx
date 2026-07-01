import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import { resolveMediaUrl } from '@/utils/media';

const SIZES = {
  xs:   'w-6  h-6  text-[10px]',
  sm:   'w-8  h-8  text-xs',
  md:   'w-10 h-10 text-sm',
  lg:   'w-12 h-12 text-base',
  xl:   'w-16 h-16 text-xl',
  '2xl':'w-20 h-20 text-2xl',
  '3xl':'w-28 h-28 text-4xl',
};

/* Default gradient when no explicit color is given */
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #6d5cff, #4c2dd1)';

export default function Avatar({ initials, src, alt, size = 'md', color, gradient = true, className = '' }) {
  const resolvedSrc = resolveMediaUrl(src);
  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={alt || initials}
        className={clsx('rounded-full object-cover flex-shrink-0', SIZES[size], className)}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  const bg = color
    ? { backgroundColor: color }
    : gradient
      ? { background: DEFAULT_GRADIENT }
      : { backgroundColor: '#1c1e30' };

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
        SIZES[size],
        className
      )}
      style={bg}
    >
      {initials?.slice(0, 2).toUpperCase()}
    </div>
  );
}

Avatar.propTypes = {
  initials:  PropTypes.string,
  src:       PropTypes.string,
  alt:       PropTypes.string,
  size:      PropTypes.oneOf(['xs','sm','md','lg','xl','2xl','3xl']),
  color:     PropTypes.string,
  gradient:  PropTypes.bool,
  className: PropTypes.string,
};
