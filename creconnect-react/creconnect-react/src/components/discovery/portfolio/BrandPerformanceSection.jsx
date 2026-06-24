import PropTypes from 'prop-types';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import { formatPKR } from '@/utils/formatters';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

function MiniChart({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <ResponsiveContainer width="100%" height={150}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
MiniChart.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export default function BrandPerformanceSection({ intel, series }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon="📣" value={intel.completedCollaborations} label="Campaigns Completed" />
        <StatCard icon="😊" value={`${intel.satisfactionScore}%`} label="Creator Satisfaction" />
        <StatCard icon="✅" value={`${intel.campaignSuccessRate}%`} label="Campaign Success Rate" />
        <StatCard icon="💰" value={formatPKR(intel.avgBudget)} label="Average Budget" />
        <StatCard icon="👥" value={intel.totalCreatorsHired} label="Total Creators Hired" />
        <StatCard icon="↻" value={intel.repeatCollaborations} label="Repeat Collaborations" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <MiniChart title="Campaign Growth">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="campaignGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#857fff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#857fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="campaigns" stroke="#857fff" fill="url(#campaignGrowthFill)" strokeWidth={2} />
          </AreaChart>
        </MiniChart>

        <MiniChart title="Creator Acquisition">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="creators" stroke="#16b364" strokeWidth={2} dot={false} />
          </LineChart>
        </MiniChart>

        <MiniChart title="Monthly Spending">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5a623" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatPKR(v)} />
            <Area type="monotone" dataKey="spend" stroke="#f5a623" fill="url(#spendFill)" strokeWidth={2} />
          </AreaChart>
        </MiniChart>

        <MiniChart title="Collaboration Trends">
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            <Bar dataKey="collabRate" fill="#6d5cff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </MiniChart>
      </div>
    </div>
  );
}

BrandPerformanceSection.propTypes = {
  intel: PropTypes.object.isRequired,
  series: PropTypes.arrayOf(PropTypes.object).isRequired,
};
