import Avatar from '@/components/common/Avatar';
import OpsChart from './OpsChart';
import ActivityFeed from './ActivityFeed';
import {
  ACTIVITY_STREAM, ACTIVITY_ANALYTICS, OPERATIONAL_INSIGHTS, ADMIN_PERFORMANCE,
} from '@/utils/mockOperations';

/** Activity Intelligence Engine — live activity stream, platform analytics, operational insights & admin performance. */
export default function ActivityIntelligenceTab() {
  return (
    <div className="space-y-6">
      {/* Activity Stream */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Activity Stream</h3>
        <div className="card rounded-2xl p-4">
          <ActivityFeed items={ACTIVITY_STREAM} limit={12} />
        </div>
      </div>

      {/* Activity Analytics */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Activity Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OpsChart title="Platform Activity Volume" subtitle="All platform events, last 14 days" data={ACTIVITY_ANALYTICS.platformActivity} series={[{ key: 'value', label: 'Events', color: '#6d5cff' }]} />
          <OpsChart title="Admin Activity" subtitle="Admin actions, last 14 days" data={ACTIVITY_ANALYTICS.adminActivity} series={[{ key: 'value', label: 'Admin Actions', color: '#857fff' }]} />
          <OpsChart title="Moderator Activity" subtitle="Moderation actions, last 14 days" data={ACTIVITY_ANALYTICS.moderatorActivity} series={[{ key: 'value', label: 'Moderation Actions', color: '#16b364' }]} />
          <OpsChart title="Campaign Activity" subtitle="Campaign launches & updates, last 14 days" data={ACTIVITY_ANALYTICS.campaignActivity} series={[{ key: 'value', label: 'Campaign Events', color: '#f59e0b' }]} />
          <OpsChart title="Payment Activity" subtitle="Payment & payout events, last 14 days" data={ACTIVITY_ANALYTICS.paymentActivity} series={[{ key: 'value', label: 'Payment Events', color: '#0ea5e9' }]} />
        </div>
      </div>

      {/* Operational Insights */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Operational Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs text-fg-muted">Most Active Admin</p>
            <div className="flex items-center gap-2">
              <Avatar initials={OPERATIONAL_INSIGHTS.mostActiveAdmin.initials} color={OPERATIONAL_INSIGHTS.mostActiveAdmin.color} size="sm" />
              <span className="text-sm font-semibold text-fg">{OPERATIONAL_INSIGHTS.mostActiveAdmin.name}</span>
            </div>
            <p className="text-xs text-fg-muted">{OPERATIONAL_INSIGHTS.mostActiveAdmin.metric}</p>
          </div>
          <div className="card rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs text-fg-muted">Most Productive Moderator</p>
            <div className="flex items-center gap-2">
              <Avatar initials={OPERATIONAL_INSIGHTS.mostProductiveModerator.initials} color={OPERATIONAL_INSIGHTS.mostProductiveModerator.color} size="sm" />
              <span className="text-sm font-semibold text-fg">{OPERATIONAL_INSIGHTS.mostProductiveModerator.name}</span>
            </div>
            <p className="text-xs text-fg-muted">{OPERATIONAL_INSIGHTS.mostProductiveModerator.metric}</p>
          </div>
          <div className="card rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs text-fg-muted">Highest Ticket Volume Category</p>
            <p className="text-sm font-semibold text-fg mt-1">{OPERATIONAL_INSIGHTS.highestTicketVolumeCategory.name}</p>
            <p className="text-xs text-fg-muted">{OPERATIONAL_INSIGHTS.highestTicketVolumeCategory.metric}</p>
          </div>
          <div className="card rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs text-fg-muted">Most Common User Issue</p>
            <p className="text-sm font-semibold text-fg mt-1">{OPERATIONAL_INSIGHTS.mostCommonUserIssue.name}</p>
            <p className="text-xs text-fg-muted">{OPERATIONAL_INSIGHTS.mostCommonUserIssue.metric}</p>
          </div>
          <div className="card rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs text-fg-muted">Fastest Resolution Team</p>
            <p className="text-sm font-semibold text-fg mt-1">{OPERATIONAL_INSIGHTS.fastestResolutionTeam.name}</p>
            <p className="text-xs text-fg-muted">{OPERATIONAL_INSIGHTS.fastestResolutionTeam.metric}</p>
          </div>
        </div>
      </div>

      {/* Admin Performance Dashboard */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Admin Performance Dashboard</h3>
        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 760 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Team Member</th>
                  <th className="px-3 py-3 text-left">Role</th>
                  <th className="px-3 py-3 text-center">Cases Resolved</th>
                  <th className="px-3 py-3 text-center">Tickets Closed</th>
                  <th className="px-3 py-3 text-center">Investigations</th>
                  <th className="px-3 py-3 text-center">Response Time</th>
                  <th className="px-3 py-3 text-center">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_PERFORMANCE.map((a) => (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={a.initials} color={a.color} size="sm" />
                        <span className="text-fg font-medium whitespace-nowrap">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{a.role}</td>
                    <td className="px-3 py-3 text-center text-fg">{a.casesResolved}</td>
                    <td className="px-3 py-3 text-center text-fg">{a.ticketsClosed}</td>
                    <td className="px-3 py-3 text-center text-fg">{a.investigationsCompleted}</td>
                    <td className="px-3 py-3 text-center text-fg-muted">{a.responseTimeMin}m</td>
                    <td className="px-3 py-3 text-center text-fg-muted">{a.accuracyPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
