import PropTypes from 'prop-types';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { formatCompactPKR } from '@/utils/formatters';

function formatValue(value, format) {
  if (format === 'pkr') return formatCompactPKR(Math.round(value));
  return Math.round(value).toLocaleString();
}

/** Live marketplace-activity pulse card — value + delta since yesterday. */
export default function ActivityPulseCard({ icon, label, value, delta, format }) {
  return (
    <div className="card rounded-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-700 text-fg leading-none" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
          <AnimatedCounter value={value} format={(v) => formatValue(v, format)} />
        </p>
        <p className="text-fg-muted text-xs mt-1 leading-snug">{label}</p>
      </div>
      {typeof delta === 'number' && (
        <span className="text-xs font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
          +{formatValue(delta, format)}
        </span>
      )}
    </div>
  );
}

ActivityPulseCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  delta: PropTypes.number,
  format: PropTypes.oneOf(['number', 'pkr']),
};
