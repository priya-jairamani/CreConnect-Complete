import PropTypes from 'prop-types';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import StatCard from '@/components/common/StatCard';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

export default function CampaignROISection({ history }) {
  if (!history?.length) return null;
  const avgRoi = Math.round(history.reduce((sum, h) => sum + h.roi, 0) / history.length);
  const latest = history[history.length - 1]?.roi ?? 0;
  const first = history[0]?.roi ?? 0;
  const trend = first ? Math.round(((latest - first) / first) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon="📊" value={`${avgRoi}%`} label="Average Campaign ROI" />
        <StatCard icon="📈" value={`${latest}%`} label="Latest Month ROI" trend={trend} />
        <StatCard icon="🗓" value={`${history.length} mo`} label="History Tracked" />
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>ROI Over Time</h4>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16b364" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#16b364" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            <Area type="monotone" dataKey="roi" stroke="#16b364" fill="url(#roiFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

CampaignROISection.propTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    month: PropTypes.string.isRequired,
    roi: PropTypes.number.isRequired,
  })).isRequired,
};
