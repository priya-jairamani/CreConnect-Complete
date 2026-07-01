import PropTypes from 'prop-types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

function HeatmapChart({ title, data, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
          <YAxis type="category" dataKey="label" tick={axisTick} axisLine={false} tickLine={false} width={90} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
HeatmapChart.propTypes = { title: PropTypes.string.isRequired, data: PropTypes.array.isRequired, color: PropTypes.string.isRequired };

export default function PartnershipHeatmapSection({ heatmap }) {
  if (!heatmap) return null;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <HeatmapChart title="Best-Performing Niches" data={heatmap.niches} color="#857fff" />
      <HeatmapChart title="Best-Performing Regions" data={heatmap.regions} color="#16b364" />
      <HeatmapChart title="Best-Performing Formats" data={heatmap.formats} color="#f59e0b" />
    </div>
  );
}

PartnershipHeatmapSection.propTypes = {
  heatmap: PropTypes.shape({
    niches: PropTypes.array.isRequired,
    regions: PropTypes.array.isRequired,
    formats: PropTypes.array.isRequired,
  }).isRequired,
};
