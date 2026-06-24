import PropTypes from 'prop-types';

function ringColor(val) {
  if (val >= 85) return '#16b364'; // success
  if (val >= 70) return '#6d5cff'; // brand
  if (val >= 50) return '#f5a623'; // warning
  return '#f0445f';                // danger
}

export default function ScoreRing({ value, size = 56, strokeWidth = 6 }) {
  const r       = (size - strokeWidth) / 2;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (value / 100) * circ;
  const color   = ringColor(value);
  const center  = size / 2;
  const fontSize = Math.round(size * 0.27);

  return (
    <div
      style={{ width: size, height: size, position: 'relative', display: 'inline-grid', placeItems: 'center', flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
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
      <span
        style={{
          position: 'relative',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize,
          color: 'var(--fg)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

ScoreRing.propTypes = {
  value:       PropTypes.number.isRequired,
  size:        PropTypes.number,
  strokeWidth: PropTypes.number,
};
