import PropTypes from 'prop-types';
import AnimatedCounter from '@/components/common/AnimatedCounter';

function ringColor(val) {
  if (val >= 85) return 'var(--success)';
  if (val >= 70) return 'var(--brand-500)';
  if (val >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

/** Large radial Platform Health score ring with status label. */
export default function PlatformHealthRing({ value, status, size = 188, strokeWidth = 14 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = ringColor(value);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={center} cy={center} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.22,1,.36,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-700 text-fg leading-none"
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}
          >
            <AnimatedCounter value={value} />
          </span>
          <span className="text-fg-muted text-xs mt-1 tracking-wide uppercase">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}1f`, color }}
      >
        {status.label}
      </span>
    </div>
  );
}

PlatformHealthRing.propTypes = {
  value: PropTypes.number.isRequired,
  status: PropTypes.shape({ label: PropTypes.string.isRequired, variant: PropTypes.string }).isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
};
