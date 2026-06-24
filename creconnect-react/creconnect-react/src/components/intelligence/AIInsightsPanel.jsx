import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';

export default function AIInsightsPanel({ insights }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Badge variant="accent" label="AI-generated" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {insights.map((text, i) => (
          <div
            key={i}
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span className="text-lg flex-shrink-0">✨</span>
            <p className="text-fg text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

AIInsightsPanel.propTypes = {
  insights: PropTypes.arrayOf(PropTypes.string).isRequired,
};
