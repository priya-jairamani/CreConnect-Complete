import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { timeAgo } from '@/utils/formatters';
import GenericSettingsSection from './GenericSettingsSection';

/** Third-party platform management — connected services, API keys & webhook secrets. */
export default function IntegrationsSection({ values, onChange, modifiedFields, highlightFieldId, connectedServices, onToggleService, apiKeys, webhookSecrets }) {
  return (
    <div className="space-y-5">
      <CollapsibleSection icon="🔌" title="Connected Services" subtitle="Third-party platforms integrated with CreConnect.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedServices.map((service) => {
            const connected = service.status === 'connected';
            return (
              <div key={service.id} className="rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{service.icon}</span>
                    <p className="text-sm font-medium text-fg truncate">{service.name}</p>
                  </div>
                  <Badge variant={connected ? 'success' : 'neutral'} label={connected ? 'Connected' : 'Not Connected'} dot />
                </div>
                <p className="text-xs text-fg-muted mb-3">{service.category}{connected && service.lastSync ? ` · Synced ${timeAgo(service.lastSync)} ago` : ''}</p>
                <Button size="sm" variant={connected ? 'secondary' : 'primary'} className="w-full" onClick={() => onToggleService(service.id)}>
                  {connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <GenericSettingsSection
        sectionId="integrations"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
      />

      <CollapsibleSection icon="🔑" title="API Keys" subtitle="Keys used to authenticate external API requests.">
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{key.name}</p>
                <p className="text-xs text-fg-muted mt-0.5 font-mono">{key.maskedKey}</p>
                <p className="text-xs text-fg-muted mt-0.5">Scopes: {key.scopes.join(', ')} · Last used {timeAgo(key.lastUsed)} ago</p>
              </div>
              <Button size="sm" variant="ghost">Revoke</Button>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="🔗" title="Webhook Center" subtitle="Webhook endpoints & signing secrets.">
        <div className="space-y-2">
          {webhookSecrets.map((wh) => (
            <div key={wh.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg truncate">{wh.endpoint}</p>
                <p className="text-xs text-fg-muted mt-0.5 font-mono">{wh.maskedSecret}</p>
              </div>
              <Badge variant={wh.status === 'active' ? 'success' : 'neutral'} label={wh.status === 'active' ? 'Active' : 'Disabled'} dot />
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

IntegrationsSection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
  connectedServices: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggleService: PropTypes.func.isRequired,
  apiKeys: PropTypes.arrayOf(PropTypes.object).isRequired,
  webhookSecrets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
