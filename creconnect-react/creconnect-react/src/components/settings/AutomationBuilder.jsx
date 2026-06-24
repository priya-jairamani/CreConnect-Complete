import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/common/Button';
import Switch from '@/components/common/Switch';
import Badge from '@/components/common/Badge';
import { CONDITION_FIELDS, CONDITION_OPERATORS, AUTOMATION_ACTIONS } from '@/utils/mockSettings';

function simulateMatches(condition) {
  if (!condition.value) return null;
  const seed = `${condition.field}${condition.operator}${condition.value}`
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (seed * 37) % 4200 + 18;
}

/** IF/THEN automation rule builder — condition/trigger builder with a rule simulator and saved rule list. */
export default function AutomationBuilder({ rules, onCreateRule, onToggleRule, onDeleteRule }) {
  const [name, setName] = useState('');
  const [field, setField] = useState(CONDITION_FIELDS[0]);
  const [operator, setOperator] = useState(CONDITION_OPERATORS[0]);
  const [value, setValue] = useState('');
  const [action, setAction] = useState(AUTOMATION_ACTIONS[0]);

  const matches = simulateMatches({ field, operator, value });

  function handleCreate() {
    if (!name.trim() || !value.trim()) return;
    onCreateRule({
      id: `rule-${Date.now()}`,
      name: name.trim(),
      condition: { field, operator, value: value.trim() },
      action,
      enabled: true,
    });
    setName('');
    setValue('');
  }

  return (
    <div className="card rounded-2xl p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Automation Builder</h3>
        <p className="text-fg-muted text-xs mt-0.5">Create custom IF / THEN governance rules. Use the simulator to preview impact before saving.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="automation-name" className="text-sm font-medium text-fg">Rule Name</label>
        <input
          id="automation-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Flag accounts with unusually high risk"
          className="input-base w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">IF — Condition</span>
          <select value={field} onChange={(e) => setField(e.target.value)} className="input-base w-full">
            {CONDITION_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted opacity-0 hidden md:block">Operator</span>
          <select value={operator} onChange={(e) => setOperator(e.target.value)} className="input-base w-full">
            {CONDITION_OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted opacity-0 hidden md:block">Value</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value, e.g. 75"
            className="input-base w-full"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">THEN — Action</span>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="input-base w-full md:w-1/2">
          {AUTOMATION_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {matches !== null && (
        <div className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
          <p className="text-xs text-fg-muted">
            <span className="font-semibold text-fg">Rule Simulator:</span> if this rule were active today, an estimated{' '}
            <span className="font-semibold text-brand-400">{matches.toLocaleString()} accounts</span> would currently match this condition.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button size="sm" variant="primary" onClick={handleCreate} disabled={!name.trim() || !value.trim()}>
          Save Automation Rule
        </Button>
      </div>

      {rules.length > 0 && (
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-fg">{rule.name}</p>
                  <Badge variant={rule.enabled ? 'success' : 'neutral'} label={rule.enabled ? 'Active' : 'Paused'} dot />
                </div>
                <p className="text-xs text-fg-muted mt-1">
                  IF <span className="text-fg">{rule.condition.field}</span> {rule.condition.operator} <span className="text-fg">{rule.condition.value}</span>
                  {' '}THEN <span className="text-fg">{rule.action}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Switch checked={rule.enabled} onChange={() => onToggleRule(rule.id)} />
                <button
                  type="button"
                  onClick={() => onDeleteRule(rule.id)}
                  className="text-xs font-medium text-danger hover:text-danger/80 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

AutomationBuilder.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    condition: PropTypes.shape({
      field: PropTypes.string.isRequired,
      operator: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
    action: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
  })).isRequired,
  onCreateRule: PropTypes.func.isRequired,
  onToggleRule: PropTypes.func.isRequired,
  onDeleteRule: PropTypes.func.isRequired,
};
