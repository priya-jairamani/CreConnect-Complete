import PropTypes from 'prop-types';

/** Small inline trend sparkline, used inside KPI / metric cards. */
export default function Sparkline({ data = [], color = '#6d5cff', height = 40 }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 200;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const gradId = `spark-${color.replace('#', '')}-${height}`;

  return (
    <svg viewBox={`0 0 200 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} 200,${height}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Sparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.string,
  height: PropTypes.number,
};
