import PropTypes from 'prop-types';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import Badge from '@/components/common/Badge';

function statusFor(score) {
  if (score >= 90) return { label: 'Excellent', variant: 'success' };
  if (score >= 75) return { label: 'Healthy', variant: 'brand' };
  if (score >= 50) return { label: 'Needs Attention', variant: 'warning' };
  return { label: 'Critical', variant: 'danger' };
}

function ringColor(variant) {
  if (variant === 'success') return 'var(--success)';
  if (variant === 'brand') return 'var(--brand-500)';
  if (variant === 'warning') return 'var(--warning)';
  return 'var(--danger)';
}

/** Overall security posture score with contributing factor breakdown. */
export default function SecurityHealthCard({ score, factors }) {
  const status = statusFor(score);
  const size = 96;
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const center = size / 2;

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={center} cy={center} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
            <circle
              cx={center} cy={center} r={r} fill="none"
              stroke={ringColor(status.variant)} strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.22,1,.36,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
              <AnimatedCounter value={score} />
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Security Health Score</h3>
            <Badge variant={status.variant} label={status.label} dot />
          </div>
          <p className="text-fg-muted text-xs mt-0.5">Composite score across authentication, access control & monitoring signals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {factors.map((f) => (
          <div key={f.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-fg">{f.label}</span>
              <span className="text-xs font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{f.value}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${f.value}%` }} />
            </div>
            <p className="text-fg-muted text-xs mt-1.5">{f.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

SecurityHealthCard.propTypes = {
  score: PropTypes.number.isRequired,
  factors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    detail: PropTypes.string.isRequired,
  })).isRequired,
};
