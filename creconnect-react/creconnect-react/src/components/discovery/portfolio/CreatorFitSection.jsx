import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';

export default function CreatorFitSection({ fit }) {
  if (!fit) return null;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {fit.map((f) => (
        <div key={f.key} className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ScoreRing value={f.value} size={64} strokeWidth={5} />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>{f.label}</p>
          <p className="text-fg-muted text-xs leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

CreatorFitSection.propTypes = {
  fit: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    desc: PropTypes.string.isRequired,
  })).isRequired,
};
