/**
 * Mock data layer for the Admin "Trust & Safety" command center.
 * Illustrative data only — wire up to dedicated admin endpoints once available.
 */

/* ── Deterministic pseudo-random helper (stable across re-renders) ── */
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function buildSeries(points, { base, trend = 0, volatility = 0.06, seed = 1 }) {
  const rand = seededRandom(seed);
  let value = base;
  const out = [];
  for (let i = 0; i < points; i++) {
    value = value * (1 + trend) + (rand() - 0.5) * base * volatility;
    out.push(Math.max(0, Math.round(value)));
  }
  return out;
}

function dateLabels(points, unit) {
  const out = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now);
    if (unit === 'day') d.setDate(d.getDate() - i);
    if (unit === 'week') d.setDate(d.getDate() - i * 7);
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    out.push(
      unit === 'month'
        ? d.toLocaleDateString('en-US', { month: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
  }
  return out;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function clamp(n, min = 1, max = 99) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function genInitials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ───────────────────────── Meta lookups ───────────────────────── */

export const SAFETY_META = {
  excellent: { label: 'Excellent', variant: 'success', min: 85 },
  healthy:   { label: 'Healthy',   variant: 'brand',   min: 70 },
  warning:   { label: 'Warning',   variant: 'warning', min: 50 },
  critical:  { label: 'Critical',  variant: 'danger',  min: 0 },
};

export function safetyStatusFor(score) {
  if (score >= SAFETY_META.excellent.min) return 'excellent';
  if (score >= SAFETY_META.healthy.min) return 'healthy';
  if (score >= SAFETY_META.warning.min) return 'warning';
  return 'critical';
}

export const RISK_META = {
  low:      { label: 'Low Risk',      variant: 'success' },
  medium:   { label: 'Medium Risk',   variant: 'brand' },
  high:     { label: 'High Risk',     variant: 'warning' },
  critical: { label: 'Critical Risk', variant: 'danger' },
};

export function riskLevelFor(score) {
  if (score >= 60) return 'critical';
  if (score >= 40) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

export const SEVERITY_META = {
  low:      { label: 'Low',      variant: 'success' },
  medium:   { label: 'Medium',   variant: 'brand' },
  high:     { label: 'High',     variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
};

export const REPORT_STATUS_META = {
  new:           { label: 'New',           variant: 'brand' },
  under_review:  { label: 'Under Review',  variant: 'warning' },
  escalated:     { label: 'Escalated',     variant: 'danger' },
  resolved:      { label: 'Resolved',      variant: 'success' },
  dismissed:     { label: 'Dismissed',     variant: 'neutral' },
};

export const INVESTIGATION_STATUS_META = {
  open:          { label: 'Open',          variant: 'brand' },
  under_review:  { label: 'Under Review',  variant: 'warning' },
  escalated:     { label: 'Escalated',     variant: 'danger' },
  resolved:      { label: 'Resolved',      variant: 'success' },
  closed:        { label: 'Closed',        variant: 'neutral' },
};

export const DISPUTE_STAGE_META = [
  { id: 'opened',          label: 'Opened' },
  { id: 'evidence_review', label: 'Evidence Review' },
  { id: 'negotiation',     label: 'Negotiation' },
  { id: 'admin_review',    label: 'Admin Review' },
  { id: 'resolved',        label: 'Resolved' },
  { id: 'closed',          label: 'Closed' },
];

export const DISPUTE_STAGE_VARIANT = {
  opened: 'brand', evidence_review: 'brand', negotiation: 'warning',
  admin_review: 'warning', resolved: 'success', closed: 'neutral',
};

export const REPORT_CATEGORIES = [
  'Spam', 'Scam', 'Harassment', 'Fake Followers', 'Fake Engagement', 'Payment Abuse',
  'Copyright Violation', 'Misleading Content', 'Fraud', 'Identity Misrepresentation',
  'Contract Violation', 'Platform Abuse',
];

export const FRAUD_ALERT_TYPES = [
  'Sudden Follower Spike', 'Abnormal Engagement Growth', 'Suspicious Login Activity',
  'Mass Messaging', 'Repeated Violations', 'Unusual Payment Activity',
];

export const FRAUD_CATEGORIES = [
  { id: 'fake_followers',   label: 'Fake Followers',     icon: '👥' },
  { id: 'fake_engagement',  label: 'Fake Engagement',    icon: '💬' },
  { id: 'bot_activity',     label: 'Bot Activity',       icon: '🤖' },
  { id: 'fake_accounts',    label: 'Fake Accounts',      icon: '🪪' },
  { id: 'account_farms',    label: 'Account Farms',      icon: '🏭' },
  { id: 'payment_abuse',    label: 'Payment Abuse',      icon: '💳' },
  { id: 'multi_account',    label: 'Multi-Account Abuse', icon: '🧬' },
  { id: 'suspicious_traffic', label: 'Suspicious Traffic', icon: '📡' },
];

/* ───────────────────────── Moderators & Users ───────────────────────── */

export const MODERATORS = [
  { id: 'MOD-01', name: 'Areeba Noman', initials: 'AN', color: '#6d5cff' },
  { id: 'MOD-02', name: 'Saad Iqbal',   initials: 'SI', color: '#22c1ff' },
  { id: 'MOD-03', name: 'Hassan Raza',  initials: 'HR', color: '#16b364' },
  { id: 'MOD-04', name: 'Mariam Sohail', initials: 'MS', color: '#f0445f' },
  { id: 'MOD-05', name: 'Bilal Sheikh', initials: 'BS', color: '#f59e0b' },
];

const CREATOR_POOL = [
  { name: 'Ayesha Khan',   handle: '@ayeshakhan',    color: '#6d5cff' },
  { name: 'Bilal Ahmed',   handle: '@bilaltravels',  color: '#22c1ff' },
  { name: 'Sara Malik',    handle: '@sara.glows',    color: '#f0445f' },
  { name: 'Hamza Tariq',   handle: '@hamzafitness',  color: '#16b364' },
  { name: 'Mehak Raza',    handle: '@mehakeats',     color: '#f59e0b' },
  { name: 'Omar Farooq',   handle: '@omargamez',     color: '#4c2dd1' },
  { name: 'Fatima Sheikh', handle: '@fatimastyle',   color: '#857fff' },
  { name: 'Usman Javed',   handle: '@usmanmoney',    color: '#16b364' },
  { name: 'Zainab Ali',    handle: '@zainablife',    color: '#f0445f' },
  { name: 'Talha Nadeem',  handle: '@talhabuzz',     color: '#22c1ff' },
  { name: 'Hira Yousaf',   handle: '@hiraglam',      color: '#6d5cff' },
  { name: 'Danial Sheikh', handle: '@danial.codes',  color: '#857fff' },
  { name: 'Ahmed Raza',    handle: '@ahmedraza.fit', color: '#f59e0b' },
  { name: 'Noor Fatima',   handle: '@noorfatima.travel', color: '#22c1ff' },
];

const BRAND_POOL = [
  { name: 'Zara Apparel',      handle: '@zaraapparel',      color: '#6d5cff' },
  { name: 'GlowUp Cosmetics',  handle: '@glowupcosmetics',  color: '#f0445f' },
  { name: 'TechNova',          handle: '@technova',         color: '#22c1ff' },
  { name: 'PixelPlay Games',   handle: '@pixelplaygames',   color: '#4c2dd1' },
  { name: 'FitZone',           handle: '@fitzone',          color: '#16b364' },
  { name: 'Wanderlust Travels', handle: '@wanderlusttravels', color: '#22c1ff' },
  { name: 'EduSmart',          handle: '@edusmart',         color: '#857fff' },
  { name: 'TasteBite Foods',   handle: '@tastebitefoods',   color: '#f59e0b' },
  { name: 'FinSecure',         handle: '@finsecure',        color: '#16b364' },
  { name: 'UrbanThreads',      handle: '@urbanthreads',     color: '#6d5cff' },
  { name: 'PureGlow',          handle: '@pureglow',         color: '#f0445f' },
  { name: 'ByteCraft',         handle: '@bytecraft',        color: '#22c1ff' },
  { name: 'GameVerse',         handle: '@gameverse',        color: '#4c2dd1' },
  { name: 'ActiveLife',        handle: '@activelife',       color: '#16b364' },
  { name: 'SkyHigh Airlines',  handle: '@skyhighairlines',  color: '#857fff' },
  { name: 'LearnFast',         handle: '@learnfast',        color: '#f59e0b' },
];

function userByName(name) {
  const found = [...CREATOR_POOL, ...BRAND_POOL].find((u) => u.name === name);
  const isCreator = CREATOR_POOL.includes(found);
  return {
    name,
    type: isCreator ? 'Creator' : 'Brand',
    handle: found?.handle ?? '',
    initials: genInitials(name),
    color: found?.color ?? '#6d5cff',
  };
}

/* ───────────────────────── Filter options ───────────────────────── */

export const FILTER_OPTIONS = {
  severity: ['All Severities', 'Low', 'Medium', 'High', 'Critical'],
  riskLevel: ['All Risk Levels', 'Low', 'Medium', 'High', 'Critical'],
  category: ['All Categories', ...REPORT_CATEGORIES],
  status: ['All Statuses', 'New', 'Under Review', 'Escalated', 'Resolved', 'Dismissed'],
  moderator: ['All Moderators', ...MODERATORS.map((m) => m.name)],
  dateRange: ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'],
  userType: ['All Types', 'Creator', 'Brand'],
};

export const ACCOUNT_FILTER_OPTIONS = {
  riskLevel: ['All Risk Levels', 'Low', 'Medium', 'High', 'Critical'],
  userType: ['All Types', 'Creator', 'Brand'],
  status: ['All Statuses', 'Active', 'Restricted', 'Suspended', 'Under Review'],
};

export const DISPUTE_FILTER_OPTIONS = {
  type: ['All Types', 'Payment Dispute', 'Contract Dispute', 'Deliverable Dispute', 'Campaign Dispute', 'Content Approval Dispute'],
  stage: ['All Stages', ...DISPUTE_STAGE_META.map((s) => s.label)],
};

/* ───────────────────────── Overview KPIs & Safety Score ───────────────────────── */

export const OVERVIEW_KPIS = [
  { id: 'pendingReports',  label: 'Pending Reports',       icon: '📥', value: 47,  prevValue: 56,  format: 'number',  sparkline: buildSeries(14, { base: 55, trend: -0.01, seed: 201 }), accent: '#f59e0b' },
  { id: 'activeInvestigations', label: 'Active Investigations', icon: '🔍', value: 18, prevValue: 22, format: 'number', sparkline: buildSeries(14, { base: 22, trend: -0.008, seed: 202 }), accent: '#22c1ff' },
  { id: 'suspiciousAccounts', label: 'Suspicious Accounts', icon: '🪪', value: 64, prevValue: 71, format: 'number', sparkline: buildSeries(14, { base: 70, trend: -0.006, seed: 203 }), accent: '#f0445f' },
  { id: 'fraudAlerts', label: 'Fraud Alerts',  icon: '🚨', value: 23, prevValue: 19, format: 'number', sparkline: buildSeries(14, { base: 19, trend: 0.015, seed: 204 }), accent: '#f0445f' },
  { id: 'openDisputes', label: 'Open Disputes', icon: '⚖️', value: 12, prevValue: 16, format: 'number', sparkline: buildSeries(14, { base: 16, trend: -0.012, seed: 205 }), accent: '#857fff' },
  { id: 'resolvedCases', label: 'Resolved Cases', icon: '✅', value: 312, prevValue: 278, format: 'number', sparkline: buildSeries(14, { base: 278, trend: 0.009, seed: 206 }), accent: '#16b364' },
  { id: 'platformRiskScore', label: 'Platform Risk Score', icon: '📉', value: 24, prevValue: 29, format: 'number', sparkline: buildSeries(14, { base: 29, trend: -0.01, seed: 207 }), accent: '#f59e0b' },
  { id: 'safetyScore', label: 'Safety Score', icon: '🛡️', value: 88, prevValue: 84, format: 'number', sparkline: buildSeries(14, { base: 84, trend: 0.004, seed: 208 }), accent: '#16b364' },
];

export const SAFETY_FACTORS = [
  { key: 'fraudRate',          label: 'Fraud Rate',          score: 91, description: 'Share of activity flagged as fraudulent' },
  { key: 'disputeRate',        label: 'Dispute Rate',        score: 86, description: 'Disputes opened relative to active campaigns' },
  { key: 'contentViolations',  label: 'Content Violations',  score: 84, description: 'Policy-violating content removed or flagged' },
  { key: 'paymentAbuse',       label: 'Payment Abuse',       score: 90, description: 'Chargebacks, refund abuse & escrow disputes' },
  { key: 'accountAbuse',       label: 'Account Abuse',       score: 82, description: 'Multi-accounting, fake accounts & bot activity' },
];

export const PLATFORM_SAFETY_SCORE = Math.round(
  SAFETY_FACTORS.reduce((s, f) => s + f.score, 0) / SAFETY_FACTORS.length
);

export const SAFETY_SCORE_TREND = buildSeries(14, { base: 82, trend: 0.005, volatility: 0.02, seed: 209 });

/* ───────────────────────── Reports Center ───────────────────────── */

const REPORT_SEEDS = [
  { id: 'RPT-3001', reporter: 'Ayesha Khan',   reported: 'GlowUp Cosmetics', category: 'Payment Abuse',            severity: 'high',     status: 'under_review', age: 2 },
  { id: 'RPT-3002', reporter: 'TechNova',      reported: 'Bilal Ahmed',      category: 'Fake Followers',           severity: 'medium',   status: 'new',          age: 1 },
  { id: 'RPT-3003', reporter: 'Sara Malik',    reported: 'Omar Farooq',      category: 'Harassment',               severity: 'critical', status: 'escalated',    age: 4 },
  { id: 'RPT-3004', reporter: 'PixelPlay Games', reported: 'Hamza Tariq',    category: 'Fake Engagement',          severity: 'medium',   status: 'resolved',     age: 12 },
  { id: 'RPT-3005', reporter: 'Mehak Raza',    reported: 'UrbanThreads',     category: 'Contract Violation',       severity: 'high',     status: 'under_review', age: 3 },
  { id: 'RPT-3006', reporter: 'FitZone',       reported: 'Zainab Ali',       category: 'Spam',                     severity: 'low',      status: 'dismissed',    age: 9 },
  { id: 'RPT-3007', reporter: 'Talha Nadeem',  reported: 'ByteCraft',        category: 'Scam',                     severity: 'critical', status: 'escalated',    age: 1 },
  { id: 'RPT-3008', reporter: 'Hira Yousaf',   reported: 'GameVerse',        category: 'Copyright Violation',      severity: 'medium',   status: 'new',          age: 1 },
  { id: 'RPT-3009', reporter: 'Wanderlust Travels', reported: 'Fatima Sheikh', category: 'Misleading Content',     severity: 'medium',   status: 'under_review', age: 5 },
  { id: 'RPT-3010', reporter: 'Usman Javed',   reported: 'SkyHigh Airlines', category: 'Fraud',                    severity: 'critical', status: 'escalated',    age: 2 },
  { id: 'RPT-3011', reporter: 'EduSmart',      reported: 'Danial Sheikh',    category: 'Identity Misrepresentation', severity: 'high',   status: 'under_review', age: 6 },
  { id: 'RPT-3012', reporter: 'Noor Fatima',   reported: 'ActiveLife',       category: 'Platform Abuse',           severity: 'low',      status: 'new',          age: 0 },
  { id: 'RPT-3013', reporter: 'TasteBite Foods', reported: 'Ahmed Raza',     category: 'Fake Followers',           severity: 'medium',   status: 'resolved',     age: 15 },
  { id: 'RPT-3014', reporter: 'PureGlow',      reported: 'LearnFast',        category: 'Payment Abuse',            severity: 'high',     status: 'escalated',    age: 3 },
  { id: 'RPT-3015', reporter: 'FinSecure',     reported: 'Omar Farooq',      category: 'Fake Engagement',          severity: 'medium',   status: 'resolved',     age: 20 },
  { id: 'RPT-3016', reporter: 'Zara Apparel',  reported: 'Bilal Ahmed',      category: 'Spam',                     severity: 'low',      status: 'dismissed',    age: 18 },
];

function genEvidence(rand, seed) {
  const conversationPool = [
    'Discussed deliverable timeline and payment terms.',
    'Creator requested early payment before content delivery.',
    'Brand pushed for additional unpaid revisions.',
    'Repeated messages pressuring for a 5-star review.',
  ];
  const activityPool = [
    'Logged in from a new device', 'Followed 800 accounts in 1 hour', 'Submitted deliverable late',
    'Edited campaign terms after acceptance', 'Multiple failed payment attempts', 'Account email changed',
  ];
  return {
    screenshots: Array.from({ length: 1 + Math.floor(rand() * 3) }, (_, i) => ({
      id: `SCR-${seed}-${i}`, caption: `Screenshot evidence ${i + 1}`,
    })),
    files: Array.from({ length: Math.floor(rand() * 3) }, (_, i) => ({
      id: `FILE-${seed}-${i}`, name: `evidence_${i + 1}.pdf`, type: 'PDF', size: `${(120 + rand() * 800).toFixed(0)} KB`,
    })),
    links: Array.from({ length: Math.floor(rand() * 2) + 1 }, (_, i) => ({
      id: `LNK-${seed}-${i}`, label: `External profile reference ${i + 1}`, url: '#',
    })),
    conversationLogs: Array.from({ length: Math.floor(rand() * 2) + 1 }, (_, i) => ({
      id: `CONV-${seed}-${i}`, snippet: pick(rand, conversationPool), date: daysAgo(Math.floor(rand() * 10) + 1),
    })),
    campaignRecords: Array.from({ length: Math.floor(rand() * 2) + 1 }, (_, i) => ({
      id: `CMP-REC-${seed}-${i}`, campaignName: pick(rand, ['Eid Collection Launch', 'GlowUp Skincare UGC Drive', 'NovaPhone X Awareness', 'Summer Shred Challenge']), role: pick(rand, ['Creator', 'Brand']),
    })),
    paymentRecords: Array.from({ length: Math.floor(rand() * 2) + 1 }, (_, i) => ({
      id: `PAY-REC-${seed}-${i}`, amount: Math.round((10000 + rand() * 90000) / 100) * 100, date: daysAgo(Math.floor(rand() * 20) + 1), status: pick(rand, ['Completed', 'Pending', 'Refunded', 'Disputed']),
    })),
    activityLogs: Array.from({ length: 2 + Math.floor(rand() * 3) }, (_, i) => ({
      id: `ACT-${seed}-${i}`, action: pick(rand, activityPool), date: daysAgo(Math.floor(rand() * 15) + 1),
    })),
  };
}

function genHistory(seed) {
  const events = [
    { id: 'h1', label: 'Report Created', icon: '📥', date: daysAgo(seed.age) },
    { id: 'h2', label: 'Evidence Submitted', icon: '📎', date: daysAgo(Math.max(0, seed.age - 1)) },
    { id: 'h3', label: `Assigned to ${seed.assignedModerator}`, icon: '🧑‍💼', date: daysAgo(Math.max(0, seed.age - 1)) },
  ];
  if (seed.status === 'escalated') {
    events.push({ id: 'h4', label: 'Escalated to senior moderator', icon: '⬆️', date: daysAgo(Math.max(0, seed.age - 1)) });
  }
  if (seed.status === 'resolved' || seed.status === 'dismissed') {
    events.push({ id: 'h5', label: seed.status === 'resolved' ? 'Case resolved' : 'Report dismissed', icon: seed.status === 'resolved' ? '✅' : '🗂️', date: daysAgo(0) });
  }
  return events;
}

function genNotes(rand, seed) {
  const pool = [
    'Reviewed conversation logs — pattern is consistent with prior complaints.',
    'Reached out to reported user for clarification, awaiting response.',
    'Cross-checked payment records against escrow ledger — no discrepancy yet.',
    'Account history shows two prior reports of similar nature.',
    'Flagged for senior review due to severity of allegations.',
  ];
  return Array.from({ length: 1 + Math.floor(rand() * 2) }, (_, i) => ({
    id: `note-${seed.id}-${i}`, author: seed.assignedModerator, date: daysAgo(Math.max(0, seed.age - i)), text: pick(rand, pool),
  }));
}

function genDecisionLog(seed) {
  const log = [];
  if (seed.status === 'under_review' || seed.status === 'escalated' || seed.status === 'resolved' || seed.status === 'dismissed') {
    log.push({ id: 'd1', decision: 'Requested additional evidence', by: seed.assignedModerator, date: daysAgo(Math.max(0, seed.age - 1)), note: 'Needed conversation logs to confirm pattern of behaviour.' });
  }
  if (seed.status === 'escalated') {
    log.push({ id: 'd2', decision: 'Escalated to senior moderator', by: seed.assignedModerator, date: daysAgo(Math.max(0, seed.age - 1)), note: 'Severity and risk score exceeded auto-escalation threshold.' });
  }
  if (seed.status === 'resolved') {
    log.push({ id: 'd2', decision: 'Action taken — warning issued & content removed', by: seed.assignedModerator, date: daysAgo(0), note: 'Policy violation confirmed; first offence, warning issued.' });
  }
  if (seed.status === 'dismissed') {
    log.push({ id: 'd2', decision: 'Report dismissed — no policy violation found', by: seed.assignedModerator, date: daysAgo(0), note: 'Evidence did not substantiate the claim.' });
  }
  return log;
}

export const REPORTS = REPORT_SEEDS.map((seed, i) => {
  const rand = seededRandom(700 + i * 13);
  const severityBase = { low: 15, medium: 38, high: 58, critical: 78 }[seed.severity];
  const riskScore = clamp(severityBase + rand() * 18 - 8);
  const previousReports = seed.severity === 'low' ? Math.floor(rand() * 2) : Math.floor(rand() * 4) + (seed.severity === 'critical' ? 2 : 0);
  const assignedModerator = pick(rand, MODERATORS).name;
  const full = {
    ...seed,
    reporterInfo: userByName(seed.reporter),
    reportedInfo: userByName(seed.reported),
    userType: userByName(seed.reported).type,
    riskScore,
    accountRisk: riskLevelFor(riskScore),
    previousReports,
    assignedModerator,
    createdDate: daysAgo(seed.age),
    description: `${seed.reporter} reported ${seed.reported} for ${seed.category.toLowerCase()} based on activity observed over the past ${seed.age + 2} days. Reporter provided supporting evidence and requested platform review.`,
    attachments: [`evidence_${seed.id}_1.png`, `evidence_${seed.id}_2.pdf`],
  };
  full.evidence = genEvidence(rand, seed.id);
  full.history = genHistory(full);
  full.notes = genNotes(rand, full);
  full.decisionLog = genDecisionLog(full);
  return full;
});

/* ───────────────────────── Investigations ───────────────────────── */

const INVESTIGATION_SEEDS = [
  { id: 'INV-4001', title: 'Coordinated fake-follower network on Beauty creators', priority: 'critical', severity: 'critical', status: 'escalated', relatedReports: ['RPT-3013', 'RPT-3015'], riskLevel: 'critical', age: 4, admin: 'Areeba Noman' },
  { id: 'INV-4002', title: 'Repeated harassment reports against Omar Farooq', priority: 'high', severity: 'high', status: 'under_review', relatedReports: ['RPT-3003'], riskLevel: 'high', age: 3, admin: 'Saad Iqbal' },
  { id: 'INV-4003', title: 'ByteCraft scam allegations from multiple creators', priority: 'critical', severity: 'critical', status: 'open', relatedReports: ['RPT-3007'], riskLevel: 'critical', age: 1, admin: 'Hassan Raza' },
  { id: 'INV-4004', title: 'SkyHigh Airlines fraudulent campaign payouts', priority: 'critical', severity: 'critical', status: 'escalated', relatedReports: ['RPT-3010'], riskLevel: 'critical', age: 2, admin: 'Mariam Sohail' },
  { id: 'INV-4005', title: 'UrbanThreads contract terms dispute pattern', priority: 'medium', severity: 'medium', status: 'under_review', relatedReports: ['RPT-3005'], riskLevel: 'medium', age: 5, admin: 'Bilal Sheikh' },
  { id: 'INV-4006', title: 'Identity misrepresentation — Danial Sheikh', priority: 'high', severity: 'high', status: 'open', relatedReports: ['RPT-3011'], riskLevel: 'high', age: 6, admin: 'Areeba Noman' },
  { id: 'INV-4007', title: 'GameVerse repeated copyright violations', priority: 'medium', severity: 'medium', status: 'resolved', relatedReports: ['RPT-3008'], riskLevel: 'medium', age: 14, admin: 'Saad Iqbal' },
  { id: 'INV-4008', title: 'LearnFast escrow payment abuse pattern', priority: 'high', severity: 'high', status: 'under_review', relatedReports: ['RPT-3014'], riskLevel: 'high', age: 3, admin: 'Hassan Raza' },
  { id: 'INV-4009', title: 'Wanderlust Travels misleading content review', priority: 'low', severity: 'medium', status: 'open', relatedReports: ['RPT-3009'], riskLevel: 'medium', age: 5, admin: 'Mariam Sohail' },
  { id: 'INV-4010', title: 'Closed: Spam network on new creator accounts', priority: 'low', severity: 'low', status: 'closed', relatedReports: ['RPT-3006', 'RPT-3016'], riskLevel: 'low', age: 22, admin: 'Bilal Sheikh' },
];

const TIMELINE_STAGES = [
  { id: 'created',   label: 'Report Created',     icon: '📥' },
  { id: 'evidence',  label: 'Evidence Added',     icon: '📎' },
  { id: 'assigned',  label: 'Moderator Assigned', icon: '🧑‍💼' },
  { id: 'contacted', label: 'User Contacted',     icon: '✉️' },
  { id: 'decision',  label: 'Decision Made',      icon: '⚖️' },
  { id: 'closed',    label: 'Case Closed',        icon: '🗂️' },
];

const STATUS_STAGE_COUNT = { open: 2, under_review: 3, escalated: 4, resolved: 5, closed: 6 };

export const INVESTIGATIONS = INVESTIGATION_SEEDS.map((seed, i) => {
  const rand = seededRandom(800 + i * 11);
  const stageCount = STATUS_STAGE_COUNT[seed.status] ?? 2;
  const timeline = TIMELINE_STAGES.slice(0, stageCount).map((stage, idx) => ({
    ...stage,
    date: daysAgo(seed.age - idx >= 0 ? seed.age - idx : 0),
  }));
  return {
    ...seed,
    riskScore: clamp({ low: 20, medium: 42, high: 62, critical: 82 }[seed.riskLevel] + rand() * 12 - 6),
    createdDate: daysAgo(seed.age),
    timeline,
  };
});

/* ───────────────────────── Fraud Detection ───────────────────────── */

const FRAUD_ALERT_SEEDS = [
  { id: 'FRD-5001', type: 'Sudden Follower Spike', user: 'Hira Yousaf', severity: 'high', age: 0 },
  { id: 'FRD-5002', type: 'Abnormal Engagement Growth', user: 'Ahmed Raza', severity: 'medium', age: 1 },
  { id: 'FRD-5003', type: 'Suspicious Login Activity', user: 'ByteCraft', severity: 'critical', age: 0 },
  { id: 'FRD-5004', type: 'Mass Messaging', user: 'Omar Farooq', severity: 'high', age: 2 },
  { id: 'FRD-5005', type: 'Repeated Violations', user: 'Bilal Ahmed', severity: 'medium', age: 3 },
  { id: 'FRD-5006', type: 'Unusual Payment Activity', user: 'SkyHigh Airlines', severity: 'critical', age: 1 },
  { id: 'FRD-5007', type: 'Sudden Follower Spike', user: 'Talha Nadeem', severity: 'medium', age: 4 },
  { id: 'FRD-5008', type: 'Unusual Payment Activity', user: 'LearnFast', severity: 'high', age: 2 },
  { id: 'FRD-5009', type: 'Suspicious Login Activity', user: 'Danial Sheikh', severity: 'medium', age: 5 },
];

const FRAUD_DESCRIPTIONS = {
  'Sudden Follower Spike': (u) => `${u} gained an unusually large number of followers within 24 hours, inconsistent with historical growth.`,
  'Abnormal Engagement Growth': (u) => `Engagement rate for ${u} jumped sharply without a corresponding increase in reach.`,
  'Suspicious Login Activity': (u) => `Multiple logins for ${u} detected from new locations within a short window.`,
  'Mass Messaging': (u) => `${u} sent a high volume of near-identical messages to other users in a short period.`,
  'Repeated Violations': (u) => `${u} has triggered the same policy violation multiple times in 30 days.`,
  'Unusual Payment Activity': (u) => `Payment activity for ${u} deviates significantly from their historical pattern.`,
};

export const FRAUD_ALERTS = FRAUD_ALERT_SEEDS.map((seed, i) => {
  const rand = seededRandom(900 + i * 7);
  const severityBase = { low: 15, medium: 40, high: 60, critical: 80 }[seed.severity];
  return {
    ...seed,
    userInfo: userByName(seed.user),
    riskScore: clamp(severityBase + rand() * 14 - 6),
    detectedDate: daysAgo(seed.age),
    description: FRAUD_DESCRIPTIONS[seed.type](seed.user),
    status: seed.age === 0 ? 'New' : pick(rand, ['Investigating', 'New']),
  };
});

export const FRAUD_MONITOR_STATS = FRAUD_CATEGORIES.map((cat, i) => {
  const rand = seededRandom(1000 + i * 9);
  return {
    ...cat,
    detected: Math.floor(20 + rand() * 80),
    trend: Math.round((rand() * 20 - 8) * 10) / 10,
    severity: pick(rand, ['low', 'medium', 'high']),
  };
});

const SUSPICIOUS_ACCOUNT_SEEDS = [
  { user: 'Hira Yousaf',   reason: 'Follower count grew 340% in 48 hours with no campaign activity.', violationCount: 1, lastActivityAge: 0, status: 'Under Review' },
  { user: 'ByteCraft',     reason: 'Multiple chargeback attempts on creator escrow payments.',          violationCount: 3, lastActivityAge: 0, status: 'Restricted' },
  { user: 'Omar Farooq',   reason: 'Repeated harassment complaints from multiple brands.',              violationCount: 4, lastActivityAge: 1, status: 'Suspended' },
  { user: 'SkyHigh Airlines', reason: 'Payment activity inconsistent with campaign budgets on file.',  violationCount: 2, lastActivityAge: 0, status: 'Under Review' },
  { user: 'Ahmed Raza',    reason: 'Engagement rate anomaly flagged by automated detection.',           violationCount: 1, lastActivityAge: 2, status: 'Active' },
  { user: 'LearnFast',     reason: 'Escrow release requested before deliverable approval, twice.',      violationCount: 2, lastActivityAge: 1, status: 'Under Review' },
  { user: 'Danial Sheikh', reason: 'Profile details changed 4 times in 30 days; identity mismatch flagged.', violationCount: 2, lastActivityAge: 3, status: 'Under Review' },
  { user: 'Bilal Ahmed',   reason: 'Three spam reports filed by different brands within a week.',       violationCount: 3, lastActivityAge: 4, status: 'Restricted' },
  { user: 'Talha Nadeem',  reason: 'Sudden follower spike with low corresponding engagement.',           violationCount: 1, lastActivityAge: 2, status: 'Active' },
  { user: 'GameVerse',     reason: 'Repeated copyright violation reports on submitted content.',         violationCount: 2, lastActivityAge: 6, status: 'Restricted' },
  { user: 'Noor Fatima',   reason: 'Account flagged for mass-messaging brands with templated pitches.',  violationCount: 1, lastActivityAge: 3, status: 'Active' },
  { user: 'UrbanThreads',  reason: 'Contract terms altered post-acceptance on two campaigns.',           violationCount: 2, lastActivityAge: 5, status: 'Under Review' },
];

export const SUSPICIOUS_ACCOUNTS = SUSPICIOUS_ACCOUNT_SEEDS.map((seed, i) => {
  const rand = seededRandom(1100 + i * 5);
  const base = 25 + seed.violationCount * 12;
  const riskScore = clamp(base + rand() * 14 - 4);
  return {
    id: `ACC-${6000 + i}`,
    ...seed,
    userInfo: userByName(seed.user),
    riskScore,
    riskLevel: riskLevelFor(riskScore),
    lastActivity: daysAgo(seed.lastActivityAge),
  };
});

/* ───────────────────────── Disputes ───────────────────────── */

const DISPUTE_SEEDS = [
  { id: 'DSP-T-7001', type: 'Payment Dispute', creator: 'Zainab Ali', brand: 'ByteCraft', campaign: 'ByteCraft Referral Surge', reason: 'Milestone payment delayed by 14 days beyond agreed terms.', amount: 145000, stage: 'admin_review', age: 5 },
  { id: 'DSP-T-7002', type: 'Contract Dispute', creator: 'Talha Nadeem', brand: 'UrbanThreads', campaign: 'UrbanThreads Street Style UGC', reason: 'Brand requested additional deliverables not in original contract.', amount: 80000, stage: 'negotiation', age: 8 },
  { id: 'DSP-T-7003', type: 'Deliverable Dispute', creator: 'Noor Fatima', brand: 'SkyHigh Airlines', campaign: 'SkyHigh Getaway Deals', reason: 'Brand rejected deliverables citing quality concerns; creator disputes assessment.', amount: 220000, stage: 'evidence_review', age: 2 },
  { id: 'DSP-T-7004', type: 'Campaign Dispute', creator: 'Ahmed Raza', brand: 'ActiveLife', campaign: 'ActiveLife Ambassador Program', reason: 'Disagreement over campaign scope and renewal terms.', amount: 310000, stage: 'opened', age: 1 },
  { id: 'DSP-T-7005', type: 'Content Approval Dispute', creator: 'Fatima Sheikh', brand: 'PureGlow', campaign: 'PureGlow Winter Edit', reason: 'Brand repeatedly requested revisions beyond contracted limit.', amount: 60000, stage: 'negotiation', age: 6 },
  { id: 'DSP-T-7006', type: 'Payment Dispute', creator: 'Hamza Tariq', brand: 'FitZone', campaign: 'Summer Shred Challenge', reason: 'Escrow release blocked pending brand confirmation.', amount: 95000, stage: 'resolved', age: 18 },
  { id: 'DSP-T-7007', type: 'Contract Dispute', creator: 'Danial Sheikh', brand: 'LearnFast', campaign: 'Future Learners Ambassadors', reason: 'Creator claims brand changed payout structure mid-campaign.', amount: 130000, stage: 'admin_review', age: 4 },
  { id: 'DSP-T-7008', type: 'Deliverable Dispute', creator: 'Mehak Raza', brand: 'TasteBite Foods', campaign: 'TasteBite Ramadan Specials', reason: 'Submission count dispute — creator says all deliverables submitted on time.', amount: 70000, stage: 'closed', age: 30 },
];

function genDisputeTimeline(seed) {
  const stageIndex = DISPUTE_STAGE_META.findIndex((s) => s.id === seed.stage);
  return DISPUTE_STAGE_META.slice(0, stageIndex + 1).map((stage, idx) => ({
    ...stage,
    date: daysAgo(Math.max(0, seed.age - idx * 2)),
  }));
}

export const DISPUTES_TS = DISPUTE_SEEDS.map((seed, i) => {
  const rand = seededRandom(1200 + i * 6);
  return {
    ...seed,
    creatorInfo: userByName(seed.creator),
    brandInfo: userByName(seed.brand),
    openedDate: daysAgo(seed.age),
    status: DISPUTE_STAGE_META.find((s) => s.id === seed.stage)?.label ?? 'Opened',
    evidence: [
      'Campaign contract & terms acknowledgement',
      'Deliverable submission timestamps',
      'Payment / escrow ledger entries',
      'Message thread between creator and brand',
    ].slice(0, 2 + Math.floor(rand() * 3)),
    timeline: genDisputeTimeline(seed),
  };
});

/* ───────────────────────── Risk Monitoring ───────────────────────── */

const INDUSTRIES = ['Fashion', 'Beauty', 'Technology', 'Gaming', 'Fitness', 'Travel', 'Education', 'Food', 'Finance'];
const CAMPAIGN_TYPES = ['Product Launch', 'Brand Awareness', 'UGC Campaign', 'Affiliate Campaign', 'Event Promotion', 'Seasonal Campaign', 'Creator Ambassador Program'];
const GEOGRAPHIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];
const USER_CATEGORIES = ['New Creators', 'Verified Creators', 'New Brands', 'Established Brands'];

function buildHeatmap(labels, seedBase) {
  return labels.map((label, i) => {
    const rand = seededRandom(seedBase + i * 17);
    const score = clamp(20 + rand() * 60);
    return { label, riskScore: score, riskLevel: riskLevelFor(score) };
  });
}

export const RISK_HEATMAP = {
  byIndustry: buildHeatmap(INDUSTRIES, 1300),
  byCampaignType: buildHeatmap(CAMPAIGN_TYPES, 1400),
  byGeography: buildHeatmap(GEOGRAPHIES, 1500),
  byUserCategory: buildHeatmap(USER_CATEGORIES, 1600),
};

export const VIOLATION_TREND_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label, violations: buildSeries(8, { base: 64, trend: -0.02, seed: 1701 })[i],
}));

export const REPORT_VOLUME_SERIES = dateLabels(8, 'week').map((label, i) => ({
  label, reports: buildSeries(8, { base: 48, trend: -0.015, seed: 1702 })[i],
}));

export const FRAUD_INCIDENT_SERIES = dateLabels(8, 'week').map((label, i) => ({
  label, incidents: buildSeries(8, { base: 22, trend: -0.01, seed: 1703 })[i],
}));

export const DISPUTE_FREQUENCY_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label, disputes: buildSeries(8, { base: 18, trend: -0.02, seed: 1704 })[i],
}));

export const RESOLUTION_TIME_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label, hours: buildSeries(8, { base: 36, trend: -0.025, volatility: 0.04, seed: 1705 })[i],
}));

/* ───────────────────────── Trust Intelligence ───────────────────────── */

function buildTrustList(pool, seedBase, n = 5) {
  return pool.slice(0, n).map((u, i) => {
    const rand = seededRandom(seedBase + i * 19);
    const trustScore = clamp(78 + rand() * 20);
    const delta = Math.round((rand() * 12 - 2) * 10) / 10;
    return { ...userByName(u.name), trustScore, delta };
  });
}

export const TRUST_INTELLIGENCE = {
  topTrustedCreators: buildTrustList(CREATOR_POOL, 1800, 5).sort((a, b) => b.trustScore - a.trustScore),
  topTrustedBrands: buildTrustList(BRAND_POOL, 1850, 5).sort((a, b) => b.trustScore - a.trustScore),
  mostImproved: [...buildTrustList(CREATOR_POOL.slice(4), 1900, 3), ...buildTrustList(BRAND_POOL.slice(4), 1950, 2)]
    .sort((a, b) => b.delta - a.delta),
};

/* ───────────────────────── AI Insights & Fraud Detection ───────────────────────── */

export const AI_SAFETY_INSIGHTS = [
  { id: 'ai-1', icon: '🚩', category: 'Fraud Trend', impact: 'high', confidence: 91, text: 'Fake engagement reports increased 12% this week, concentrated in the Beauty and Gaming categories.' },
  { id: 'ai-2', icon: '🏢', category: 'Industry', impact: 'medium', confidence: 84, text: 'Technology brands have the lowest dispute rates of any industry on the platform this quarter.' },
  { id: 'ai-3', icon: '📈', category: 'Account Growth', impact: 'high', confidence: 88, text: 'Five creators show suspicious audience growth patterns inconsistent with organic reach.' },
  { id: 'ai-4', icon: '⚖️', category: 'Disputes', impact: 'medium', confidence: 80, text: 'Payment disputes decreased by 18% following the new escrow milestone policy.' },
  { id: 'ai-5', icon: '🤖', category: 'Bot Activity', impact: 'medium', confidence: 77, text: 'Bot-driven engagement attempts on new creator accounts rose 9% over the last 30 days.' },
  { id: 'ai-6', icon: '🛡️', category: 'Platform Health', impact: 'low', confidence: 72, text: 'Overall safety score improved 4 points after the latest moderation policy update.' },
];

export const AI_FRAUD_DETECTION = {
  potentialFraudCases: SUSPICIOUS_ACCOUNTS.filter((a) => a.riskLevel === 'critical' || a.riskLevel === 'high').slice(0, 4),
  likelyRepeatOffenders: SUSPICIOUS_ACCOUNTS.filter((a) => a.violationCount >= 2).slice(0, 4),
  suspiciousGrowthPatterns: FRAUD_ALERTS.filter((a) => a.type === 'Sudden Follower Spike' || a.type === 'Abnormal Engagement Growth').slice(0, 4),
  paymentAbuseRisks: FRAUD_ALERTS.filter((a) => a.type === 'Unusual Payment Activity').slice(0, 4),
};

/* ───────────────────────── Moderator Operations ───────────────────────── */

export const MODERATOR_OPS = MODERATORS.map((mod, i) => {
  const rand = seededRandom(1500 + i * 23);
  const casesAssigned = REPORTS.filter((r) => r.assignedModerator === mod.name).length + Math.floor(rand() * 8) + 4;
  const casesResolved = Math.max(0, casesAssigned - Math.floor(rand() * 4) - 1);
  return {
    ...mod,
    casesAssigned,
    casesResolved,
    avgResolutionHours: Math.round((6 + rand() * 30) * 10) / 10,
    pendingReviews: casesAssigned - casesResolved,
    escalatedCases: Math.floor(rand() * 4),
  };
});

/* ───────────────────────── Global search index ───────────────────────── */

const CAMPAIGN_REFS = [
  'Eid Collection Launch', 'GlowUp Skincare UGC Drive', 'NovaPhone X Awareness', 'PixelPlay Launch Bonus',
  'Summer Shred Challenge', 'Northern Escape Promo', 'Future Learners Ambassadors', 'TasteBite Ramadan Specials',
  'UrbanThreads Street Style UGC', 'PureGlow Winter Edit', 'ByteCraft Referral Surge', 'SkyHigh Getaway Deals',
  'ActiveLife Ambassador Program',
];

export const SEARCH_INDEX = [
  ...[...CREATOR_POOL, ...BRAND_POOL].map((u) => ({ type: 'user', id: u.name, label: u.name, sub: `${userByName(u.name).type} · ${u.handle}` })),
  ...REPORTS.map((r) => ({ type: 'report', id: r.id, label: `${r.category} — ${r.reported}`, sub: `${r.id} · Reported by ${r.reporter}` })),
  ...INVESTIGATIONS.map((c) => ({ type: 'case', id: c.id, label: c.title, sub: `${c.id} · ${INVESTIGATION_STATUS_META[c.status]?.label}` })),
  ...DISPUTES_TS.map((d) => ({ type: 'dispute', id: d.id, label: `${d.type} — ${d.creator} vs ${d.brand}`, sub: `${d.id} · ${d.campaign}` })),
  ...CAMPAIGN_REFS.map((c) => ({ type: 'campaign', id: c, label: c, sub: 'Campaign' })),
  ...MODERATORS.map((m) => ({ type: 'moderator', id: m.id, label: m.name, sub: 'Moderator' })),
];
