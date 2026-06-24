import PropTypes from 'prop-types';

/** Visual conversion funnel for the campaign pipeline (Draft → Archived). */
export default function PipelineFunnel({ stages, onSelectStage, activeStage }) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPct = Math.max(8, (stage.count / max) * 100);
        const isActive = activeStage === stage.id;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onSelectStage?.(stage.id)}
            className="w-full flex items-center gap-3 group text-left"
          >
            <span className="w-44 flex-shrink-0 text-sm text-fg-muted truncate">{i + 1}. {stage.label}</span>
            <div className="flex-1 h-8 rounded-lg bg-surface-2 overflow-hidden relative">
              <div
                className="h-full rounded-lg flex items-center justify-end px-3 transition-all"
                style={{
                  width: `${widthPct}%`,
                  background: isActive ? 'var(--brand-500)' : 'var(--brand-gradient, var(--brand-500))',
                  backgroundImage: isActive ? undefined : 'linear-gradient(90deg, var(--brand-700), var(--brand-500))',
                  opacity: isActive ? 1 : 0.85,
                  border: isActive ? '1px solid var(--brand-400)' : 'none',
                }}
              >
                <span className="text-xs font-semibold text-white">{stage.count}</span>
              </div>
            </div>
            <span className="w-16 flex-shrink-0 text-xs text-fg-muted text-right">
              {i === 0 ? '—' : `${stage.conversion}%`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

PipelineFunnel.propTypes = {
  stages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    conversion: PropTypes.number.isRequired,
  })).isRequired,
  onSelectStage: PropTypes.func,
  activeStage: PropTypes.string,
};
