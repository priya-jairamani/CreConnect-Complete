import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

function maskKey(key) {
  return `${key.slice(0, 11)}${'•'.repeat(16)}${key.slice(-4)}`;
}

export default function IntegrationsSection({ integrations, onToggle, apiKeys, webhooks, onAddWebhook }) {
  const [revealed, setRevealed] = useState({});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Connected Platforms</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {integrations.map((i) => (
            <div key={i.key} className="card rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
              <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">{i.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-fg font-medium text-sm">{i.name}</p>
                <p className="text-fg-muted text-xs mt-0.5 truncate">
                  {i.connected ? `Synced ${i.lastSynced}` : i.description}
                </p>
              </div>
              {i.connected ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="success" label="Connected" dot />
                  <Button variant="ghost" size="xs" onClick={() => onToggle(i.key)}>Disconnect</Button>
                </div>
              ) : (
                <Button variant="secondary" size="xs" onClick={() => onToggle(i.key)}>Connect</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">API Keys</h3>
        <div className="space-y-2">
          {apiKeys.map((k) => (
            <div key={k.id} className="card rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
              <div className="min-w-0">
                <p className="text-fg font-medium text-sm">{k.label}</p>
                <p className="text-fg-muted text-xs font-mono mt-0.5">{revealed[k.id] ? k.value : maskKey(k.value)}</p>
                <p className="text-fg-muted text-[11px] mt-0.5">Created {k.createdLabel}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="xs" onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}>
                  {revealed[k.id] ? 'Hide' : 'Reveal'}
                </Button>
                <Button variant="ghost" size="xs" onClick={() => navigator.clipboard?.writeText(k.value)}>Copy</Button>
                <Button variant="ghost" size="xs">Regenerate</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Webhook Management</h3>
        <div className="space-y-2">
          {webhooks.length === 0 && <p className="text-fg-muted text-sm">No webhooks configured yet.</p>}
          {webhooks.map((w) => (
            <div key={w.id} className="card rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
              <div className="min-w-0">
                <p className="text-fg font-medium text-sm font-mono truncate">{w.url}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {w.events.map((e) => <Badge key={e} variant="neutral" label={e} />)}
                </div>
              </div>
              <Badge variant="success" label="Active" dot />
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={onAddWebhook}>+ Add Webhook Endpoint</Button>
        </div>
      </div>
    </div>
  );
}

IntegrationsSection.propTypes = {
  integrations: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
  apiKeys: PropTypes.array.isRequired,
  webhooks: PropTypes.array.isRequired,
  onAddWebhook: PropTypes.func.isRequired,
};
