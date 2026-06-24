import PropTypes from 'prop-types';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

function compactTick(v) {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return v;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border-subtle shadow-card-lg">
      <p className="text-fg-muted mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/** Generic campaign analytics chart — area or line, single or multi-series. */
export default function CampaignPerformanceChart({ title, data, series, height = 220, type = 'area', subtitle }) {
  const Chart = type === 'line' ? LineChart : AreaChart;

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
        {subtitle && <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <Chart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`cpc-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
            <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} tickFormatter={compactTick} />
            <Tooltip content={<CustomTooltip />} />
            {series.map((s) => (
              type === 'line' ? (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={600}
                />
              ) : (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fill={`url(#cpc-${s.key})`}
                  animationDuration={600}
                />
              )
            ))}
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

CampaignPerformanceChart.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  data: PropTypes.array.isRequired,
  series: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  height: PropTypes.number,
  type: PropTypes.oneOf(['area', 'line']),
};
