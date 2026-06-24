import PropTypes from 'prop-types';
import Switch from '@/components/common/Switch';

const AI_FEATURES = [
  { key: 'creatorRecommendations', icon: '🎯', label: 'Creator Recommendations', description: 'AI-curated creator matches for your campaigns' },
  { key: 'campaignForecasting', icon: '📈', label: 'Campaign Forecasting', description: 'Predict reach, engagement, and ROI before launch' },
  { key: 'budgetSuggestions', icon: '💰', label: 'Budget Suggestions', description: 'AI-recommended budgets based on goals and market data' },
  { key: 'aiOutreach', icon: '✉️', label: 'AI Outreach Generation', description: 'Auto-draft outreach messages to creators' },
  { key: 'aiAnalyticsInsights', icon: '🤖', label: 'AI Analytics Insights', description: 'Personalized insights on your dashboard and reports' },
];

export default function AISettingsSection({ values, onChange }) {
  return (
    <div className="space-y-1">
      <p className="text-fg-muted text-sm mb-3">Control which AI Copilot features are active across your workspace.</p>
      {AI_FEATURES.map((f) => (
        <div key={f.key} className="py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
          <Switch
            checked={Boolean(values[f.key])}
            onChange={(v) => onChange(f.key, v)}
            label={`${f.icon} ${f.label}`}
            description={f.description}
          />
        </div>
      ))}
    </div>
  );
}

AISettingsSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
