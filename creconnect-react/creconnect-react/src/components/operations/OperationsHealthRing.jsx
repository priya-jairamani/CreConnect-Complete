import PropTypes from 'prop-types';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import Badge from '@/components/common/Badge';
import { OPS_HEALTH_META, opsHealthStatusFor } from '@/utils/mockOperations';

function ringColor(status) {
  if (status === 'excellent') return 'var(--success)';
  if (status === 'healthy') return 'var(--brand-500)';
  if (status === 'warning') return 'var(--warning)';
  return 'var(--danger)';
}

/** Radial operations health score with Excellent/Healthy/Warning/Critical status. */
export default function OperationsHealthRing({ score, size = 88, strokeWidth = 7, showStatus = true, label = 'Operations Health' }) {
  const status = opsHealthStatusFor(score);
  const meta = OPS_HEALTH_META[status];
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = ringColor(status);
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
          <span className="text-xl font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
            <AnimatedCounter value={score} />
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-fg-muted text-center leading-tight">{label}</span>}
      {showStatus && <Badge variant={meta.variant} label={meta.label} dot />}
    </div>
  );
}

OperationsHealthRing.propTypes = {
  score: PropTypes.number.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  showStatus: PropTypes.bool,
  label: PropTypes.string,
};
