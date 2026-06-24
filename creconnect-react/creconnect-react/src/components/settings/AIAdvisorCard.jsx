import PropTypes from 'prop-types';
import Button from '@/components/common/Button';

const IMPACT_STYLES = {
  high:   { label: 'High Impact',   className: 'bg-danger/15 text-danger' },
  medium: { label: 'Medium Impact', className: 'bg-warning/15 text-warning' },
  low:    { label: 'Low Impact',    className: 'bg-success/15 text-success' },
};

/** AI Settings Advisor recommendation card — analyzes current configuration & suggests improvements. */
export default function AIAdvisorCard({ recommendation, onApply, onDismiss }) {
  const { category, impact, confidence, title, recommendation: text, action } = recommendation;
  const impactStyle = IMPACT_STYLES[impact] ?? IMPACT_STYLES.low;

  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{category}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${impactStyle.className}`}>{impactStyle.label}</span>
      </div>

      <div>
        <p className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</p>
        <p className="text-fg-muted text-xs mt-1 leading-relaxed">{text}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${confidence}%` }} />
        </div>
        <span className="text-xs text-fg-muted whitespace-nowrap">{confidence}% confidence</span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button size="sm" variant="primary" onClick={() => onApply?.(recommendation)} className="flex-1">
          {action}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDismiss?.(recommendation)}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

AIAdvisorCard.propTypes = {
  recommendation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    impact: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    confidence: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    recommendation: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
  }).isRequired,
  onApply: PropTypes.func,
  onDismiss: PropTypes.func,
};
