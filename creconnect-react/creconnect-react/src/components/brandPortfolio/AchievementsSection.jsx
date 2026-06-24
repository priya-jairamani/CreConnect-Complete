import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { formatFollowers } from '@/utils/formatters';

export default function AchievementsSection({ achievements }) {
  const { awards, certifications, recognitions, featuredCampaigns } = achievements;

  return (
    <div className="space-y-5">
      {awards.length > 0 && (
        <div>
          <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">🏆 Awards</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {awards.map((a) => (
              <div key={a.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="text-2xl flex-shrink-0">🏆</span>
                <div className="min-w-0">
                  <p className="text-fg text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="text-fg-muted text-xs mt-0.5">{a.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">📜 Certifications</p>
          <div className="flex flex-wrap gap-1.5">
            {certifications.map((c) => (
              <Badge key={c.id} variant="brand" label={`✓ ${c.title}`} />
            ))}
          </div>
        </div>
      )}

      {recognitions.length > 0 && (
        <div>
          <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">⭐ Industry Recognition</p>
          <div className="space-y-2">
            {recognitions.map((r) => (
              <div key={r.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="text-lg flex-shrink-0">⭐</span>
                <p className="text-fg text-sm">{r.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {featuredCampaigns.length > 0 && (
        <div>
          <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">🎬 Featured Campaigns</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {featuredCampaigns.map((c) => (
              <div key={c.id} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <h4 className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>{c.title}</h4>
                <div className="flex items-center gap-4 text-xs text-fg-muted">
                  <span>👥 {c.creators} creators</span>
                  <span>📡 {formatFollowers(c.reach)} reach</span>
                </div>
                <p className="text-success text-xs font-medium">{c.result}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

AchievementsSection.propTypes = {
  achievements: PropTypes.shape({
    awards: PropTypes.array.isRequired,
    certifications: PropTypes.array.isRequired,
    recognitions: PropTypes.array.isRequired,
    featuredCampaigns: PropTypes.array.isRequired,
  }).isRequired,
};
