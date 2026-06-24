import CampaignPerformanceChart from './CampaignPerformanceChart';
import {
  CAMPAIGN_GROWTH_SERIES, SUCCESS_TREND_SERIES, PARTICIPATION_TREND_SERIES,
  BUDGET_TREND_SERIES, ENGAGEMENT_TREND_SERIES, REACH_TREND_SERIES, CONVERSION_TREND_SERIES,
  INDUSTRY_PERFORMANCE, TOP_CATEGORIES, TOP_CAMPAIGNS,
} from '@/utils/mockCampaignIntelligence';
import { formatFollowers, formatCompactPKR } from '@/utils/formatters';

const LEADERBOARDS = [
  { key: 'highestReach', label: 'Highest Reach', icon: '📡', format: (v) => formatFollowers(v) },
  { key: 'highestEngagement', label: 'Highest Engagement', icon: '💬', format: (v) => `${v}%` },
  { key: 'highestROI', label: 'Highest ROI', icon: '📈', format: (v) => `${v}%` },
  { key: 'highestRevenue', label: 'Highest Revenue', icon: '💰', format: (v) => formatCompactPKR(v) },
  { key: 'highestSatisfaction', label: 'Highest Creator Satisfaction', icon: '⭐', format: (v) => `${v}/100` },
];

const maxCategory = Math.max(...TOP_CATEGORIES.map((c) => c.value), 1);

/** Platform-wide campaign analytics — growth, trends, industry comparison & top-performer leaderboards. */
export default function PerformanceAnalyticsTab() {
  return (
    <div className="space-y-6">
      <CampaignPerformanceChart
        title="Campaign Growth"
        subtitle="Created vs. completed campaigns over time"
        data={CAMPAIGN_GROWTH_SERIES}
        series={[
          { key: 'created', label: 'Created', color: '#6d5cff' },
          { key: 'completed', label: 'Completed', color: '#16b364' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CampaignPerformanceChart
          title="Campaign Success Trends"
          subtitle="Platform-wide success rate"
          data={SUCCESS_TREND_SERIES}
          series={[{ key: 'successRate', label: 'Success Rate %', color: '#16b364' }]}
        />
        <CampaignPerformanceChart
          title="Creator Participation Trends"
          subtitle="Share of creators actively participating"
          data={PARTICIPATION_TREND_SERIES}
          series={[{ key: 'participation', label: 'Participation %', color: '#22c1ff' }]}
        />
      </div>

      <CampaignPerformanceChart
        title="Budget Trends"
        subtitle="Allocated vs. spent budget (PKR)"
        data={BUDGET_TREND_SERIES}
        series={[
          { key: 'allocated', label: 'Allocated', color: '#6d5cff' },
          { key: 'spent', label: 'Spent', color: '#f59e0b' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CampaignPerformanceChart
          title="Engagement Trend"
          data={ENGAGEMENT_TREND_SERIES}
          series={[{ key: 'engagement', label: 'Engagement', color: '#f0445f' }]}
          height={180}
        />
        <CampaignPerformanceChart
          title="Reach Trend"
          data={REACH_TREND_SERIES}
          series={[{ key: 'reach', label: 'Reach', color: '#857fff' }]}
          height={180}
        />
        <CampaignPerformanceChart
          title="Conversion Trend"
          data={CONVERSION_TREND_SERIES}
          series={[{ key: 'conversions', label: 'Conversions', color: '#16b364' }]}
          height={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Industry Performance */}
        <div className="card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Industry Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 560 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Industry</th>
                  <th className="px-3 py-2 text-right">Avg ROI</th>
                  <th className="px-3 py-2 text-right">Avg Engagement</th>
                  <th className="px-3 py-2 text-right">Total Reach</th>
                  <th className="px-3 py-2 text-right">Success Rate</th>
                  <th className="px-3 py-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {INDUSTRY_PERFORMANCE.map((ip, i) => (
                  <tr key={ip.industry} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-3 py-2.5 text-fg-muted">{i + 1}</td>
                    <td className="px-3 py-2.5 text-fg font-medium">{ip.industry}</td>
                    <td className="px-3 py-2.5 text-right text-fg">{ip.avgROI}%</td>
                    <td className="px-3 py-2.5 text-right text-fg-muted">{ip.avgEngagement}%</td>
                    <td className="px-3 py-2.5 text-right text-fg-muted">{formatFollowers(ip.totalReach)}</td>
                    <td className="px-3 py-2.5 text-right text-fg-muted">{ip.successRate}%</td>
                    <td className="px-3 py-2.5 text-right font-semibold" style={{ color: ip.trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {ip.trend >= 0 ? '▲' : '▼'} {Math.abs(ip.trend)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Campaign Categories */}
        <div className="card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Top Campaign Categories</h3>
          <div className="space-y-3">
            {TOP_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-fg-muted">{cat.label}</span>
                  <span className="text-fg font-medium">{cat.value}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(cat.value / maxCategory) * 100}%`, backgroundImage: 'linear-gradient(90deg, var(--brand-700), var(--brand-500))' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Campaigns leaderboards */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Top Campaigns</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {LEADERBOARDS.map((board) => {
            const items = TOP_CAMPAIGNS[board.key] ?? [];
            return (
              <div key={board.key} className="card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{board.icon}</span>
                  <h4 className="text-xs font-semibold text-fg uppercase tracking-wide">{board.label}</h4>
                </div>
                <div className="space-y-2.5">
                  {items.map((item, i) => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-fg truncate">{i + 1}. {item.name}</p>
                        <p className="text-[11px] text-fg-muted truncate">{item.brand}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-400 flex-shrink-0">{board.format(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
