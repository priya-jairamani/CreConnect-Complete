import { useId } from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';

/**
 * CreConnect "chain mark" — two opposite-facing C's woven into one link:
 * a violet C (creators) interlocking with a foreground C (brands) that
 * adapts to the current theme. The two arcs cross at the top and bottom;
 * the violet arc is redrawn over the foreground arc at the top crossing
 * to read as a single woven link.
 *
 * Geometry is fixed to a 48x48 grid so the mark stays crisp from 16px
 * favicons up to large app-icon tiles.
 */
export function LogoMark({ size = 24, className = '', monochrome = false }) {
  const gradId = useId();
  const clipId = useId();

  const violetC = 'M 41.24 15.99 A 13 13 0 1 0 41.24 32.01';
  const fgC = 'M 6.76 15.99 A 13 13 0 1 1 6.76 32.01';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {!monochrome && (
        <defs>
          <linearGradient id={gradId} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#857FFF" />
            <stop offset="1" stopColor="#4C2DD1" />
          </linearGradient>
          <clipPath id={clipId}>
            <circle cx="24" cy="13" r="6.5" />
          </clipPath>
        </defs>
      )}

      {/* Foreground C — opens left, recolors with the current theme */}
      <path
        d={fgC}
        style={{ stroke: monochrome ? 'currentColor' : 'var(--fg)' }}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Violet C — opens right */}
      <path
        d={violetC}
        stroke={monochrome ? 'currentColor' : `url(#${gradId})`}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Weave: violet passes over the foreground C at the top crossing */}
      {!monochrome && (
        <g clipPath={`url(#${clipId})`}>
          <path d={violetC} style={{ stroke: 'var(--surface)' }} strokeWidth="9" strokeLinecap="round" />
          <path d={violetC} stroke={`url(#${gradId})`} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

LogoMark.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
  monochrome: PropTypes.bool,
};

/**
 * Full lockup: icon mark + "CreConnect" wordmark.
 */
export default function Logo({ size = 24, textClassName = 'font-semibold text-base', showWordmark = true, monochrome = false, className = '' }) {
  return (
    <span className={clsx('flex items-center gap-2.5 min-w-0', className)}>
      <LogoMark size={size} monochrome={monochrome} />
      {showWordmark && (
        <span
          className={textClassName}
          style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
        >
          Cre{monochrome ? 'Connect' : <span className="grad-text">Connect</span>}
        </span>
      )}
    </span>
  );
}

Logo.propTypes = {
  size: PropTypes.number,
  textClassName: PropTypes.string,
  showWordmark: PropTypes.bool,
  monochrome: PropTypes.bool,
  className: PropTypes.string,
};
