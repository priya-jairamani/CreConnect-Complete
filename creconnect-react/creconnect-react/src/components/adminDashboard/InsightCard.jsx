import PropTypes from 'prop-types';

const IMPACT_STYLES = {
  high:   { label: 'High Impact',   className: 'bg-danger/15 text-danger' },
  medium: { label: 'Medium Impact', className: 'bg-warning/15 text-warning' },
  low:    { label: 'Low Impact',    className: 'bg-success/15 text-success' },
};

/** AI-generated insight card with confidence meter, category & impact badges. */
export default function InsightCard({ insight }) {
  const { icon, category, impact, confidence, text } = insight;
  const impactStyle = IMPACT_STYLES[impact] ?? IMPACT_STYLES.low;

  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-base">
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${impactStyle.className}`}>
          {impactStyle.label}
        </span>
      </div>

      <p className="text-sm text-fg leading-relaxed flex-1">{text}</p>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-subtle">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{category}</span>
        <div className="flex items-center gap-2 flex-1 max-w-[120px]">
          <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-gradient"
              style={{ width: `${confidence}%`, transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }}
            />
          </div>
          <span className="text-xs text-fg-muted whitespace-nowrap">{confidence}%</span>
        </div>
      </div>
    </div>
  );
}

InsightCard.propTypes = {
  insight: PropTypes.shape({
    icon: PropTypes.node,
    category: PropTypes.string.isRequired,
    impact: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    confidence: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};
