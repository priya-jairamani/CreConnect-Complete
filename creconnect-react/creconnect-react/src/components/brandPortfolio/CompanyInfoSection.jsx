import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import PlatformIcon from '@/components/common/PlatformIcon';

/* Platform URL builders ─── */
const PLATFORM_URL_BUILDERS = {
  instagram: (h) => `https://instagram.com/${h.replace(/^@/, '')}`,
  facebook:  (h) => h.startsWith('http') ? h : `https://facebook.com/${h}`,
  linkedin:  (h) => h.startsWith('http') ? h : `https://linkedin.com/company/${h}`,
  tiktok:    (h) => `https://tiktok.com/@${h.replace(/^@/, '')}`,
  youtube:   (h) => `https://youtube.com/@${h.replace(/^@/, '')}`,
  x:         (h) => `https://x.com/${h.replace(/^@/, '')}`,
};

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-fg-muted text-[10px] uppercase tracking-widest">{label}</p>
        <div className="text-fg text-sm font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}
InfoRow.propTypes = { icon: PropTypes.string.isRequired, label: PropTypes.string.isRequired, value: PropTypes.node.isRequired };

/* Social link card with Open + Copy actions ─── */
function SocialLinkCard({ platform, handle }) {
  const [copied, setCopied] = useState(false);

  const safeHandle = typeof handle === 'string' ? handle : String(handle ?? '');
  const buildUrl = PLATFORM_URL_BUILDERS[platform];
  const url      = buildUrl && safeHandle ? buildUrl(safeHandle) : null;
  const label    = platform.charAt(0).toUpperCase() + platform.slice(1);

  const handleOpen = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url ?? safeHandle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 group"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <PlatformIcon platform={platform.toUpperCase()} size={16} />
      <div className="flex-1 min-w-0">
        <p className="text-fg text-sm font-medium">{label}</p>
        <p className="text-fg-muted text-xs truncate">{safeHandle}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          title="Copy link"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors hover:text-fg"
          style={{ background: 'var(--surface)', color: 'var(--fg-muted)' }}
        >
          {copied ? '✓' : '⎘'}
        </button>
        {url && (
          <button
            onClick={handleOpen}
            title="Open in new tab"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors hover:text-fg"
            style={{ background: 'var(--surface)', color: 'var(--fg-muted)' }}
          >
            ↗
          </button>
        )}
      </div>
    </div>
  );
}
SocialLinkCard.propTypes = {
  platform: PropTypes.string.isRequired,
  handle:   PropTypes.string.isRequired,
};

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'x'];

export default function CompanyInfoSection({ brand, meta, extras }) {
  // Only include platforms with a real string handle (guard against boolean values)
  const connectedSocials = SOCIAL_PLATFORMS.filter((p) => typeof extras.socialLinks?.[p] === 'string' && extras.socialLinks[p]);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <InfoRow icon="🏢" label="Industry"     value={brand.industry || 'General'} />
        <InfoRow icon="📅" label="Founded"      value={meta.foundedYear} />
        <InfoRow icon="📍" label="Headquarters" value={meta.headquarters} />
        <InfoRow icon="👥" label="Team Size"    value={extras.teamSize} />
        {brand.website && (
          <InfoRow
            icon="🌐"
            label="Website"
            value={
              <a
                href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline truncate"
              >
                {brand.website}
              </a>
            }
          />
        )}
        <InfoRow icon="🌍" label="Operating Countries" value={extras.operatingCountries.join(', ')} />
        <InfoRow icon="🗣" label="Languages" value={extras.languages.join(', ')} />
      </div>

      {connectedSocials.length > 0 && (
        <div>
          <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-3">Social Platforms</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {connectedSocials.map((p) => (
              <SocialLinkCard
                key={p}
                platform={p}
                handle={extras.socialLinks[p]}
              />
            ))}
          </div>
        </div>
      )}

      {meta.verificationBadges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {meta.verificationBadges.map((b) => (
            <Badge key={b.key} variant="brand" label={`${b.icon} ${b.label}`} />
          ))}
        </div>
      )}
    </div>
  );
}

CompanyInfoSection.propTypes = {
  brand:  PropTypes.object.isRequired,
  meta:   PropTypes.object.isRequired,
  extras: PropTypes.object.isRequired,
};
