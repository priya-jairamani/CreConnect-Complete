import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import OperationsHealthRing from './OperationsHealthRing';
import OpsChart from './OpsChart';
import AIInsightCard from './AIInsightCard';
import AutomationCard from './AutomationCard';
import QueueMonitor from './QueueMonitor';
import ProductivityScoreCard from './ProductivityScoreCard';
import { timeAgo } from '@/utils/formatters';
import {
  AI_HEALTH_SUMMARY, AI_INSIGHTS, AI_PREDICTIONS, AI_ANOMALY_META, AI_ANOMALIES,
  AI_AUTOMATIONS, AI_RECOMMENDED_ACTIONS, OPERATIONS_WORKLOAD, TEAM_PRODUCTIVITY,
  KNOWLEDGE_TYPE_META, KNOWLEDGE_ITEMS,
} from '@/utils/mockOperations';

const PREDICTION_LABELS = {
  supportTicketVolume: { title: 'Support Ticket Volume', unit: '' },
  verificationQueueGrowth: { title: 'Verification Queue Growth', unit: '' },
  fraudCases: { title: 'Fraud Cases', unit: '' },
  campaignDelays: { title: 'Campaign Delays', unit: '' },
  revenueTrends: { title: 'Revenue Trends', unit: '' },
  platformLoad: { title: 'Platform Load', unit: '%' },
};

const IMPACT_META = {
  high: { label: 'High Impact', variant: 'danger' },
  medium: { label: 'Medium Impact', variant: 'warning' },
  low: { label: 'Low Impact', variant: 'neutral' },
};

const ACTION_BUTTONS = ['Approve', 'Dismiss', 'Schedule', 'Assign'];

const TEAM_TABS = [
  { key: 'admins', label: 'Admins' },
  { key: 'moderators', label: 'Moderators' },
  { key: 'supportAgents', label: 'Support Agents' },
  { key: 'verificationTeam', label: 'Verification Team' },
];

/** Flagship AI Operations Copilot — executive AI command center, predictions, anomalies, automations & knowledge base. */
export default function AICopilotTab({ onAutomationToggle, onRecommendedAction }) {
  const [automations, setAutomations] = useState(AI_AUTOMATIONS);
  const [teamTab, setTeamTab] = useState('admins');
  const [kbSearch, setKbSearch] = useState('');

  function handleToggle(automation) {
    setAutomations((prev) => prev.map((a) => (a.id === automation.id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a)));
    onAutomationToggle?.(automation);
  }

  const filteredKnowledge = useMemo(() => {
    const q = kbSearch.trim().toLowerCase();
    if (!q) return KNOWLEDGE_ITEMS;
    return KNOWLEDGE_ITEMS.filter((k) =>
      k.title.toLowerCase().includes(q) ||
      k.category.toLowerCase().includes(q) ||
      k.summary.toLowerCase().includes(q)
    );
  }, [kbSearch]);

  const activeAutomations = automations.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* AI Command Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Command Center</h3>
        <div className="card rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
          <OperationsHealthRing score={AI_HEALTH_SUMMARY.score} size={120} strokeWidth={9} label="AI Health Summary" />
          <div className="space-y-4">
            <p className="text-sm text-fg leading-relaxed">{AI_HEALTH_SUMMARY.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">AI Recommendations</p>
                <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{AI_RECOMMENDED_ACTIONS.length}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">AI Predictions</p>
                <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{Object.keys(AI_PREDICTIONS).length}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">AI Alerts</p>
                <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{AI_ANOMALIES.length}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">Active Automations</p>
                <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{activeAutomations}/{automations.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <OpsChart
            title="AI Health Score Trend"
            subtitle="7-day operations health score as assessed by AI"
            data={AI_HEALTH_SUMMARY.trend}
            series={[{ key: 'score', label: 'Health Score', color: '#6d5cff' }]}
            type="line"
            height={160}
          />
        </div>
      </div>

      {/* AI Insights Engine */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Insights Engine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_INSIGHTS.map((insight) => <AIInsightCard key={insight.id} insight={insight} />)}
        </div>
      </div>

      {/* AI Predictions */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Predictions</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(AI_PREDICTIONS).map(([key, data]) => (
            <OpsChart
              key={key}
              title={PREDICTION_LABELS[key]?.title ?? key}
              subtitle="6-day history with 3-day AI forecast"
              data={data}
              series={[
                { key: 'actual', label: 'Actual', color: '#6d5cff' },
                { key: 'forecast', label: 'AI Forecast', color: '#16b364', dashed: true },
              ]}
              type="line"
              unit={PREDICTION_LABELS[key]?.unit}
            />
          ))}
        </div>
      </div>

      {/* AI Anomaly Detection */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Anomaly Detection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_ANOMALIES.map((anom) => {
            const meta = AI_ANOMALY_META[anom.type] ?? AI_ANOMALY_META.traffic_spike;
            return (
              <div key={anom.id} className="card rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-base">{meta.icon}</div>
                  <Badge variant={meta.variant} label={meta.label} />
                </div>
                <p className="text-sm font-semibold text-fg">{anom.title}</p>
                <p className="text-xs text-fg-muted leading-relaxed flex-1">{anom.description}</p>
                <p className="text-xs text-fg-muted">{timeAgo(anom.detectedAt)} ago</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Automation Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Automation Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((automation) => (
            <AutomationCard key={automation.id} automation={automation} onToggle={handleToggle} />
          ))}
        </div>
      </div>

      {/* AI Recommended Actions */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>AI Recommended Actions</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {AI_RECOMMENDED_ACTIONS.map((rec) => {
            const impact = IMPACT_META[rec.impact] ?? IMPACT_META.low;
            return (
              <div key={rec.id} className="card rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-fg leading-relaxed">{rec.title}</p>
                  <Badge variant={impact.variant} label={impact.label} />
                </div>
                <div className="flex items-center gap-4 text-xs text-fg-muted">
                  <span>Confidence <span className="font-semibold text-fg">{rec.confidence}%</span></span>
                  <span>Time Saved <span className="font-semibold text-fg">{rec.timeSavedHours}h</span></span>
                  <Badge variant="brand" label={rec.category} />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
                  {ACTION_BUTTONS.map((action) => (
                    <Button
                      key={action}
                      variant={action === 'Approve' ? 'success' : action === 'Dismiss' ? 'danger' : 'secondary'}
                      size="xs"
                      onClick={() => onRecommendedAction?.(action, rec)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operations Workload View */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Operations Workload View</h3>
        <QueueMonitor queues={OPERATIONS_WORKLOAD} />
      </div>

      {/* Team Productivity Analytics */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Team Productivity Analytics</h3>
        <div className="card rounded-2xl p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {TEAM_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTeamTab(t.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${teamTab === t.key ? 'bg-brand-gradient text-white' : 'bg-surface-2 text-fg-muted hover:text-fg'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEAM_PRODUCTIVITY[teamTab].map((member) => (
              <ProductivityScoreCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge Center */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Knowledge Center</h3>
        <div className="card rounded-2xl p-4">
          <input
            type="text"
            value={kbSearch}
            onChange={(e) => setKbSearch(e.target.value)}
            placeholder="Search guides, policies, SOPs & playbooks…"
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-2 border border-border text-fg placeholder:text-fg-muted focus:outline-none focus:border-brand-500/50 mb-4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredKnowledge.map((k) => {
              const meta = KNOWLEDGE_TYPE_META[k.type] ?? KNOWLEDGE_TYPE_META.guide;
              return (
                <div key={k.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-fg leading-snug">{meta.icon} {k.title}</p>
                    <Badge variant={meta.variant} label={meta.label} />
                  </div>
                  <p className="text-xs text-fg-muted leading-relaxed">{k.summary}</p>
                  <p className="text-xs text-fg-muted mt-1.5">{k.category} · Updated {timeAgo(k.updatedAt)} ago</p>
                </div>
              );
            })}
            {filteredKnowledge.length === 0 && (
              <p className="text-sm text-fg-muted col-span-2 text-center py-4">No knowledge base articles match your search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

AICopilotTab.propTypes = {
  onAutomationToggle: PropTypes.func,
  onRecommendedAction: PropTypes.func,
};
