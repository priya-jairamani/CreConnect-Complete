import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import Switch from '@/components/common/Switch';
import Badge from '@/components/common/Badge';
import GenericSettingsSection from './GenericSettingsSection';
import AutomationBuilder from './AutomationBuilder';
import AIAdvisorCard from './AIAdvisorCard';

/** Most advanced settings section — AI feature toggles, confidence thresholds & the full automation engine. */
export default function AIAutomationSection({
  values, onChange, modifiedFields, highlightFieldId,
  automationRules, onToggleAutomationRule,
  customAutomations, onCreateAutomation, onToggleAutomation, onDeleteAutomation,
  advisorRecommendations, onApplyRecommendation, onDismissRecommendation,
}) {
  return (
    <div className="space-y-5">
      <GenericSettingsSection
        sectionId="ai_automation"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
        groupIds={['ai_features', 'ai_confidence']}
      />

      <CollapsibleSection icon="⚡" title="Automation Engine" subtitle="Platform-managed automation workflows.">
        <div className="space-y-2">
          {automationRules.map((rule) => (
            <div key={rule.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-fg">{rule.name}</p>
                  <Badge variant="neutral" label={rule.category} />
                  <Badge variant={rule.status === 'active' ? 'success' : 'neutral'} label={rule.status === 'active' ? 'Active' : 'Paused'} dot />
                </div>
                <p className="text-xs text-fg-muted mt-0.5">{rule.description} · {rule.runsToday} runs today</p>
              </div>
              <Switch checked={rule.status === 'active'} onChange={() => onToggleAutomationRule(rule.id)} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <AutomationBuilder
        rules={customAutomations}
        onCreateRule={onCreateAutomation}
        onToggleRule={onToggleAutomation}
        onDeleteRule={onDeleteAutomation}
      />

      <CollapsibleSection icon="🧭" title="AI Settings Advisor" subtitle="AI-analyzed recommendations for this configuration — a CreConnect exclusive.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advisorRecommendations.map((rec) => (
            <AIAdvisorCard key={rec.id} recommendation={rec} onApply={onApplyRecommendation} onDismiss={onDismissRecommendation} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

AIAutomationSection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
  automationRules: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggleAutomationRule: PropTypes.func.isRequired,
  customAutomations: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCreateAutomation: PropTypes.func.isRequired,
  onToggleAutomation: PropTypes.func.isRequired,
  onDeleteAutomation: PropTypes.func.isRequired,
  advisorRecommendations: PropTypes.arrayOf(PropTypes.object).isRequired,
  onApplyRecommendation: PropTypes.func.isRequired,
  onDismissRecommendation: PropTypes.func.isRequired,
};
