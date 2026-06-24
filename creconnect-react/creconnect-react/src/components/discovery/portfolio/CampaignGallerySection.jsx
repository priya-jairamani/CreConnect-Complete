import PropTypes from 'prop-types';
import { formatFollowers } from '@/utils/formatters';

export default function CampaignGallerySection({ gallery }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {gallery.map((g) => (
        <div key={g.id} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h4 className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>{g.title}</h4>
          <div className="flex items-center gap-4 text-xs text-fg-muted">
            <span>👥 {g.creators} creators</span>
            <span>📡 {formatFollowers(g.reach)} reach</span>
            <span>💬 {g.engagement}% engagement</span>
          </div>
          <p className="text-success text-xs font-medium">{g.result}</p>
        </div>
      ))}
    </div>
  );
}

CampaignGallerySection.propTypes = {
  gallery: PropTypes.array.isRequired,
};
