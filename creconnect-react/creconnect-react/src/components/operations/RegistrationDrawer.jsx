import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';

const SUB_TABS = [
  { id: 'overview',     label: 'Overview',     icon: '📋' },
  { id: 'verification', label: 'Verification',  icon: '✅' },
  { id: 'device',       label: 'Device & IP',   icon: '🌐' },
  { id: 'risk',         label: 'Risk Analysis', icon: '🛡️' },
  { id: 'notes',        label: 'Admin Notes',   icon: '📝' },
];

const STATUS_META = {
  pending:          { label: 'Pending',           variant: 'neutral'  },
  email_verified:   { label: 'Email Verified',    variant: 'brand'    },
  profile_complete: { label: 'Profile Complete',  variant: 'brand'    },
  under_review:     { label: 'Under Review',      variant: 'warning'  },
  approved:         { label: 'Approved',          variant: 'success'  },
  rejected:         { label: 'Rejected',          variant: 'danger'   },
  suspended:        { label: 'Suspended',         variant: 'danger'   },
};

const RISK_META = {
  low:      { label: 'Low Risk',      variant: 'success', color: '#16b364' },
  medium:   { label: 'Medium Risk',   variant: 'warning', color: '#f59e0b' },
  high:     { label: 'High Risk',     variant: 'danger',  color: '#f0445f' },
  critical: { label: 'Critical',      variant: 'danger',  color: '#f0445f' },
};

const VERIFICATION_STEPS = [
  { key: 'email',   label: 'Email',           icon: '✉️' },
  { key: 'phone',   label: 'Phone',           icon: '📱' },
  { key: 'profile', label: 'Profile',         icon: '👤' },
  { key: 'kyc',     label: 'KYC Docs',        icon: '📄' },
  { key: 'admin',   label: 'Admin Approval',  icon: '✅' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-fg-muted text-xs font-medium flex-shrink-0">{label}</span>
      <span className="text-fg text-xs text-right truncate max-w-[60%] font-medium">{value ?? '—'}</span>
    </div>
  );
}
InfoRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };

export default function RegistrationDrawer({ registration: reg, onClose, onAction }) {
  const [subTab,   setSubTab]   = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [notes,    setNotes]    = useState([]);

  if (!reg) return <Drawer isOpen={false} onClose={onClose} />;

  const status  = STATUS_META[reg.status]    ?? STATUS_META.pending;
  const risk    = RISK_META[reg.riskLevel]   ?? RISK_META.low;
  const initials = (reg.name || reg.email || '?').slice(0, 2).toUpperCase();

  const canApprove = !['approved', 'rejected', 'suspended'].includes(reg.status);

  function handleNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes((prev) => [
      { id: Date.now(), text: noteText.trim(), date: new Date().toISOString(), author: 'Admin' },
      ...prev,
    ]);
    setNoteText('');
  }

  return (
    <Drawer
      isOpen={!!reg}
      onClose={onClose}
      size="2xl"
      icon={reg.type === 'creator' ? '◎' : '🏢'}
      title={reg.name || reg.email}
      subtitle={`${reg.id} · ${reg.type === 'creator' ? 'Creator' : 'Brand'} Registration`}
      headerExtra={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={status.variant} label={status.label} dot />
          <Badge variant={risk.variant} label={risk.label} />
          <Badge variant={reg.type === 'creator' ? 'brand' : 'accent'} label={reg.type === 'creator' ? 'Creator' : 'Brand'} />
        </div>
      }
      footer={
        canApprove && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Button variant="ghost"     size="sm" onClick={() => onAction?.('request_info', reg)}>Request Info</Button>
              <Button variant="secondary" size="sm" onClick={() => onAction?.('escalate',     reg)}>Escalate</Button>
              <Button variant="danger"    size="sm" onClick={() => onAction?.('reject',        reg)}>Reject</Button>
            </div>
            <Button variant="success" size="sm" onClick={() => onAction?.('approve', reg)}>
              ✓ Approve Registration
            </Button>
          </div>
        )
      }
    >
      {/* Sub-tab bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-1 px-5 py-3 overflow-x-auto border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              subTab === t.id
                ? 'bg-brand-gradient text-white'
                : 'text-fg-muted hover:text-fg hover:bg-white/5'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">

        {/* ── OVERVIEW ── */}
        {subTab === 'overview' && (
          <div className="space-y-5">
            {/* User card */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <Avatar initials={initials} color={reg.avatarColor ?? '#6d5cff'} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-fg">{reg.name || '—'}</p>
                <p className="text-fg-muted text-sm">{reg.email}</p>
                {reg.phone && <p className="text-fg-muted text-xs mt-0.5">{reg.phone}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-fg-muted">Registered</p>
                <p className="text-fg text-sm font-semibold">{formatDate(reg.registeredAt)}</p>
              </div>
            </div>

            {/* Core info */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-4 py-2 text-xs font-semibold text-fg-muted uppercase tracking-wider" style={{ background: 'var(--surface-2)' }}>
                Registration Details
              </div>
              <div className="px-4 divide-y" style={{ borderColor: 'var(--border)' }}>
                <InfoRow label="Registration ID"  value={reg.id}           />
                <InfoRow label="Account Type"     value={reg.type === 'creator' ? 'Creator Account' : 'Brand Account'} />
                <InfoRow label="Acquisition Channel" value={reg.channel}  />
                <InfoRow label="Referral Code"    value={reg.referralCode ?? 'None'} />
                <InfoRow label="Location"         value={`${reg.city ?? '—'}, ${reg.country ?? '—'}`} />
                <InfoRow label="Language"         value={reg.language ?? '—'} />
                {reg.type === 'creator' && <InfoRow label="Niche / Category"  value={reg.niche  ?? '—'} />}
                {reg.type === 'brand'   && <InfoRow label="Industry"          value={reg.industry ?? '—'} />}
                {reg.type === 'brand'   && <InfoRow label="Company Name"      value={reg.companyName ?? '—'} />}
              </div>
            </div>

            {/* Risk flags */}
            {reg.flags?.length > 0 && (
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(240,68,95,0.06)', border: '1px solid rgba(240,68,95,0.2)' }}>
                <p className="text-xs font-semibold text-danger uppercase tracking-wider">Risk Flags</p>
                {reg.flags.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-danger">
                    <span className="text-base">⚠</span> {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VERIFICATION ── */}
        {subTab === 'verification' && (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Verification Pipeline</p>
              {VERIFICATION_STEPS.map((step, i) => {
                const done    = reg.verificationSteps?.[step.key] === 'done';
                const pending = reg.verificationSteps?.[step.key] === 'pending';
                const failed  = reg.verificationSteps?.[step.key] === 'failed';
                return (
                  <div
                    key={step.key}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={
                        done    ? { background: '#16b364', color: '#fff' }
                        : failed ? { background: '#f0445f', color: '#fff' }
                        : pending ? { background: '#f59e0b', color: '#fff' }
                        : { background: 'var(--surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      {done ? '✓' : failed ? '✕' : pending ? '⏳' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-fg text-sm font-medium">{step.icon} {step.label}</p>
                      <p className="text-xs text-fg-muted mt-0.5">
                        {done ? 'Completed' : failed ? 'Failed — action required' : pending ? 'Awaiting verification' : 'Not started'}
                      </p>
                    </div>
                    <Badge
                      variant={done ? 'success' : failed ? 'danger' : pending ? 'warning' : 'neutral'}
                      label={done ? 'Done' : failed ? 'Failed' : pending ? 'Pending' : 'N/A'}
                    />
                  </div>
                );
              })}
            </div>

            {/* Docs submitted */}
            {reg.docsSubmitted?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Submitted Documents</p>
                <div className="space-y-2">
                  {reg.docsSubmitted.map((doc) => (
                    <div key={doc} className="flex items-center gap-2 p-2.5 rounded-xl text-sm" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <span>📄</span>
                      <span className="text-fg flex-1">{doc}</span>
                      <Badge variant="success" label="Uploaded" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DEVICE & IP ── */}
        {subTab === 'device' && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-4 py-2 text-xs font-semibold text-fg-muted uppercase tracking-wider" style={{ background: 'var(--surface-2)' }}>
                Session Information
              </div>
              <div className="px-4 divide-y" style={{ borderColor: 'var(--border)' }}>
                <InfoRow label="IP Address"       value={reg.ipAddress}   />
                <InfoRow label="Location (IP)"    value={`${reg.ipCity ?? '—'}, ${reg.ipCountry ?? '—'}`} />
                <InfoRow label="ISP / Organization" value={reg.isp ?? '—'} />
                <InfoRow label="VPN / Proxy Detected" value={reg.vpnDetected ? '⚠ Yes — flagged' : '✓ No'} />
                <InfoRow label="Device Type"      value={reg.deviceType ?? '—'} />
                <InfoRow label="OS"               value={reg.os          ?? '—'} />
                <InfoRow label="Browser"          value={reg.browser     ?? '—'} />
                <InfoRow label="Screen Resolution" value={reg.resolution ?? '—'} />
                <InfoRow label="Fingerprint ID"   value={reg.fingerprintId ?? '—'} />
                <InfoRow label="Accounts from IP" value={reg.accountsFromIp != null ? String(reg.accountsFromIp) : '—'} />
              </div>
            </div>

            {reg.accountsFromIp > 1 && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)' }}>
                <span className="text-warning font-semibold">⚠ Velocity Alert:</span>
                <span className="text-fg-muted ml-1.5">
                  {reg.accountsFromIp} accounts registered from this IP in the last 24 hours.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── RISK ANALYSIS ── */}
        {subTab === 'risk' && (
          <div className="space-y-5">
            {/* Risk score ring */}
            <div className="flex items-center gap-5 p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{
                  background: `conic-gradient(${risk.color} ${(reg.riskScore ?? 0) * 3.6}deg, var(--surface) 0deg)`,
                  color: risk.color,
                }}
              >
                <span className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--surface-2)', color: risk.color }}>
                  {reg.riskScore ?? 0}
                </span>
              </div>
              <div>
                <p className="text-fg font-semibold">{risk.label}</p>
                <p className="text-fg-muted text-sm mt-0.5">Overall risk score: {reg.riskScore ?? 0}/100</p>
                <p className="text-xs text-fg-muted mt-1">Updated: {formatDate(reg.registeredAt)}</p>
              </div>
            </div>

            {/* Risk factors */}
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Risk Factors</p>
              <div className="space-y-2">
                {(reg.riskFactors ?? []).map((f) => (
                  <div key={f.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-fg text-sm font-medium">{f.label}</p>
                      <p className="text-fg-muted text-xs mt-0.5">{f.detail}</p>
                    </div>
                    <Badge
                      variant={f.impact === 'high' ? 'danger' : f.impact === 'medium' ? 'warning' : 'success'}
                      label={f.impact === 'high' ? '+High' : f.impact === 'medium' ? '+Medium' : '+Low'}
                    />
                  </div>
                ))}
                {(!reg.riskFactors || reg.riskFactors.length === 0) && (
                  <p className="text-fg-muted text-sm text-center py-4">No risk factors identified.</p>
                )}
              </div>
            </div>

            {/* AI recommendation */}
            {reg.aiRecommendation && (
              <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.2)' }}>
                <p className="text-xs font-semibold text-brand-400">🤖 AI Recommendation</p>
                <p className="text-fg text-sm">{reg.aiRecommendation}</p>
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN NOTES ── */}
        {subTab === 'notes' && (
          <div className="space-y-4">
            <form onSubmit={handleNote} className="space-y-2">
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Add Note</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add an internal admin note about this registration…"
                rows={3}
                className="input-base w-full text-sm resize-none rounded-xl"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'var(--brand-500)' }}
                >
                  + Add Note
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {[...notes, ...(reg.adminNotes ?? [])].map((n, i) => (
                <div key={n.id ?? i} className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-fg text-xs font-semibold">{n.author}</p>
                    <p className="text-fg-muted text-[10px]">{formatDate(n.date)}</p>
                  </div>
                  <p className="text-fg-muted text-sm leading-relaxed">{n.text}</p>
                </div>
              ))}
              {notes.length === 0 && (!reg.adminNotes || reg.adminNotes.length === 0) && (
                <p className="text-fg-muted text-sm text-center py-4">No notes yet.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </Drawer>
  );
}

RegistrationDrawer.propTypes = {
  registration: PropTypes.object,
  onClose:      PropTypes.func.isRequired,
  onAction:     PropTypes.func,
};
