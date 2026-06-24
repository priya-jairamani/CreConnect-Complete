import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

export default function SuccessStoriesSection({ stories }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {stories.map((s) => (
        <div key={s.id} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Avatar initials={s.name.slice(0, 2)} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm font-semibold truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{s.name}</p>
              <Badge variant="brand" label={s.niche} />
            </div>
          </div>
          <p className="text-fg-muted text-sm leading-relaxed">{s.story}</p>
          <p className="text-success text-xs font-medium">{s.result}</p>
        </div>
      ))}
    </div>
  );
}

SuccessStoriesSection.propTypes = {
  stories: PropTypes.array.isRequired,
};
