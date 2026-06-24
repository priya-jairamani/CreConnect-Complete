import PropTypes from 'prop-types';
import Switch from '@/components/common/Switch';
import Badge from '@/components/common/Badge';

/** AI automation rule card — toggle, category badge & today's run count. */
export default function AutomationCard({ automation, onToggle }) {
  const active = automation.status === 'active';

  return (
    <div className="card rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">{automation.name}</p>
          <p className="text-xs text-fg-muted mt-1 leading-relaxed">{automation.description}</p>
        </div>
        <Switch checked={active} onChange={() => onToggle?.(automation)} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <Badge variant="brand" label={automation.category} />
        <span className="text-xs text-fg-muted">{automation.runsToday} run{automation.runsToday === 1 ? '' : 's'} today</span>
      </div>
    </div>
  );
}

AutomationCard.propTypes = {
  automation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['active', 'paused']).isRequired,
    runsToday: PropTypes.number.isRequired,
  }).isRequired,
  onToggle: PropTypes.func,
};
