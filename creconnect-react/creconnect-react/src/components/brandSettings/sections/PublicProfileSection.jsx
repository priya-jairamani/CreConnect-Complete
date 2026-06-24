import PropTypes from 'prop-types';
import Switch from '@/components/common/Switch';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

const TOGGLES = [
  { key: 'publicProfileVisible', label: 'Public Profile Visibility', description: 'Allow creators to discover and view your brand profile' },
  { key: 'displayTeamMembers', label: 'Display Team Members', description: 'Show your team & contacts section to creators' },
  { key: 'displayCampaignResults', label: 'Display Campaign Results', description: 'Show past campaign performance and ROI history' },
  { key: 'displayReviews', label: 'Display Reviews', description: 'Show creator reviews and satisfaction trends' },
  { key: 'displayBudgetRanges', label: 'Display Budget Ranges', description: 'Show your typical campaign budget tiers' },
  { key: 'displayContactInfo', label: 'Display Contact Information', description: 'Show direct contact details on your profile' },
];

export default function PublicProfileSection({ values, onChange, brand }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-2">Visibility Controls</h3>
        {TOGGLES.map((t) => (
          <div key={t.key} className="py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <Switch
              checked={Boolean(values[t.key])}
              onChange={(checked) => onChange(t.key, checked)}
              label={t.label}
              description={t.description}
            />
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-2">Live Preview</h3>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="h-16" style={{ background: 'linear-gradient(135deg, #857fff 0%, #4c2dd1 100%)' }} />
          <div className="p-4 -mt-8 space-y-3">
            <div className="flex items-end gap-3">
              <div className="rounded-full border-4" style={{ borderColor: 'var(--surface)' }}>
                <Avatar src={brand?.logoUrl} initials={brand?.companyName?.slice(0, 2)?.toUpperCase()} size="lg" />
              </div>
              <div className="min-w-0 pb-1">
                <p className="font-semibold text-fg text-sm truncate">{brand?.companyName || 'Your Brand'}</p>
                <p className="text-fg-muted text-xs">{brand?.industry || 'General'}</p>
              </div>
            </div>
            {!values.publicProfileVisible ? (
              <div className="rounded-xl px-3 py-2 text-xs text-warning" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)' }}>
                ⚠ Your profile is hidden — creators won&apos;t be able to find or view it.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {values.displayTeamMembers && <Badge variant="brand" label="Team & Contacts" />}
                {values.displayCampaignResults && <Badge variant="brand" label="Campaign Results" />}
                {values.displayReviews && <Badge variant="brand" label="Reviews" />}
                {values.displayBudgetRanges && <Badge variant="brand" label="Budget Ranges" />}
                {values.displayContactInfo && <Badge variant="brand" label="Contact Info" />}
              </div>
            )}
            <p className="text-fg-muted text-xs">This is a simplified preview of what creators will see on your public Brand Portfolio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

PublicProfileSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  brand: PropTypes.object,
};
