import PropTypes from 'prop-types';
import AnimatedCounter from '@/components/common/AnimatedCounter';

function ringColor(val) {
  if (val >= 80) return 'var(--success)';
  if (val >= 60) return 'var(--brand-500)';
  if (val >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

/** Small labeled score ring used across creator/brand intelligence panels. */
export default function UserScoreRing({ value, label, size = 76, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = ringColor(value);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
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
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.22,1,.36,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
            <AnimatedCounter value={value} />
          </span>
        </div>
      </div>
      <span className="text-xs text-fg-muted text-center leading-tight">{label}</span>
    </div>
  );
}

UserScoreRing.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
};
