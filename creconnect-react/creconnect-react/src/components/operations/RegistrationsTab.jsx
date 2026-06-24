import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import StatCard from '@/components/common/StatCard';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import OpsChart from './OpsChart';

/* ─── Deterministic mock data ────────────────────────────────────── */

function seededRandom(seed) {
  let s = (seed % 2147483647 + 2147483647) % 2147483647 || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }
function daysAgo(n)  { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function hoursAgo(n) { const d = new Date(); d.setHours(d.getHours() - n); return d.toISOString(); }
function minsAgo(n)  { const d = new Date(); d.setMinutes(d.getMinutes() - n); return d.toISOString(); }

const CREATOR_NAMES  = ['Laiba Khan', 'Ali Hassan', 'Sara Ahmed', 'Hamza Tariq', 'Fatima Malik', 'Bilal Sheikh', 'Ayesha Raza', 'Usman Qureshi', 'Zainab Ali', 'Faisal Mahmood', 'Nadia Hussain', 'Omar Farooq', 'Sana Mirza', 'Imran Siddiqui', 'Mariam Baig'];
const BRAND_NAMES    = ['TechVault PK', 'StyleHouse', 'GlowBeauty', 'NutriLife', 'UrbanEats Co.', 'AdventureGear', 'DigitalEdge', 'PakFashion', 'FreshBakes', 'AutoZone PK'];
const CHANNELS       = ['Direct Signup', 'Google OAuth', 'Facebook OAuth', 'Referral Link', 'Invitation', 'Email Campaign'];
const NICHES         = ['Fashion', 'Beauty', 'Tech', 'Food', 'Fitness', 'Lifestyle', 'Travel', 'Gaming'];
const INDUSTRIES     = ['Fashion & Apparel', 'Technology', 'Food & Beverage', 'Health & Wellness', 'Beauty & Cosmetics', 'Sports & Fitness'];
const COUNTRIES      = ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States'];
const CITIES         = ['Lahore', 'Karachi', 'Islamabad', 'Dubai', 'London'];
const DEVICES        = ['Mobile', 'Desktop', 'Tablet'];
const OS_LIST        = ['Android 13', 'iOS 17', 'Windows 11', 'macOS Sonoma', 'Ubuntu 22'];
const BROWSERS       = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Samsung Internet'];
const STATUSES       = ['pending', 'email_verified', 'profile_complete', 'under_review', 'approved', 'rejected'];
const RISK_LEVELS    = ['low', 'low', 'low', 'medium', 'medium', 'high'];
const COLORS         = ['#6d5cff', '#22c1ff', '#16b364', '#f59e0b', '#f0445f', '#a78bfa', '#fb923c', '#38bdf8'];

const RISK_FACTORS_POOL = [
  { label: 'New IP address',           detail: 'First time seen on platform',         impact: 'low'    },
  { label: 'No prior engagement',       detail: 'No discovery traffic before signup',  impact: 'low'    },
  { label: 'Disposable email domain',   detail: 'mailinator.com detected',             impact: 'high'   },
  { label: 'VPN / proxy detected',      detail: 'NordVPN exit node identified',        impact: 'high'   },
  { label: 'Multiple accounts from IP', detail: '3 accounts registered today',         impact: 'high'   },
  { label: 'Mismatched location',       detail: 'IP country differs from profile',     impact: 'medium' },
  { label: 'No phone verified',         detail: 'Phone verification skipped',          impact: 'medium' },
  { label: 'Fast form completion',      detail: 'Form filled in under 8 seconds',      impact: 'medium' },
  { label: 'Identical device fingerprint', detail: 'Matches a previously rejected account', impact: 'high' },
  { label: 'Social login used',         detail: 'OAuth reduces fraud risk',            impact: 'low'    },
  { label: 'Trusted referral code',     detail: 'Referred by verified partner',        impact: 'low'    },
];

const AI_RECOMMENDATIONS = [
  'This registration appears legitimate. Auto-approval criteria met. Recommend approving.',
  'Minor risk flags detected. Request email verification before approving.',
  'High-risk signals present. Manual review required before account activation.',
  'VPN usage detected with mismatched location. Recommend requesting identity verification.',
  'Multiple accounts from this IP. Place on hold and investigate before approving.',
  'Trusted Google OAuth login. Low risk. Recommend auto-approval.',
];

function buildRegistrations() {
  const rand = seededRandom(9201);
  const regs = [];
  for (let i = 0; i < 35; i++) {
    const type      = rand() > 0.45 ? 'creator' : 'brand';
    const name      = type === 'creator' ? pick(rand, CREATOR_NAMES) : pick(rand, BRAND_NAMES);
    const email     = `${name.toLowerCase().replace(/\s/g, '.')}${Math.floor(rand() * 99)}@${pick(rand, ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mailinator.com'])}`;
    const status    = pick(rand, STATUSES);
    const riskLevel = pick(rand, RISK_LEVELS);
    const riskScore = riskLevel === 'low' ? Math.floor(5 + rand() * 25) : riskLevel === 'medium' ? Math.floor(30 + rand() * 30) : Math.floor(65 + rand() * 30);
    const country   = pick(rand, COUNTRIES);
    const city      = pick(rand, CITIES);
    const vpn       = riskLevel === 'high' && rand() > 0.5;
    const accountsFromIp = vpn ? Math.floor(2 + rand() * 4) : 1;
    const regTime   = i < 5 ? minsAgo(Math.floor(rand() * 55)) : i < 15 ? hoursAgo(Math.floor(rand() * 23)) : daysAgo(Math.floor(rand() * 28));
    const channel   = pick(rand, CHANNELS);
    const nRiskFactors = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 2 : 3;
    const riskFactors = [...RISK_FACTORS_POOL].sort(() => rand() - 0.5).slice(0, nRiskFactors);
    const flags = riskScore > 60 ? riskFactors.filter((r) => r.impact === 'high').map((r) => r.label) : [];

    const verif = {
      email:   rand() > 0.2 ? 'done' : 'pending',
      phone:   rand() > 0.4 ? 'done' : rand() > 0.5 ? 'pending' : null,
      profile: ['profile_complete', 'under_review', 'approved'].includes(status) ? 'done' : rand() > 0.6 ? 'pending' : null,
      kyc:     ['under_review', 'approved'].includes(status) ? 'done' : status === 'profile_complete' ? 'pending' : null,
      admin:   status === 'approved' ? 'done' : status === 'rejected' ? 'failed' : null,
    };

    regs.push({
      id:              `REG-${String(1000 + i).padStart(5, '0')}`,
      type,
      name,
      email,
      phone:           rand() > 0.3 ? `+92 3${Math.floor(10 + rand() * 89)} ${Math.floor(1000000 + rand() * 8999999)}` : null,
      companyName:     type === 'brand' ? name : null,
      niche:           type === 'creator' ? pick(rand, NICHES) : null,
      industry:        type === 'brand'   ? pick(rand, INDUSTRIES) : null,
      avatarColor:     pick(rand, COLORS),
      channel,
      referralCode:    channel === 'Referral Link' ? `REF-${Math.floor(1000 + rand() * 8999)}` : null,
      status,
      riskLevel,
      riskScore,
      flags,
      riskFactors,
      aiRecommendation: pick(rand, AI_RECOMMENDATIONS),
      registeredAt:    regTime,
      country,
      city,
      language:        pick(rand, ['English', 'Urdu', 'Arabic']),
      ipAddress:       `${Math.floor(100 + rand() * 155)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
      ipCity:          city,
      ipCountry:       country,
      isp:             pick(rand, ['PTCL', 'Zong', 'Jazz', 'STC', 'du Telecom', 'NordVPN (VPN)', 'Cloudflare']),
      vpnDetected:     vpn,
      deviceType:      pick(rand, DEVICES),
      os:              pick(rand, OS_LIST),
      browser:         pick(rand, BROWSERS),
      resolution:      pick(rand, ['375×812', '1440×900', '1920×1080', '390×844', '768×1024']),
      fingerprintId:   `FP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      accountsFromIp,
      verificationSteps: verif,
      docsSubmitted:   verif.kyc === 'done' ? (type === 'creator' ? ['CNIC Front', 'CNIC Back'] : ['Business Registration', 'Tax Certificate']) : [],
      adminNotes:      [],
    });
  }
  return regs.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
}

const ALL_REGISTRATIONS = buildRegistrations();

/* ─── Chart data ─────────────────────────────────────────────────── */

function buildTrendData() {
  const rand    = seededRandom(4499);
  const months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((label) => ({
    label,
    creators: Math.floor(18 + rand() * 40),
    brands:   Math.floor(5  + rand() * 18),
  }));
}

function buildChannelData() {
  return [
    { label: 'Google OAuth',    value: 38 },
    { label: 'Direct Signup',   value: 27 },
    { label: 'Facebook OAuth',  value: 16 },
    { label: 'Referral Link',   value: 12 },
    { label: 'Invitation',      value: 5  },
    { label: 'Email Campaign',  value: 2  },
  ];
}

function buildHourData() {
  const rand = seededRandom(7752);
  return Array.from({ length: 24 }, (_, h) => ({
    label:         `${h === 0 ? '12' : h > 12 ? h - 12 : h}${h < 12 ? 'am' : 'pm'}`,
    registrations: Math.floor(rand() * (h >= 8 && h <= 22 ? 12 : 3)),
  }));
}

const TREND_DATA   = buildTrendData();
const CHANNEL_DATA = buildChannelData();
const HOUR_DATA    = buildHourData();

/* ─── Meta lookups ───────────────────────────────────────────────── */

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
  low:      { label: 'Low',    variant: 'success', color: '#16b364' },
  medium:   { label: 'Medium', variant: 'warning', color: '#f59e0b' },
  high:     { label: 'High',   variant: 'danger',  color: '#f0445f' },
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Funnel stages ──────────────────────────────────────────────── */

const FUNNEL_STAGES = [
  { key: 'signed_up',       label: 'Signed Up',        icon: '📝', color: '#6d5cff', statuses: ['pending', 'email_verified', 'profile_complete', 'under_review', 'approved', 'rejected', 'suspended'] },
  { key: 'email_verified',  label: 'Email Verified',   icon: '✉️',  color: '#22c1ff', statuses: ['email_verified', 'profile_complete', 'under_review', 'approved']                                   },
  { key: 'profile_complete',label: 'Profile Complete', icon: '👤',  color: '#a78bfa', statuses: ['profile_complete', 'under_review', 'approved']                                                      },
  { key: 'under_review',    label: 'Under Review',     icon: '🔍',  color: '#f59e0b', statuses: ['under_review']                                                                                      },
  { key: 'approved',        label: 'Approved',         icon: '✅',  color: '#16b364', statuses: ['approved']                                                                                          },
];

/* ─── Auto-approval rules (display only) ─────────────────────────── */

const AUTO_RULES = [
  { id: 'r1', name: 'Google / Facebook OAuth',      desc: 'Auto-approve when signed up via trusted OAuth',       status: 'active',   matchCount: 148 },
  { id: 'r2', name: 'Verified Referral Code',       desc: 'Auto-approve referrals from verified partners',       status: 'active',   matchCount:  63 },
  { id: 'r3', name: 'Risk Score < 20',              desc: 'Auto-approve registrations with very low risk scores', status: 'active',   matchCount: 211 },
  { id: 'r4', name: 'Trusted Email Domains',        desc: '.edu and corporate domains',                           status: 'paused',   matchCount:  29 },
];

const FLAG_RULES = [
  { id: 'f1', name: 'Disposable Email Domain',     desc: 'mailinator, guerrilla, etc.',                          severity: 'high',   triggerCount: 7  },
  { id: 'f2', name: 'VPN / Proxy Detected',        desc: 'Registration via known VPN exit node',                 severity: 'high',   triggerCount: 12 },
  { id: 'f3', name: 'IP Velocity > 2 Accounts/Day',desc: 'More than 2 accounts from one IP in 24h',              severity: 'high',   triggerCount: 4  },
  { id: 'f4', name: 'Mismatched Geo-location',     desc: 'IP country differs from profile country',              severity: 'medium', triggerCount: 18 },
  { id: 'f5', name: 'Device Fingerprint Match',    desc: 'Matches a previously rejected account',                severity: 'high',   triggerCount: 3  },
  { id: 'f6', name: 'Form Completion < 10 Seconds',desc: 'Possible automated/bot submission',                    severity: 'medium', triggerCount: 9  },
];

/* ─── Main tab component ─────────────────────────────────────────── */

const SECTION_TABS = [
  { id: 'feed',      label: 'Registration Feed',  icon: '📋' },
  { id: 'analytics', label: 'Analytics',          icon: '📊' },
  { id: 'pipeline',  label: 'Verification Pipeline', icon: '🔄' },
  { id: 'rules',     label: 'Rules Engine',       icon: '⚙️'  },
];

const STATUS_FILTER_OPTIONS = ['All', 'pending', 'email_verified', 'profile_complete', 'under_review', 'approved', 'rejected'];
const TYPE_FILTER_OPTIONS   = ['All', 'creator', 'brand'];
const RISK_FILTER_OPTIONS   = ['All', 'low', 'medium', 'high'];

export default function RegistrationsTab({ onSelectRegistration }) {
  const [sectionTab,  setSectionTab]  = useState('feed');
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('All');
  const [typeFilter,  setTypeFilter]  = useState('All');
  const [riskFilter,  setRiskFilter]  = useState('All');
  const [autoRules,   setAutoRules]   = useState(AUTO_RULES);

  /* KPI derivations */
  const today    = useMemo(() => ALL_REGISTRATIONS.filter((r) => new Date(r.registeredAt) > new Date(Date.now() - 86_400_000)), []);
  const pending  = useMemo(() => ALL_REGISTRATIONS.filter((r) => r.status === 'pending'       || r.status === 'email_verified'), []);
  const review   = useMemo(() => ALL_REGISTRATIONS.filter((r) => r.status === 'under_review'), []);
  const approved = useMemo(() => ALL_REGISTRATIONS.filter((r) => r.status === 'approved'), []);
  const flagged  = useMemo(() => ALL_REGISTRATIONS.filter((r) => r.flags?.length > 0), []);

  /* Filtered feed */
  const filtered = useMemo(() => {
    let list = ALL_REGISTRATIONS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') list = list.filter((r) => r.status === statusFilter);
    if (typeFilter   !== 'All') list = list.filter((r) => r.type   === typeFilter);
    if (riskFilter   !== 'All') list = list.filter((r) => r.riskLevel === riskFilter);
    return list;
  }, [search, statusFilter, typeFilter, riskFilter]);

  const handleExportCsv = useCallback(() => {
    const rows = [
      ['ID', 'Name', 'Email', 'Type', 'Status', 'Risk', 'Channel', 'Country', 'Registered'].join(','),
      ...filtered.map((r) => [r.id, `"${r.name}"`, r.email, r.type, r.status, r.riskLevel, r.channel, r.country, r.registeredAt].join(',')),
    ].join('\n');
    const a  = document.createElement('a');
    a.href   = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [filtered]);

  const toggleRule = (id) => {
    setAutoRules((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard value={<AnimatedCounter value={today.length} />}       label="Today's Signups"     icon="📝"  />
        <StatCard value={<AnimatedCounter value={ALL_REGISTRATIONS.filter((r) => r.type === 'creator').length} />} label="Creator Signups" icon="◎" />
        <StatCard value={<AnimatedCounter value={ALL_REGISTRATIONS.filter((r) => r.type === 'brand').length} />}   label="Brand Signups"   icon="🏢" />
        <StatCard value={<AnimatedCounter value={pending.length} />}      label="Pending Verification" icon="⏳" />
        <StatCard value={<AnimatedCounter value={review.length} />}       label="Manual Review Queue" icon="🔍" />
        <StatCard value={<AnimatedCounter value={flagged.length} />}      label="Flagged Registrations" icon="🚨" highlight />
      </div>

      {/* ── Section tabs ── */}
      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
        {SECTION_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSectionTab(t.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              sectionTab === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — REGISTRATION FEED
         ══════════════════════════════════════════════════════════════ */}
      {sectionTab === 'feed' && (
        <div className="space-y-4">

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or ID…"
                className="input-base w-full pl-9 text-sm"
              />
            </div>

            {/* Type filter */}
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 120 }}>
              {TYPE_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? 'All Types' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>

            {/* Status filter */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 150 }}>
              {STATUS_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? 'All Statuses' : (STATUS_META[o]?.label ?? o)}</option>)}
            </select>

            {/* Risk filter */}
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input-base text-sm" style={{ width: 'auto', minWidth: 130 }}>
              {RISK_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? 'All Risk Levels' : o.charAt(0).toUpperCase() + o.slice(1) + ' Risk'}</option>)}
            </select>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:text-fg whitespace-nowrap"
              style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              ↓ Export CSV
            </button>

            <span className="text-fg-muted text-xs ml-auto">{filtered.length} registrations</span>
          </div>

          {/* Table */}
          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 1100 }}>
                <thead>
                  <tr
                    className="text-xs uppercase tracking-wider font-semibold text-fg-muted"
                    style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
                  >
                    <th className="px-4 py-3 text-left min-w-[220px]">User</th>
                    <th className="px-3 py-3 text-center w-20">Type</th>
                    <th className="px-3 py-3 text-left min-w-[140px]">Status</th>
                    <th className="px-3 py-3 text-left min-w-[140px]">Channel</th>
                    <th className="px-3 py-3 text-left min-w-[120px]">Location</th>
                    <th className="px-3 py-3 text-center w-24">Risk</th>
                    <th className="px-3 py-3 text-left min-w-[90px]">Registered</th>
                    <th className="px-3 py-3 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-fg-muted text-sm">No registrations match your filters.</td>
                    </tr>
                  ) : filtered.map((reg) => {
                    const status  = STATUS_META[reg.status]   ?? STATUS_META.pending;
                    const risk    = RISK_META[reg.riskLevel]  ?? RISK_META.low;
                    const initials= (reg.name || reg.email || '?').slice(0, 2).toUpperCase();
                    return (
                      <tr
                        key={reg.id}
                        style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                        className="hover:bg-white/[0.02] transition-colors"
                        onClick={() => onSelectRegistration?.(reg)}
                      >
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar initials={initials} color={reg.avatarColor} size="sm" />
                            <div className="min-w-0">
                              <p className="text-fg font-medium text-sm truncate">{reg.name}</p>
                              <p className="text-fg-muted text-xs truncate">{reg.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-3 py-3 text-center">
                          <Badge variant={reg.type === 'creator' ? 'brand' : 'accent'} label={reg.type === 'creator' ? 'Creator' : 'Brand'} />
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3">
                          <Badge variant={status.variant} label={status.label} dot />
                        </td>

                        {/* Channel */}
                        <td className="px-3 py-3 text-fg-muted text-xs">{reg.channel}</td>

                        {/* Location */}
                        <td className="px-3 py-3 text-fg-muted text-xs">{reg.city}, {reg.country}</td>

                        {/* Risk */}
                        <td className="px-3 py-3 text-center">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ background: `${risk.color}18`, color: risk.color }}
                          >
                            {reg.riskScore}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-3 py-3 text-fg-muted text-xs whitespace-nowrap">{relativeTime(reg.registeredAt)}</td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 justify-end">
                            {!['approved', 'rejected'].includes(reg.status) && (
                              <Button
                                variant="success"
                                size="xs"
                                onClick={() => onSelectRegistration?.(reg)}
                              >
                                Review
                              </Button>
                            )}
                            {reg.flags?.length > 0 && (
                              <span className="text-danger text-xs" title={`${reg.flags.length} risk flag${reg.flags.length > 1 ? 's' : ''}`}>
                                ⚠ {reg.flags.length}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — ANALYTICS
         ══════════════════════════════════════════════════════════════ */}
      {sectionTab === 'analytics' && (
        <div className="space-y-5">

          {/* Registration Trend */}
          <OpsChart
            title="Monthly Registrations — Creator vs Brand"
            subtitle="12-month signup trend broken down by account type"
            data={TREND_DATA}
            series={[
              { key: 'creators', label: 'Creators', color: '#6d5cff' },
              { key: 'brands',   label: 'Brands',   color: '#f59e0b' },
            ]}
            type="area"
            height={220}
          />

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Acquisition channels */}
            <div className="card rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                Acquisition Channels
              </h4>
              <div className="space-y-3">
                {CHANNEL_DATA.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-fg-muted text-xs w-32 flex-shrink-0 truncate">{c.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.value}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)', transition: 'width 0.6s ease' }}
                      />
                    </div>
                    <span className="text-fg text-xs font-bold w-10 text-right flex-shrink-0">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration by hour */}
            <OpsChart
              title="Registrations by Hour of Day"
              subtitle="When users are signing up"
              data={HOUR_DATA}
              series={[{ key: 'registrations', label: 'Signups', color: '#22c1ff' }]}
              type="area"
              height={200}
              bare={false}
            />
          </div>

          {/* Type & Status breakdown */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Creators',      value: ALL_REGISTRATIONS.filter((r) => r.type === 'creator').length,           color: '#6d5cff' },
              { label: 'Brands',        value: ALL_REGISTRATIONS.filter((r) => r.type === 'brand').length,             color: '#f59e0b' },
              { label: 'Approval Rate', value: `${Math.round((approved.length / ALL_REGISTRATIONS.length) * 100)}%`,  color: '#16b364' },
              { label: 'High Risk',     value: ALL_REGISTRATIONS.filter((r) => r.riskLevel === 'high').length,         color: '#f0445f' },
            ].map((m) => (
              <div key={m.label} className="card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: `${m.color}18`, color: m.color }}>
                  {typeof m.value === 'number' ? m.value : m.value}
                </div>
                <div>
                  <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
                  <p className="text-fg-muted text-xs">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — VERIFICATION PIPELINE
         ══════════════════════════════════════════════════════════════ */}
      {sectionTab === 'pipeline' && (
        <div className="space-y-5">
          {/* Funnel visualization */}
          <div className="card rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-fg mb-5" style={{ fontFamily: 'Sora, sans-serif' }}>
              Registration → Approval Funnel
            </h4>
            <div className="flex items-end gap-2 overflow-x-auto pb-2">
              {FUNNEL_STAGES.map((stage, i) => {
                const count     = ALL_REGISTRATIONS.filter((r) => stage.statuses.includes(r.status)).length;
                const maxCount  = ALL_REGISTRATIONS.length;
                const heightPct = Math.max(20, Math.round((count / maxCount) * 100));
                const pct       = Math.round((count / maxCount) * 100);
                return (
                  <div key={stage.key} className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                    {i > 0 && (
                      <div className="absolute">
                        <span className="text-fg-muted text-lg">›</span>
                      </div>
                    )}
                    <p className="text-fg font-bold text-xl" style={{ fontFamily: 'Sora, sans-serif', color: stage.color }}>{count}</p>
                    <div
                      className="w-full rounded-xl transition-all"
                      style={{ height: `${heightPct * 1.6}px`, background: `${stage.color}22`, border: `1px solid ${stage.color}44` }}
                    />
                    <p className="text-fg-muted text-xs text-center leading-tight">{stage.icon} {stage.label}</p>
                    <p className="text-fg-muted text-[10px]">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage breakdown cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FUNNEL_STAGES.map((stage) => {
              const regs = ALL_REGISTRATIONS.filter((r) => stage.statuses.includes(r.status) && !FUNNEL_STAGES.slice(0, FUNNEL_STAGES.indexOf(stage)).some((prev) => prev.statuses.every((s) => stage.statuses.includes(s))));
              const exactCount = ALL_REGISTRATIONS.filter((r) => r.status === (stage.key === 'signed_up' ? 'pending' : stage.key.replace('_', '_'))).length;
              return (
                <div key={stage.key} className="card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stage.icon}</span>
                      <p className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{stage.label}</p>
                    </div>
                    <span className="text-xl font-bold" style={{ color: stage.color, fontFamily: 'Sora, sans-serif' }}>
                      {ALL_REGISTRATIONS.filter((r) => stage.statuses.includes(r.status)).length}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((ALL_REGISTRATIONS.filter((r) => stage.statuses.includes(r.status)).length / ALL_REGISTRATIONS.length) * 100)}%`,
                        background: stage.color,
                      }}
                    />
                  </div>
                  <p className="text-fg-muted text-xs">
                    {Math.round((ALL_REGISTRATIONS.filter((r) => stage.statuses.includes(r.status)).length / ALL_REGISTRATIONS.length) * 100)}% of all registrations
                  </p>
                </div>
              );
            })}
          </div>

          {/* Under Review queue */}
          {review.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                Manual Review Queue <span className="text-warning">({review.length})</span>
              </h4>
              <div className="card rounded-2xl overflow-hidden">
                {review.slice(0, 8).map((reg, idx) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02] cursor-pointer"
                    style={idx > 0 ? { borderTop: '1px solid var(--border)' } : {}}
                    onClick={() => onSelectRegistration?.(reg)}
                  >
                    <Avatar initials={(reg.name || '?').slice(0, 2).toUpperCase()} color={reg.avatarColor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-fg font-medium text-sm">{reg.name}</p>
                      <p className="text-fg-muted text-xs">{reg.email}</p>
                    </div>
                    <Badge variant={reg.type === 'creator' ? 'brand' : 'accent'} label={reg.type === 'creator' ? 'Creator' : 'Brand'} />
                    <Badge variant={RISK_META[reg.riskLevel]?.variant ?? 'neutral'} label={`${reg.riskScore} risk`} />
                    <span className="text-fg-muted text-xs whitespace-nowrap">{relativeTime(reg.registeredAt)}</span>
                    <Button variant="secondary" size="xs" onClick={(e) => { e.stopPropagation(); onSelectRegistration?.(reg); }}>Review</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — RULES ENGINE
         ══════════════════════════════════════════════════════════════ */}
      {sectionTab === 'rules' && (
        <div className="space-y-6">

          {/* Auto-approval rules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Auto-Approval Rules</h4>
                <p className="text-xs text-fg-muted mt-0.5">Registrations matching these criteria are approved automatically.</p>
              </div>
              <Button variant="secondary" size="xs">+ Add Rule</Button>
            </div>
            <div className="space-y-3">
              {autoRules.map((rule) => (
                <div key={rule.id} className="card rounded-2xl p-4 flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: rule.status === 'active' ? 'rgba(22,179,100,0.12)' : 'var(--surface-2)' }}
                  >
                    <span className="text-base">{rule.status === 'active' ? '✅' : '⏸'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-fg font-semibold text-sm">{rule.name}</p>
                    <p className="text-fg-muted text-xs mt-0.5">{rule.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{rule.matchCount}</p>
                      <p className="text-fg-muted text-[10px]">matched</p>
                    </div>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                      style={rule.status === 'active'
                        ? { background: 'rgba(22,179,100,0.12)', color: '#16b364' }
                        : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      {rule.status === 'active' ? '✓ Active' : '⏸ Paused'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flag / Block rules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Fraud Detection & Flag Rules</h4>
                <p className="text-xs text-fg-muted mt-0.5">These conditions flag a registration for manual review.</p>
              </div>
              <Button variant="secondary" size="xs">+ Add Rule</Button>
            </div>
            <div className="space-y-3">
              {FLAG_RULES.map((rule) => (
                <div key={rule.id} className="card rounded-2xl p-4 flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: rule.severity === 'high' ? 'rgba(240,68,95,0.12)' : 'rgba(245,166,35,0.12)' }}
                  >
                    <span className="text-base">{rule.severity === 'high' ? '🚨' : '⚠️'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-fg font-semibold text-sm">{rule.name}</p>
                    <p className="text-fg-muted text-xs mt-0.5">{rule.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={rule.severity === 'high' ? 'danger' : 'warning'} label={rule.severity === 'high' ? 'High' : 'Medium'} />
                    <div className="text-right">
                      <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{rule.triggerCount}</p>
                      <p className="text-fg-muted text-[10px]">triggered</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocklist / Allowlist */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>🚫 Blocked Domains</h4>
                <Button variant="ghost" size="xs">+ Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email', 'yopmail.com'].map((d) => (
                  <span key={d} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(240,68,95,0.1)', color: '#f0445f', border: '1px solid rgba(240,68,95,0.2)' }}>
                    {d}
                    <button type="button" className="opacity-60 hover:opacity-100 leading-none">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>✅ Trusted Domains</h4>
                <Button variant="ghost" size="xs">+ Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['gmail.com', 'outlook.com', '.edu.pk', 'company.com', 'protonmail.com'].map((d) => (
                  <span key={d} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(22,179,100,0.1)', color: '#16b364', border: '1px solid rgba(22,179,100,0.2)' }}>
                    {d}
                    <button type="button" className="opacity-60 hover:opacity-100 leading-none">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

RegistrationsTab.propTypes = {
  onSelectRegistration: PropTypes.func,
};
