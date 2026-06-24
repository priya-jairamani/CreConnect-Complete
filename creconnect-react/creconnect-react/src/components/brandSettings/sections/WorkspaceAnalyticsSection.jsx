import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';

export default function WorkspaceAnalyticsSection({ analytics }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <StatCard icon="👥" value={`${analytics.teamActivityScore}%`} label="Team Activity Score" />
      <StatCard icon="📣" value={analytics.campaignsPerMonth} label="Campaign Productivity (per month)" />
      <StatCard icon="⚡" value={`${analytics.avgCreatorResponseHours}h`} label="Avg. Creator Response Time" />
      <StatCard icon="✅" value={analytics.tasksCompletedThisWeek} label="Tasks Completed This Week" />
      <StatCard icon="🟢" value={analytics.teamMembersOnline} label="Team Members Online" />
    </div>
  );
}

WorkspaceAnalyticsSection.propTypes = {
  analytics: PropTypes.object.isRequired,
};
