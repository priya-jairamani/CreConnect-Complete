import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Skeleton from '@/components/common/Skeleton';
import { useToast } from '@/hooks/useToast';
import {
  verificationService,
  VERIFICATION_TYPES_CREATOR,
  VERIFICATION_TYPES_BRAND,
} from '@/services/verificationService';

/* ── Status meta ────────────────────────────────────────────────── */
const STATUS_META = {
  not_started: { label: 'Not Started',   variant: 'neutral', icon: '○'  },
  pending:     { label: 'Pending',       variant: 'warning', icon: '⏳' },
  under_review:{ label: 'Under Review',  variant: 'warning', icon: '🔍' },
  verified:    { label: 'Verified',      variant: 'success', icon: '✓'  },
  rejected:    { label: 'Rejected',      variant: 'danger',  icon: '✕'  },
  expired:     { label: 'Expired',       variant: 'danger',  icon: '⌛' },
};

/* ── Secure document upload card ────────────────────────────────── */
function DocUploadCard({ icon, label, hint, file, onFile, isUploading, progress }) {
  const inputRef = useRef(null);
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-white/5"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <span className="text-2xl flex-shrink-0">{file ? '✅' : icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-fg text-sm font-medium">{label}</p>
        <p className="text-fg-muted text-xs truncate">{file ? file.name : hint}</p>
        {isUploading && (
          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)' }} />
          </div>
        )}
      </div>
      {!isUploading && (
        <span className="text-xs text-fg-muted flex-shrink-0">{file ? 'Replace' : 'Upload'}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        disabled={isUploading}
      />
    </div>
  );
}
DocUploadCard.propTypes = {
  icon:        PropTypes.string.isRequired,
  label:       PropTypes.string.isRequired,
  hint:        PropTypes.string.isRequired,
  file:        PropTypes.object,
  onFile:      PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
  progress:    PropTypes.number,
};

/* ── NIC Verification Modal ─────────────────────────────────────── */
function NICModal({ onClose, onSubmit, userType }) {
  const [step,        setStep]        = useState(1); // 1=form 2=uploading 3=success 4=error

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const [fullName,    setFullName]    = useState('');
  const [nicNumber,   setNicNumber]   = useState('');
  const [frontFile,   setFrontFile]   = useState(null);
  const [backFile,    setBackFile]    = useState(null);
  const [frontProg,   setFrontProg]   = useState(0);
  const [backProg,    setBackProg]    = useState(0);
  const [error,       setError]       = useState('');

  const canSubmit = fullName.trim() && nicNumber.trim().length === 15 && frontFile && backFile;

  const handleCNICChange = (e) => {
    // Strip everything except digits, then insert dashes at positions 5 and 13
    const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
    let formatted = digits;
    if (digits.length > 5)  formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    if (digits.length > 12) formatted = `${formatted.slice(0, 13)}-${formatted.slice(13)}`;
    setNicNumber(formatted);
  };

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep(2);
    setError('');
    try {
      await verificationService.submitNIC(
        { fullName: fullName.trim(), nicNumber: nicNumber.trim(), frontFile, backFile },
        (side, p) => { if (side === 'front') setFrontProg(p); else setBackProg(p); },
      );
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Submission failed. Please try again.');
      setStep(4);
    }
  }

  const STEPS = [
    { n: 1, label: 'Upload NIC'         },
    { n: 2, label: 'Processing'         },
    { n: 3, label: 'Identity Validation' },
    { n: 4, label: 'Under Review'       },
    { n: 5, label: 'Verified Badge'     },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={step < 2 ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl animate-fade-up overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                {userType === 'brand' ? 'Owner NIC Verification' : 'National ID Verification'}
              </h2>
              <p className="text-fg-muted text-xs mt-0.5">
                Documents are stored securely and never shared publicly. Only you and admins can access them.
              </p>
            </div>
            {step < 2 && (
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg text-xl flex-shrink-0">×</button>
            )}
          </div>

          {/* Workflow steps */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={
                      s.n === 1 && step === 1 ? { background: 'var(--brand-500)', color: '#fff' }
                      : s.n < 3 && step >= 2   ? { background: '#16b364', color: '#fff' }
                      : s.n === 3 && step === 3 ? { background: '#16b364', color: '#fff' }
                      : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                    }
                  >
                    {s.n < 3 && step >= 2 ? '✓' : s.n}
                  </div>
                  <p className="text-[9px] text-fg-muted text-center whitespace-nowrap">{s.label}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-6 flex-shrink-0 mb-3" style={{ background: s.n < 3 && step >= 2 ? '#16b364' : 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Step 1 — Form */}
          {step === 1 && (
            <>
              <Input
                label="Full Name (as on CNIC)"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Ali Khan"
                required
              />
              <Input
                label="CNIC Number"
                name="nicNumber"
                value={nicNumber}
                onChange={handleCNICChange}
                placeholder="42201-1234567-1"
                maxLength={15}
                required
              />
              <p className="text-xs text-fg-muted -mt-2">Format: XXXXX-XXXXXXX-X (dashes added automatically)</p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-fg">Upload CNIC</p>
                <DocUploadCard icon="🪪" label="Front Side" hint="Photo of the front of your CNIC" file={frontFile} onFile={setFrontFile} progress={frontProg} />
                <DocUploadCard icon="🪪" label="Back Side"  hint="Photo of the back of your CNIC"  file={backFile}  onFile={setBackFile}  progress={backProg} />
              </div>

              <div className="rounded-xl p-3 text-xs text-fg-muted" style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}>
                🔒 Your documents are encrypted and stored in a secure private vault. They are never publicly accessible and will only be reviewed by our moderation team.
              </div>
            </>
          )}

          {/* Step 2 — Uploading */}
          {step === 2 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-semibold text-fg">Securely uploading documents…</p>
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-fg-muted">CNIC Front</span>
                  <span className="text-fg font-semibold">{frontProg}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${frontProg}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)' }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-fg-muted">CNIC Back</span>
                  <span className="text-fg font-semibold">{backProg}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${backProg}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)' }} />
                </div>
              </div>
              <p className="text-xs text-fg-muted">Do not close this window.</p>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div className="text-center py-8 space-y-3">
              <span className="text-5xl">✅</span>
              <p className="font-semibold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>Submitted for Review</p>
              <p className="text-fg-muted text-sm">
                Your NIC has been submitted. Our team will review it within 1–2 business days.
                You'll receive a notification once verified.
              </p>
              <Button variant="primary" size="sm" onClick={() => { onSubmit?.(); onClose(); }}>Done</Button>
            </div>
          )}

          {/* Step 4 — Error */}
          {step === 4 && (
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl">❌</span>
              <p className="font-semibold text-fg">Submission Failed</p>
              <p className="text-danger text-sm">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => { setStep(1); setError(''); setFrontProg(0); setBackProg(0); }}>Try Again</Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="flex gap-3 justify-end p-5 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!canSubmit}>
              Submit for Verification
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
NICModal.propTypes = {
  onClose:  PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  userType: PropTypes.oneOf(['creator', 'brand']).isRequired,
};

/* ── Email/Phone OTP modal ──────────────────────────────────────── */
function OTPModal({ type, onClose, onSuccess }) {
  const toast = useToast();
  const [step,    setStep]    = useState('input'); // input | otp | success
  const [phone,   setPhone]   = useState('');
  const [code,    setCode]    = useState('');
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState('');

  async function sendCode() {
    setSending(true); setError('');
    try {
      if (type === 'email') await verificationService.sendEmailCode();
      else                  await verificationService.sendPhoneCode(phone);
      setStep('otp');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send code.');
    }
    setSending(false);
  }

  async function verifyCode() {
    setSending(true); setError('');
    try {
      if (type === 'email') await verificationService.verifyEmailCode(code);
      else                  await verificationService.verifyPhoneCode(code);
      setStep('success');
      setTimeout(() => { onSuccess?.(); onClose(); }, 1400);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid code. Please try again.');
    }
    setSending(false);
  }

  const icon = type === 'email' ? '✉️' : '📱';
  const label = type === 'email' ? 'Email' : 'Phone';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 animate-fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{icon} {label} Verification</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg text-xl">×</button>
        </div>

        {step === 'input' && (
          <div className="space-y-4">
            {type === 'email' ? (
              <p className="text-fg-muted text-sm">We'll send a verification code to your registered email address.</p>
            ) : (
              <Input label="Phone Number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3xx xxxxxxx" />
            )}
            {error && <p className="text-danger text-xs">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={sendCode} isLoading={sending} disabled={type === 'phone' && !phone.trim()}>
                Send Code
              </Button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-fg-muted text-sm">Enter the 6-digit code sent to your {label.toLowerCase()}.</p>
            <Input label="Verification Code" name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            {error && <p className="text-danger text-xs">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setStep('input')}>Back</Button>
              <Button variant="primary" size="sm" onClick={verifyCode} isLoading={sending} disabled={code.length < 4}>Verify</Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4 space-y-2">
            <span className="text-4xl">✅</span>
            <p className="font-semibold text-fg">{label} verified!</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
OTPModal.propTypes = {
  type:      PropTypes.oneOf(['email', 'phone']).isRequired,
  onClose:   PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

/* ── Single verification type card ──────────────────────────────── */
function VerificationCard({ vtype, status, onAction }) {
  const meta = STATUS_META[status] ?? STATUS_META.not_started;
  const isVerified = status === 'verified';
  const isPending  = status === 'pending' || status === 'under_review';

  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-4 transition-all"
      style={{
        border: `1px solid ${isVerified ? 'rgba(22,179,100,0.25)' : 'var(--border)'}`,
        background: isVerified ? 'rgba(22,179,100,0.04)' : 'var(--surface-2)',
      }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: isVerified ? 'rgba(22,179,100,0.12)' : isPending ? 'rgba(245,166,35,0.1)' : 'var(--surface)',
          border:     `1px solid ${isVerified ? 'rgba(22,179,100,0.2)' : 'var(--border)'}`,
        }}
      >
        {vtype.icon}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-fg text-sm">{vtype.label}</p>
          <Badge variant={meta.variant} label={`${meta.icon} ${meta.label}`} />
        </div>
        <p className="text-fg-muted text-xs mt-0.5 leading-relaxed">{vtype.description}</p>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <span className="text-xs text-fg-muted">Benefit:</span>
          <span className="text-xs text-fg font-medium">{vtype.benefit}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,179,100,0.12)', color: '#16b364' }}>
            {vtype.trustImpact}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0">
        {isVerified ? (
          <span className="text-success text-sm font-bold">✓</span>
        ) : isPending ? (
          <span className="text-warning text-xs font-medium">Pending</span>
        ) : (
          <Button variant="secondary" size="xs" onClick={() => onAction(vtype.id)}>
            {status === 'rejected' ? 'Re-submit' : 'Verify'}
          </Button>
        )}
      </div>
    </div>
  );
}
VerificationCard.propTypes = {
  vtype:    PropTypes.object.isRequired,
  status:   PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
};

/* ── Progress ring ──────────────────────────────────────────────── */
function ProgressRing({ verified, total, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? verified / total : 0;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#16b364" strokeWidth={8}
        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--fg)" fontFamily="Sora, sans-serif">
        {verified}/{total}
      </text>
    </svg>
  );
}
ProgressRing.propTypes = { verified: PropTypes.number.isRequired, total: PropTypes.number.isRequired, size: PropTypes.number };

/* ── Main VerificationCenter ─────────────────────────────────────── */

export default function VerificationCenter({ userType = 'creator' }) {
  const toast  = useToast();
  const types  = userType === 'brand' ? VERIFICATION_TYPES_BRAND : VERIFICATION_TYPES_CREATOR;

  const [statuses, setStatuses] = useState({});     // { email: 'verified', nic: 'pending', ... }
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);   // null | 'nic' | 'email' | 'phone'

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const { verifications } = await verificationService.getStatus();
    const map = {};
    verifications.forEach(({ type, status }) => { map[type] = status; });
    setStatuses(map);
    setLoading(false);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  function handleAction(id) {
    if (id === 'nic')   { setModal('nic');   return; }
    if (id === 'email') { setModal('email'); return; }
    if (id === 'phone') { setModal('phone'); return; }
    // social / business / domain — mark as pending (submit via verificationService)
    verificationService.submitSocial({ type: id }).catch(() => {});
    setStatuses((p) => ({ ...p, [id]: 'pending' }));
    toast.success('Verification request submitted. Our team will review it shortly.');
  }

  function handleVerifySuccess(id) {
    setStatuses((p) => ({ ...p, [id]: 'verified' }));
    toast.success('Verification successful!');
  }

  const verifiedCount = types.filter((t) => statuses[t.id] === 'verified').length;
  const pendingCount  = types.filter((t) => ['pending', 'under_review'].includes(statuses[t.id])).length;
  const totalTrust    = types.reduce((sum, t) => {
    const pts = parseInt(t.trustImpact.replace(/[^0-9]/g, ''), 10) || 0;
    return sum + (statuses[t.id] === 'verified' ? pts : 0);
  }, 0);

  return (
    <div className="space-y-6">

      {/* Overview row */}
      {!loading && (
        <div className="flex items-center gap-6 p-5 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ProgressRing verified={verifiedCount} total={types.length} />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              {verifiedCount === types.length ? '🎉 Fully Verified!' : `${verifiedCount} of ${types.length} verifications complete`}
            </p>
            <p className="text-fg-muted text-sm">
              {verifiedCount === types.length
                ? 'Your profile shows the Verified badge on search results and collaboration pages.'
                : `Complete ${types.length - verifiedCount} more verification${types.length - verifiedCount > 1 ? 's' : ''} to get the full verified badge.`
              }
            </p>
            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <span className="text-xs text-fg-muted">Trust Score Gained: <span className="text-success font-bold">+{totalTrust}</span></span>
              {pendingCount > 0 && <span className="text-xs text-warning font-medium">{pendingCount} under review</span>}
            </div>
          </div>
        </div>
      )}

      {/* Benefits card */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}>
        <p className="text-sm font-semibold text-brand-400">✦ Verification Benefits</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { icon: '📈', label: 'Higher Trust Score' },
            { icon: '🔍', label: 'Priority Search Ranking' },
            { icon: '✓',  label: 'Verified Badge on Profile' },
            { icon: '🤝', label: 'More Collaboration Opportunities' },
            { icon: '💰', label: 'Unlock Higher Earning Limits' },
            { icon: '👁', label: 'Increased Brand Visibility' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-xs text-fg">
              <span className="text-brand-400 flex-shrink-0">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Verification cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: types.length }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {types.map((vtype) => (
            <VerificationCard
              key={vtype.id}
              vtype={vtype}
              status={statuses[vtype.id] ?? 'not_started'}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'nic' && (
        <NICModal
          userType={userType}
          onClose={() => setModal(null)}
          onSubmit={() => { setStatuses((p) => ({ ...p, nic: 'pending' })); toast.success('NIC submitted for review.'); }}
        />
      )}
      {(modal === 'email' || modal === 'phone') && (
        <OTPModal
          type={modal}
          onClose={() => setModal(null)}
          onSuccess={() => handleVerifySuccess(modal)}
        />
      )}
    </div>
  );
}

VerificationCenter.propTypes = {
  userType: PropTypes.oneOf(['creator', 'brand']),
};
