import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

export default function TopCreatorsSection({ creators }) {
  if (!creators) return null;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {creators.map((c) => (
        <div key={c.id} className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <Avatar initials={c.name.slice(0, 2)} size="lg" />
          <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>{c.name}</p>
          <Badge variant="brand" label={c.niche} />
          <p className="text-success text-xs font-medium">{c.result}</p>
          <p className="text-fg-muted text-xs">{c.collaborations} collaboration{c.collaborations !== 1 ? 's' : ''}</p>
        </div>
      ))}
    </div>
  );
}

TopCreatorsSection.propTypes = {
  creators: PropTypes.array.isRequired,
};
