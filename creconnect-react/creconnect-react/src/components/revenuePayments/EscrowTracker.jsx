import PropTypes from 'prop-types';
import { formatCompactPKR } from '@/utils/formatters';

/** Escrow pipeline tracker — funds across the deposit → release stages. */
export default function EscrowTracker({ stages }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stages.map((stage, i) => (
        <div key={stage.id} className="card rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-gradient">{i + 1}</span>
          </div>
          <p className="text-xs text-fg-muted leading-tight">{stage.label}</p>
          <p className="text-xl font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{stage.count}</p>
          <p className="text-xs text-fg-muted mt-0.5">{formatCompactPKR(stage.amount)}</p>
        </div>
      ))}
    </div>
  );
}

EscrowTracker.propTypes = {
  stages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    amount: PropTypes.number.isRequired,
  })).isRequired,
};
