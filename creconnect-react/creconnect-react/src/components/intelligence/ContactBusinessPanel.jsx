import { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import StatCard from '@/components/common/StatCard';
import SocialRow, { SOCIAL_PLATFORM_FIELDS } from '@/components/common/SocialRow';

/* ─── Email change workflow ─────────────────────────────────────────── */

function EmailField({ email }) {
  const [mode,     setMode]     = useState('verified'); // verified | request | pending
  const [newEmail, setNewEmail] = useState('');
  const [inputErr, setInputErr] = useState('');

  const handleRequest = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setInputErr('Enter a valid email address.');
      return;
    }
    setMode('pending');
  };

  if (mode === 'verified') {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-fg">Email</label>
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <span className="flex-1 text-fg text-sm truncate">{email ?? '—'}</span>
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(22,179,100,0.15)', color: '#16b364' }}
          >
            ✓ Verified
          </span>
          <button
            onClick={() => setMode('request')}
            className="text-[11px] text-fg-muted hover:text-brand-400 underline flex-shrink-0 transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'request') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg">Change Email</label>
        <div
          className="p-3 rounded-xl space-y-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs text-fg-muted">
            Current: <span className="text-fg font-medium">{email}</span>
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setInputErr(''); }}
              placeholder="New email address"
              className="input-base flex-1 text-sm"
            />
            <button
              onClick={handleRequest}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'var(--brand-500)' }}
            >
              Send Verification
            </button>
            <button
              onClick={() => { setMode('verified'); setNewEmail(''); setInputErr(''); }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-fg-muted flex-shrink-0"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
          {inputErr && <p className="text-xs text-danger">{inputErr}</p>}
        </div>
      </div>
    );
  }

  /* mode === 'pending' */
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-fg">Email</label>
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <span className="flex-1 text-fg text-sm truncate">{email}</span>
        <span
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(245,166,35,0.15)', color: '#f59e0b' }}
        >
          ⏳ Pending Verification
        </span>
        <button
          onClick={() => { setMode('verified'); setNewEmail(''); }}
          className="text-[11px] text-fg-muted hover:text-danger underline flex-shrink-0"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-fg-muted px-1">
        A verification link was sent to <span className="text-fg font-medium">{newEmail}</span>.
        Check your inbox and follow the link to confirm the change.
      </p>
    </div>
  );
}

EmailField.propTypes = { email: PropTypes.string };

/* ─── Main component ─────────────────────────────────────────────────── */

const NOOP = () => {};

export default function ContactBusinessPanel({ values, onChange, email, businessMetrics, readOnly, platforms, onConnect, onDisconnect }) {
  const [disconnecting, setDisconnecting] = useState(null);
  const set = (field) => (e) => onChange(field, e.target.value);

  const findConnected = (platformName) =>
    (platforms ?? []).find((p) => p.name === platformName);

  const handleDisconnect = async (platformId) => {
    setDisconnecting(platformId);
    try { await onDisconnect(platformId); } finally { setDisconnecting(null); }
  };

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Contact</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <EmailField email={email} />
          <Input label="Phone"          name="phone"         value={values.phone}         onChange={set('phone')}         placeholder="+92 3xx xxxxxxx"              disabled={readOnly} />
          <Input label="Website"        name="websiteUrl"    value={values.websiteUrl}    onChange={set('websiteUrl')}    placeholder="https://yoursite.com"         disabled={readOnly} />
          <Input label="Portfolio Link" name="portfolioLink" value={values.portfolioLink} onChange={set('portfolioLink')} placeholder="https://portfolio.example.com" disabled={readOnly} />
          <Input label="Media Kit Link" name="mediaKitLink"  value={values.mediaKitLink}  onChange={set('mediaKitLink')}  placeholder="https://mediakit.example.com"  disabled={readOnly} />
        </div>
      </div>

      <div>
        <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Social Links</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOCIAL_PLATFORM_FIELDS.map(({ field, name, label, placeholder }) => {
            const connected = findConnected(name);
            return (
              <SocialRow
                key={field}
                field={field}
                name={name}
                label={label}
                placeholder={placeholder}
                value={values[field] ?? ''}
                onChange={set(field)}
                readOnly={readOnly}
                isConnected={!!connected}
                isDisconnecting={disconnecting === connected?.id}
                onConnect={onConnect ?? NOOP}
                onDisconnect={() => handleDisconnect(connected?.id)}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Business Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={`${businessMetrics.responseRate}%`}   label="Response Rate"          icon="⚡" />
          <StatCard value={businessMetrics.avgResponseTime}       label="Avg. Response Time"     icon="⏱" />
          <StatCard value={`${businessMetrics.acceptanceRate}%`} label="Collab Acceptance Rate"  icon="🤝" />
          <StatCard value={`${businessMetrics.completionRate}%`} label="Completion Rate"         icon="✅" />
        </div>
      </div>
    </div>
  );
}

ContactBusinessPanel.propTypes = {
  values:          PropTypes.object.isRequired,
  onChange:        PropTypes.func.isRequired,
  email:           PropTypes.string,
  readOnly:        PropTypes.bool,
  businessMetrics: PropTypes.shape({
    responseRate:    PropTypes.number,
    avgResponseTime: PropTypes.string,
    acceptanceRate:  PropTypes.number,
    completionRate:  PropTypes.number,
  }).isRequired,
  platforms:    PropTypes.array,
  onConnect:    PropTypes.func,
  onDisconnect: PropTypes.func,
};
