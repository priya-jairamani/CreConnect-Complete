import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function compactTick(v) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return v;
}

function CustomTooltip({ active, payload, label, color, valueLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border-subtle shadow-card-lg">
      <p className="text-fg-muted mb-0.5">{label}</p>
      <p className="font-semibold" style={{ color }}>
        {valueLabel}: {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

/** Single growth metric area chart (used in the Growth Analytics grid). */
export default function GrowthChart({ title, data, dataKey, color, total }) {
  const gradId = `growth-${dataKey}`;
  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
        {typeof total === 'number' && (
          <span className="text-sm font-700 text-fg" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
            {total.toLocaleString()}
          </span>
        )}
      </div>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
            <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} tickFormatter={compactTick} />
            <Tooltip content={<CustomTooltip color={color} valueLabel={title} />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

GrowthChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  dataKey: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  total: PropTypes.number,
};
