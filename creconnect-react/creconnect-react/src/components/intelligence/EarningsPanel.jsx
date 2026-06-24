import PropTypes from 'prop-types';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import { formatPKR } from '@/utils/formatters';
import { getEarningsBreakdown } from '@/utils/mockAnalytics';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };
const SOURCE_COLORS = ['#6d5cff', '#857fff', '#f59e0b', '#16b364', '#f0445f'];

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function EarningsPanel({ seed, totalEarnings, collaborations }) {
  const { series, sources } = getEarningsBreakdown(seed, 6, totalEarnings);

  const rates = collaborations.map((c) => c.agreedRate ?? 0).filter((r) => r > 0);
  const avgCampaignValue = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
  const highestCampaignValue = rates.length ? Math.max(...rates) : 0;

  const allPayments = collaborations.flatMap((c) => c.payments ?? []);
  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const escrowBalance = allPayments.filter((p) => p.status === 'ESCROWED').reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const monthlyEarnings = series[series.length - 1]?.earnings ?? 0;

  let cumulative = 0;
  const growthSeries = series.map((s) => {
    cumulative += s.earnings;
    return { month: s.month, total: cumulative };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Badge variant="neutral" label="Trends estimated" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard value={formatPKR(totalEarnings)} label="Total Earnings" icon="💰" highlight />
        <StatCard value={formatPKR(monthlyEarnings)} label="Monthly Earnings" icon="📅" />
        <StatCard value={formatPKR(avgCampaignValue)} label="Avg. Campaign Value" icon="📊" />
        <StatCard value={formatPKR(highestCampaignValue)} label="Highest Campaign Value" icon="🏆" />
        <StatCard value={formatPKR(pendingPayments)} label="Pending Payments" icon="⏳" />
        <StatCard value={formatPKR(escrowBalance)} label="Escrow Balance" icon="🔒" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatPKR(v)} />
              <Bar dataKey="earnings" fill="#6d5cff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Sources">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sources} dataKey="value" nameKey="label" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {sources.map((s, i) => <Cell key={s.label} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            {sources.map((s, i) => (
              <span key={s.label} className="flex items-center gap-1.5 text-xs text-fg-muted">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                {s.label} {s.value}%
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Earnings Growth (cumulative)">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={growthSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatPKR(v)} />
              <Area type="monotone" dataKey="total" stroke="#16b364" fill="#16b364" fillOpacity={0.2} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatPKR(v)} />
              <Line type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

ChartCard.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

EarningsPanel.propTypes = {
  seed: PropTypes.string.isRequired,
  totalEarnings: PropTypes.number,
  collaborations: PropTypes.array.isRequired,
};
