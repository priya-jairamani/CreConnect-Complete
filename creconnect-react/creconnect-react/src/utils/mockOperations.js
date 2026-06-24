/**
 * Mock data layer for the Admin "Operations" platform operations command center.
 * Illustrative data only — wire up to dedicated ops/observability endpoints once available.
 */

/* ── Deterministic pseudo-random helpers (stable across re-renders) ── */
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
    if (unit === 'hour') d.setHours(d.getHours() - i);
    if (unit === 'week') d.setDate(d.getDate() - i * 7);
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    out.push(
      unit === 'month'
        ? d.toLocaleDateString('en-US', { month: 'short' })
        : unit === 'hour'
        ? d.toLocaleTimeString('en-US', { hour: 'numeric' })
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
function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}
function clamp(n, min = 1, max = 99) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function genInitials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = ['#6d5cff', '#857fff', '#16b364', '#f59e0b', '#f0445f', '#0ea5e9', '#d946ef', '#10b981', '#f97316', '#6366f1'];

/* ───────────────────────── Operations Health ───────────────────────── */

export const OPS_HEALTH_META = {
  excellent: { label: 'Excellent', variant: 'success', min: 85 },
  healthy:   { label: 'Healthy',   variant: 'brand',   min: 70 },
  warning:   { label: 'Warning',   variant: 'warning', min: 50 },
  critical:  { label: 'Critical',  variant: 'danger',  min: 0 },
};

export function opsHealthStatusFor(score) {
  if (score >= OPS_HEALTH_META.excellent.min) return 'excellent';
  if (score >= OPS_HEALTH_META.healthy.min) return 'healthy';
  if (score >= OPS_HEALTH_META.warning.min) return 'warning';
  return 'critical';
}

export const OPERATIONS_HEALTH_SCORE = 84;

export const OPERATIONS_HEALTH_FACTORS = [
  { id: 'support_response', label: 'Support Response Time', value: 91, detail: 'Avg. 18 min first response' },
  { id: 'investigation_backlog', label: 'Investigation Backlog', value: 76, detail: '14 open investigations' },
  { id: 'unresolved_disputes', label: 'Unresolved Disputes', value: 82, detail: '6 disputes pending' },
  { id: 'pending_approvals', label: 'Pending Approvals', value: 79, detail: '23 approvals queued' },
  { id: 'moderation_queue', label: 'Moderation Queue', value: 88, detail: '31 items in queue' },
  { id: 'system_uptime', label: 'System Uptime', value: 99, detail: '99.97% over 30 days' },
];

export const OPERATIONS_HEALTH_TREND = dateLabels(14, 'day').map((label, i) => ({
  label,
  score: clamp(buildSeries(14, { base: 84, trend: 0.001, volatility: 0.04, seed: 4100 })[i], 50, 99),
}));

/* ───────────────────────── Overview KPIs ───────────────────────── */

export const OVERVIEW_KPIS = [
  { id: 'open_tasks', label: 'Open Tasks', icon: '🗂️', value: 47, prevValue: 53, format: 'number', sparkline: buildSeries(12, { base: 50, trend: -0.01, volatility: 0.12, seed: 4201 }), accent: '#6d5cff' },
  { id: 'escalated_issues', label: 'Escalated Issues', icon: '🚨', value: 8, prevValue: 11, format: 'number', sparkline: buildSeries(12, { base: 10, trend: -0.02, volatility: 0.2, seed: 4202 }), accent: '#f0445f' },
  { id: 'pending_reviews', label: 'Pending Reviews', icon: '🔍', value: 32, prevValue: 28, format: 'number', sparkline: buildSeries(12, { base: 28, trend: 0.015, volatility: 0.1, seed: 4203 }), accent: '#f59e0b' },
  { id: 'support_sla', label: 'Support SLA Compliance', icon: '📟', value: 94.2, prevValue: 92.8, format: 'percent', sparkline: buildSeries(12, { base: 93, trend: 0.002, volatility: 0.02, seed: 4204 }), accent: '#16b364' },
  { id: 'active_moderators', label: 'Active Moderators', icon: '🛡️', value: 14, prevValue: 13, format: 'number', sparkline: buildSeries(12, { base: 13, trend: 0.005, volatility: 0.08, seed: 4205 }), accent: '#0ea5e9' },
  { id: 'active_admins', label: 'Active Admins', icon: '🧑‍💼', value: 9, prevValue: 9, format: 'number', sparkline: buildSeries(12, { base: 9, trend: 0, volatility: 0.05, seed: 4206 }), accent: '#857fff' },
  { id: 'platform_efficiency', label: 'Platform Efficiency Score', icon: '⚡', value: 88.5, prevValue: 85.9, format: 'percent', sparkline: buildSeries(12, { base: 86, trend: 0.004, volatility: 0.03, seed: 4207 }), accent: '#d946ef' },
  { id: 'ai_recommendations', label: 'AI Recommendations', icon: '🤖', value: 16, prevValue: 12, format: 'number', sparkline: buildSeries(12, { base: 12, trend: 0.02, volatility: 0.15, seed: 4208 }), accent: '#10b981' },
];

/* ───────────────────────── Today's Priorities ───────────────────────── */

export const PRIORITY_META = {
  critical: { label: 'Critical', variant: 'danger' },
  high:     { label: 'High',     variant: 'warning' },
  medium:   { label: 'Medium',   variant: 'brand' },
  low:      { label: 'Low',      variant: 'neutral' },
};

export const TODAYS_PRIORITIES = [
  { id: 'pr-1', title: '12 creator verification requests require review.', priority: 'high', impact: 'Onboarding delays for 12 creators', eta: '2 hours', recommendedAction: 'Assign to verification team', category: 'Verification' },
  { id: 'pr-2', title: '3 payment disputes exceed SLA.', priority: 'critical', impact: 'Escrow held funds, brand trust risk', eta: '1 hour', recommendedAction: 'Escalate to finance ops lead', category: 'Payments' },
  { id: 'pr-3', title: '5 campaigns show risk of missing deadlines.', priority: 'high', impact: 'Brand satisfaction risk on 5 campaigns', eta: '4 hours', recommendedAction: 'Notify assigned campaign managers', category: 'Campaigns' },
  { id: 'pr-4', title: '2 brands require manual verification.', priority: 'medium', impact: 'Blocks campaign launches for 2 brands', eta: '3 hours', recommendedAction: 'Assign to compliance reviewer', category: 'Verification' },
  { id: 'pr-5', title: 'Moderation queue grew 22% overnight.', priority: 'medium', impact: 'Slower content review turnaround', eta: '6 hours', recommendedAction: 'Add 2 moderators to queue rotation', category: 'Moderation' },
  { id: 'pr-6', title: '7 support tickets approaching SLA breach.', priority: 'high', impact: 'CSAT risk for affected users', eta: '90 minutes', recommendedAction: 'Auto-assign to available agents', category: 'Support' },
  { id: 'pr-7', title: 'Escrow release approvals backlog at 19.', priority: 'medium', impact: 'Delayed creator payouts', eta: '5 hours', recommendedAction: 'Batch-approve low-risk releases', category: 'Payments' },
];

/* ───────────────────────── Support Hub ───────────────────────── */

export const SUPPORT_CATEGORIES = ['Creator Support', 'Brand Support', 'Payments', 'Campaigns', 'Verification', 'Technical Issues', 'Compliance'];

export const SUPPORT_METRICS = {
  openTickets: 64,
  pendingResponses: 21,
  escalatedCases: 8,
  resolvedToday: 37,
  avgResponseTimeMin: 22,
  csat: 4.6,
};

export const TICKET_STATUS_META = {
  open:        { label: 'Open',        variant: 'brand' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  pending:     { label: 'Pending',     variant: 'neutral' },
  escalated:   { label: 'Escalated',   variant: 'danger' },
  resolved:    { label: 'Resolved',    variant: 'success' },
  closed:      { label: 'Closed',      variant: 'neutral' },
};

export const TICKET_PRIORITY_META = {
  urgent: { label: 'Urgent', variant: 'danger' },
  high:   { label: 'High',   variant: 'warning' },
  medium: { label: 'Medium', variant: 'brand' },
  low:    { label: 'Low',    variant: 'neutral' },
};

export const SLA_META = {
  on_track: { label: 'On Track', variant: 'success' },
  at_risk:  { label: 'At Risk',  variant: 'warning' },
  breached: { label: 'Breached', variant: 'danger' },
};

const AGENTS = ['Hira Malik', 'Bilal Ahmed', 'Sana Tariq', 'Usman Raza', 'Ayesha Khan', 'Omar Farooq'];
const TICKET_USERS = [
  'Zara Ahmed', 'Hamza Sheikh', 'Mahnoor Iqbal', 'Daniyal Qureshi', 'Areeba Hassan', 'Fahad Malik',
  'Sadia Noor', 'Bilawal Khan', 'Nimra Saeed', 'Talha Aziz', 'Komal Rashid', 'Yasir Mehmood',
  'Maira Yousuf', 'Zain Abbas', 'Hina Pervaiz', 'Imran Latif', 'Sarah Niazi', 'Adeel Aslam',
];
const TICKET_SUBJECTS = {
  'Creator Support': ['Cannot update portfolio media', 'Profile verification stuck', 'Payout not received', 'Collaboration request not visible'],
  'Brand Support': ['Campaign not appearing in search', 'Unable to message creator', 'Invoice discrepancy', 'Brand profile verification delay'],
  'Payments': ['Escrow release delayed', 'Duplicate charge on card', 'Refund not processed', 'Payout amount mismatch'],
  'Campaigns': ['Campaign approval pending too long', 'Cannot edit live campaign', 'Deliverable upload failing', 'Campaign budget not updating'],
  'Verification': ['ID verification rejected without reason', 'Re-submission of documents not working', 'Verification badge missing after approval'],
  'Technical Issues': ['App crashes on upload', 'Notifications not arriving', 'Dashboard charts not loading', 'Login OTP not received'],
  'Compliance': ['Content flagged incorrectly', 'Account suspended without explanation', 'GDPR data export request', 'Policy clarification needed'],
};

const TICKET_REASON_TEXT = {
  'Creator Support': 'Creator is unable to complete a routine account action and needs assistance.',
  'Brand Support': 'Brand is experiencing friction with campaign or messaging tools.',
  'Payments': 'A payment, payout, or escrow record appears inconsistent with expectations.',
  'Campaigns': 'A campaign workflow step is blocked or behaving unexpectedly.',
  'Verification': 'Identity or business verification did not complete as expected.',
  'Technical Issues': 'User is reporting a technical defect impacting normal usage.',
  'Compliance': 'Request relates to platform policy, moderation, or data compliance.',
};

function buildTicketHistory(seed, createdIso) {
  const rand = seededRandom(seed);
  const events = ['Ticket created', 'Assigned to agent', 'Agent responded', 'Awaiting customer reply', 'Internal note added'];
  const n = 2 + Math.floor(rand() * 3);
  const out = [{ event: 'Ticket created', date: createdIso }];
  for (let i = 1; i < n; i++) {
    const d = new Date(createdIso);
    d.setHours(d.getHours() + i * (1 + Math.floor(rand() * 4)));
    out.push({ event: pick(rand, events), date: d.toISOString() });
  }
  return out;
}

function buildConversation(seed, user, category, subject, createdIso) {
  const rand = seededRandom(seed);
  const agent = pick(rand, AGENTS);
  const base = new Date(createdIso);
  const msgs = [
    { from: 'user', author: user, text: `Hi, I'm having an issue: ${subject.toLowerCase()}. Could someone help me with this?`, time: base.toISOString() },
  ];
  const agentReply = new Date(base);
  agentReply.setMinutes(agentReply.getMinutes() + 18 + Math.floor(rand() * 40));
  msgs.push({ from: 'agent', author: agent, text: `Thanks for reaching out — I'm looking into this now and will follow up shortly with an update on your ${category.toLowerCase()} issue.`, time: agentReply.toISOString() });
  if (rand() > 0.4) {
    const userReply = new Date(agentReply);
    userReply.setMinutes(userReply.getMinutes() + 25 + Math.floor(rand() * 60));
    msgs.push({ from: 'user', author: user, text: 'Thank you — please let me know as soon as you have an update. This is affecting my work.', time: userReply.toISOString() });
  }
  return { agent, messages: msgs };
}

export const TICKETS = SUPPORT_CATEGORIES.flatMap((category, ci) =>
  Array.from({ length: 3 }, (_, i) => {
    const seed = 4400 + ci * 10 + i;
    const rand = seededRandom(seed);
    const idNum = 10042 + ci * 7 + i;
    const user = TICKET_USERS[(ci * 3 + i) % TICKET_USERS.length];
    const subject = pick(rand, TICKET_SUBJECTS[category]);
    const priority = pick(rand, ['urgent', 'high', 'high', 'medium', 'medium', 'low']);
    const status = pick(rand, ['open', 'in_progress', 'pending', 'escalated', 'resolved', 'resolved', 'closed']);
    const created = daysAgo(Math.floor(rand() * 6));
    const sla = status === 'resolved' || status === 'closed'
      ? 'on_track'
      : pick(rand, ['on_track', 'on_track', 'at_risk', 'breached']);
    const satisfaction = (status === 'resolved' || status === 'closed') ? clamp(3 + rand() * 2, 1, 5) : null;
    const { agent, messages } = buildConversation(seed + 900, user, category, subject, created);
    return {
      id: `TKT-${idNum}`,
      subject,
      user,
      userInitials: genInitials(user),
      userColor: pick(rand, AVATAR_COLORS),
      category,
      priority,
      agent,
      status,
      created,
      sla,
      satisfaction,
      conversation: messages,
      relatedUser: {
        name: user,
        role: ci % 2 === 0 ? 'Creator' : 'Brand',
        joined: daysAgo(120 + Math.floor(rand() * 600)),
        totalTickets: 1 + Math.floor(rand() * 6),
        accountStatus: pick(rand, ['Active', 'Active', 'Under Review']),
      },
      relatedCampaign: ci % 3 !== 2 ? {
        id: `CMP-${2000 + ci * 13 + i}`,
        name: `${pick(rand, ['Summer', 'Festive', 'Launch', 'Ramadan', 'Back-to-School'])} ${pick(rand, ['Glow', 'Drop', 'Edit', 'Series', 'Collab'])}`,
        status: pick(rand, ['Active', 'In Review', 'Completed']),
      } : null,
      history: buildTicketHistory(seed + 500, created),
      notes: rand() > 0.5 ? [{ author: agent, text: 'Reviewed account history — no prior similar issues found.', date: daysAgo(Math.floor(rand() * 2)) }] : [],
      aiSuggestions: {
        suggestedReply: `Hi ${user.split(' ')[0]}, thanks for your patience. ${TICKET_REASON_TEXT[category]} We've identified the root cause and are applying a fix — you should see this resolved within the next few hours. We'll follow up to confirm.`,
        resolutionSummary: `${category} issue related to "${subject}" — root cause identified, fix in progress, customer notified.`,
        escalationRecommendation: priority === 'urgent' || sla === 'breached'
          ? 'Escalate to Tier 2 — SLA risk and customer impact warrant priority handling.'
          : 'No escalation needed — standard resolution path is sufficient.',
        relatedCases: [`TKT-${idNum - 37}`, `TKT-${idNum - 12}`].filter(() => idNum - 37 > 10000),
        riskAssessment: priority === 'urgent' ? 'high' : (sla === 'at_risk' ? 'medium' : 'low'),
      },
    };
  })
);

export const TICKET_FILTERS = [
  { key: 'category', label: 'Category', options: ['All', ...SUPPORT_CATEGORIES] },
  { key: 'priority', label: 'Priority', options: ['All', ...Object.keys(TICKET_PRIORITY_META)] },
  { key: 'status', label: 'Status', options: ['All', ...Object.keys(TICKET_STATUS_META)] },
  { key: 'sla', label: 'SLA', options: ['All', ...Object.keys(SLA_META)] },
];

export const TICKET_BULK_ACTIONS = [
  { id: 'assign', label: 'Assign to Agent', icon: '🧑‍💻' },
  { id: 'escalate', label: 'Escalate', icon: '🚨' },
  { id: 'resolve', label: 'Mark Resolved', icon: '✅' },
  { id: 'export', label: 'Export Tickets', icon: '⬇' },
];

/* ───────────────────────── Activity Intelligence ───────────────────────── */

export const ACTIVITY_TYPE_META = {
  registration:     { label: 'User Registration',  icon: '👤', variant: 'brand' },
  campaign_launch:  { label: 'Campaign Launch',     icon: '📣', variant: 'success' },
  payment:          { label: 'Payment',             icon: '💳', variant: 'success' },
  report:           { label: 'Report Filed',        icon: '🚩', variant: 'danger' },
  verification:     { label: 'Verification',        icon: '🪪', variant: 'brand' },
  moderation:       { label: 'Moderation Action',   icon: '🛡️', variant: 'warning' },
  settings_change:  { label: 'Settings Change',     icon: '⚙️', variant: 'neutral' },
  system_event:     { label: 'System Event',        icon: '🖥️', variant: 'neutral' },
};

const ACTIVITY_ACTORS = {
  registration: ['New Creator', 'New Brand'],
  campaign_launch: ['Glow Cosmetics', 'Nova Tech', 'Urban Threads', 'FitFuel', 'Travique'],
  payment: ['Payment Gateway', 'Escrow System'],
  report: ['Zara Ahmed', 'Hamza Sheikh', 'Sadia Noor'],
  verification: ['Verification Team', 'AI Verification'],
  moderation: ['Hira Malik', 'Bilal Ahmed', 'Sana Tariq'],
  settings_change: ['Admin: Omar Farooq', 'Admin: Ayesha Khan'],
  system_event: ['System Monitor', 'Deployment Bot'],
};

const ACTIVITY_DESC = {
  registration: ['New creator account created', 'New brand account created'],
  campaign_launch: ['Launched a new campaign', 'Published campaign for review'],
  payment: ['Processed creator payout', 'Released escrow funds', 'Captured brand payment'],
  report: ['Filed a content report', 'Reported a user for policy violation'],
  verification: ['Completed identity verification', 'Approved brand verification'],
  moderation: ['Removed flagged content', 'Issued a warning to user', 'Suspended an account'],
  settings_change: ['Updated platform fee settings', 'Modified role permissions'],
  system_event: ['Deployed new release', 'Completed scheduled backup', 'Rotated API credentials'],
};

export const ACTIVITY_STREAM = Array.from({ length: 26 }, (_, i) => {
  const rand = seededRandom(4500 + i);
  const type = pick(rand, Object.keys(ACTIVITY_TYPE_META));
  return {
    id: `ACT-${9000 + i}`,
    type,
    actor: pick(rand, ACTIVITY_ACTORS[type]),
    description: pick(rand, ACTIVITY_DESC[type]),
    timestamp: hoursAgo(Math.floor(rand() * 72)),
  };
}).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

export const ACTIVITY_ANALYTICS = {
  platformActivity: dateLabels(14, 'day').map((label, i) => ({ label, value: buildSeries(14, { base: 420, trend: 0.01, volatility: 0.12, seed: 4601 })[i] })),
  adminActivity: dateLabels(14, 'day').map((label, i) => ({ label, value: buildSeries(14, { base: 38, trend: 0.005, volatility: 0.15, seed: 4602 })[i] })),
  moderatorActivity: dateLabels(14, 'day').map((label, i) => ({ label, value: buildSeries(14, { base: 56, trend: 0.012, volatility: 0.14, seed: 4603 })[i] })),
  campaignActivity: dateLabels(14, 'day').map((label, i) => ({ label, value: buildSeries(14, { base: 24, trend: 0.02, volatility: 0.18, seed: 4604 })[i] })),
  paymentActivity: dateLabels(14, 'day').map((label, i) => ({ label, value: buildSeries(14, { base: 180, trend: 0.008, volatility: 0.1, seed: 4605 })[i] })),
};

export const OPERATIONAL_INSIGHTS = {
  mostActiveAdmin: { name: 'Ayesha Khan', initials: 'AK', color: '#6d5cff', metric: '142 actions this week' },
  mostProductiveModerator: { name: 'Bilal Ahmed', initials: 'BA', color: '#16b364', metric: '96 items reviewed this week' },
  highestTicketVolumeCategory: { name: 'Payments', metric: '28% of all open tickets' },
  mostCommonUserIssue: { name: 'Escrow release delayed', metric: '19 occurrences this week' },
  fastestResolutionTeam: { name: 'Verification Team', metric: 'Avg. 38 min resolution time' },
};

export const ADMIN_PERFORMANCE = [
  { id: 'adm-1', name: 'Ayesha Khan', initials: 'AK', color: '#6d5cff', role: 'Admin', casesResolved: 58, ticketsClosed: 41, investigationsCompleted: 9, responseTimeMin: 14, accuracyPct: 98 },
  { id: 'adm-2', name: 'Omar Farooq', initials: 'OF', color: '#857fff', role: 'Admin', casesResolved: 49, ticketsClosed: 37, investigationsCompleted: 7, responseTimeMin: 19, accuracyPct: 96 },
  { id: 'mod-1', name: 'Bilal Ahmed', initials: 'BA', color: '#16b364', role: 'Moderator', casesResolved: 96, ticketsClosed: 12, investigationsCompleted: 4, responseTimeMin: 9, accuracyPct: 99 },
  { id: 'mod-2', name: 'Sana Tariq', initials: 'ST', color: '#0ea5e9', role: 'Moderator', casesResolved: 84, ticketsClosed: 18, investigationsCompleted: 6, responseTimeMin: 11, accuracyPct: 97 },
  { id: 'sup-1', name: 'Hira Malik', initials: 'HM', color: '#f59e0b', role: 'Support Agent', casesResolved: 31, ticketsClosed: 52, investigationsCompleted: 2, responseTimeMin: 16, accuracyPct: 95 },
  { id: 'sup-2', name: 'Usman Raza', initials: 'UR', color: '#f0445f', role: 'Support Agent', casesResolved: 27, ticketsClosed: 46, investigationsCompleted: 1, responseTimeMin: 21, accuracyPct: 93 },
  { id: 'ver-1', name: 'Komal Rashid', initials: 'KR', color: '#d946ef', role: 'Verification Team', casesResolved: 39, ticketsClosed: 9, investigationsCompleted: 14, responseTimeMin: 8, accuracyPct: 99 },
];

/* ───────────────────────── System Health ───────────────────────── */

export const SERVICE_STATUS_META = {
  operational: { label: 'Operational', variant: 'success' },
  degraded:    { label: 'Degraded',    variant: 'warning' },
  warning:     { label: 'Warning',     variant: 'warning' },
  critical:    { label: 'Critical',    variant: 'danger' },
  offline:     { label: 'Offline',     variant: 'danger' },
};

export const SERVICES = [
  { id: 'api', name: 'API Server', icon: '🌐', status: 'operational', uptimePct: 99.98, responseMs: 142 },
  { id: 'database', name: 'Database', icon: '🗄️', status: 'operational', uptimePct: 99.99, responseMs: 38 },
  { id: 'redis', name: 'Redis', icon: '🧠', status: 'operational', uptimePct: 99.97, responseMs: 4 },
  { id: 'socket', name: 'Socket Server', icon: '🔌', status: 'degraded', uptimePct: 99.42, responseMs: 310 },
  { id: 'storage', name: 'Storage', icon: '📦', status: 'operational', uptimePct: 99.99, responseMs: 88 },
  { id: 'email', name: 'Email Service', icon: '✉️', status: 'warning', uptimePct: 98.7, responseMs: 540 },
  { id: 'payment_gateway', name: 'Payment Gateway', icon: '💳', status: 'operational', uptimePct: 99.95, responseMs: 210 },
  { id: 'notifications', name: 'Notification Service', icon: '🔔', status: 'operational', uptimePct: 99.9, responseMs: 96 },
  { id: 'search', name: 'Search Engine', icon: '🔍', status: 'operational', uptimePct: 99.96, responseMs: 64 },
  { id: 'ai_services', name: 'AI Services', icon: '🤖', status: 'critical', uptimePct: 97.8, responseMs: 920 },
];

export const SYSTEM_METRICS = [
  { id: 'api_response', label: 'API Response Time', value: 142, unit: 'ms', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: buildSeries(12, { base: 140, trend: 0.002, volatility: 0.15, seed: 4701 })[i] })) },
  { id: 'error_rate', label: 'Error Rate', value: 0.34, unit: '%', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: buildSeries(12, { base: 0.4, trend: -0.01, volatility: 0.3, seed: 4702 })[i] / 100 * 100 })) },
  { id: 'cpu_usage', label: 'CPU Usage', value: 62, unit: '%', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: clamp(buildSeries(12, { base: 60, trend: 0.005, volatility: 0.12, seed: 4703 })[i], 20, 95) })) },
  { id: 'memory_usage', label: 'Memory Usage', value: 71, unit: '%', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: clamp(buildSeries(12, { base: 68, trend: 0.004, volatility: 0.08, seed: 4704 })[i], 30, 95) })) },
  { id: 'db_queries', label: 'Database Queries', value: 18400, unit: '/min', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: buildSeries(12, { base: 18000, trend: 0.01, volatility: 0.12, seed: 4705 })[i] })) },
  { id: 'active_connections', label: 'Active Connections', value: 3260, unit: '', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: buildSeries(12, { base: 3100, trend: 0.012, volatility: 0.1, seed: 4706 })[i] })) },
  { id: 'queue_length', label: 'Queue Length', value: 86, unit: 'jobs', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: buildSeries(12, { base: 80, trend: 0.02, volatility: 0.25, seed: 4707 })[i] })) },
  { id: 'storage_utilization', label: 'Storage Utilization', value: 68, unit: '%', series: dateLabels(12, 'hour').map((label, i) => ({ label, value: clamp(buildSeries(12, { base: 66, trend: 0.003, volatility: 0.03, seed: 4708 })[i], 50, 90) })) },
];

export const INCIDENT_SEVERITY_META = {
  sev1: { label: 'SEV-1 Critical', variant: 'danger' },
  sev2: { label: 'SEV-2 High',     variant: 'warning' },
  sev3: { label: 'SEV-3 Moderate', variant: 'brand' },
  sev4: { label: 'SEV-4 Low',      variant: 'neutral' },
};

export const INCIDENT_STATUS_META = {
  open:     { label: 'Open',     variant: 'danger' },
  resolved: { label: 'Resolved', variant: 'success' },
};

export const INCIDENT_STAGES = ['Detected', 'Assigned', 'Investigating', 'Mitigated', 'Resolved'];

function buildIncidentTimeline(stagesCompleted, baseIso) {
  const base = new Date(baseIso);
  return INCIDENT_STAGES.map((stage, i) => {
    if (i >= stagesCompleted) return { stage, date: null, completed: false };
    const d = new Date(base);
    d.setMinutes(d.getMinutes() + i * (12 + i * 6));
    return { stage, date: d.toISOString(), completed: true };
  });
}

export const INCIDENTS = [
  { id: 'INC-501', title: 'AI Services elevated latency', severity: 'sev1', status: 'open', service: 'AI Services', detectedAt: hoursAgo(2), resolvedAt: null, stagesCompleted: 3, postmortem: null },
  { id: 'INC-500', title: 'Email delivery delays for verification OTPs', severity: 'sev2', status: 'open', service: 'Email Service', detectedAt: hoursAgo(6), resolvedAt: null, stagesCompleted: 2, postmortem: null },
  { id: 'INC-499', title: 'Socket server reconnect storms', severity: 'sev2', status: 'open', service: 'Socket Server', detectedAt: hoursAgo(10), resolvedAt: null, stagesCompleted: 4, postmortem: null },
  { id: 'INC-498', title: 'Payment gateway intermittent timeouts', severity: 'sev1', status: 'resolved', service: 'Payment Gateway', detectedAt: daysAgo(1), resolvedAt: hoursAgo(20), stagesCompleted: 5, postmortem: 'Root cause: upstream provider rate limiting during peak load. Mitigated by adding request queuing and retry backoff. Provider has increased our rate limit.' },
  { id: 'INC-497', title: 'Search indexing lag for new campaigns', severity: 'sev3', status: 'resolved', service: 'Search Engine', detectedAt: daysAgo(2), resolvedAt: daysAgo(2), stagesCompleted: 5, postmortem: 'Root cause: indexing worker backlog after deploy. Mitigated by scaling workers and re-indexing affected records.' },
  { id: 'INC-496', title: 'Elevated database query times during backup', severity: 'sev3', status: 'resolved', service: 'Database', detectedAt: daysAgo(3), resolvedAt: daysAgo(3), stagesCompleted: 5, postmortem: 'Root cause: backup job competing for I/O during peak hours. Mitigated by rescheduling backups to off-peak window.' },
  { id: 'INC-495', title: 'Notification delivery failures (push)', severity: 'sev4', status: 'resolved', service: 'Notification Service', detectedAt: daysAgo(4), resolvedAt: daysAgo(4), stagesCompleted: 5, postmortem: 'Root cause: expired push credential. Mitigated by rotating credentials and adding expiry alerts.' },
  { id: 'INC-494', title: 'Storage upload errors for large video files', severity: 'sev2', status: 'resolved', service: 'Storage', detectedAt: daysAgo(5), resolvedAt: daysAgo(5), stagesCompleted: 5, postmortem: 'Root cause: file size limit misconfiguration after provider update. Mitigated by correcting upload limits and adding monitoring.' },
].map((inc) => ({ ...inc, timeline: buildIncidentTimeline(inc.stagesCompleted, inc.detectedAt) }));

/* ───────────────────────── AI Operations Copilot ───────────────────────── */

export const AI_HEALTH_SUMMARY = {
  score: 84,
  status: 'healthy',
  summary: 'Platform operations are healthy overall. AI Services incident and a growing verification backlog are the top risks to watch over the next 24-48 hours.',
  trend: dateLabels(7, 'day').map((label, i) => ({ label, score: clamp(buildSeries(7, { base: 84, trend: 0.002, volatility: 0.03, seed: 4801 })[i], 60, 99) })),
};

export const AI_INSIGHTS = [
  { id: 'ai-ins-1', icon: '📈', category: 'Approvals', impact: 'high', confidence: 91, text: 'Campaign approval queue increased 18% week-over-week — consider reallocating reviewers.' },
  { id: 'ai-ins-2', icon: '✨', category: 'Growth', impact: 'medium', confidence: 87, text: 'Fashion category shows unusually high growth in new campaign submissions this month.' },
  { id: 'ai-ins-3', icon: '⏱️', category: 'Brand Support', impact: 'medium', confidence: 83, text: 'Brand response times are declining — average first response is up 26% vs. last week.' },
  { id: 'ai-ins-4', icon: '🪪', category: 'Verification', impact: 'high', confidence: 94, text: 'Creator verification backlog will exceed SLA within 3 days at current intake rate.' },
  { id: 'ai-ins-5', icon: '💳', category: 'Payments', impact: 'medium', confidence: 88, text: 'Escrow release approval time has improved 14% following automation rollout.' },
  { id: 'ai-ins-6', icon: '🛡️', category: 'Moderation', impact: 'low', confidence: 79, text: 'Moderation accuracy remains stable at 97-99% across active moderators.' },
];

export const AI_PREDICTIONS = {
  supportTicketVolume: buildForecast(420, 0.015, 4901),
  verificationQueueGrowth: buildForecast(58, 0.04, 4902),
  fraudCases: buildForecast(6, 0.01, 4903),
  campaignDelays: buildForecast(11, 0.02, 4904),
  revenueTrends: buildForecast(8_400_000, 0.018, 4905),
  platformLoad: buildForecast(72, 0.006, 4906),
};

function buildForecast(base, trend, seed) {
  const totalPoints = 9;
  const historyPoints = 6;
  const series = buildSeries(totalPoints, { base, trend, volatility: 0.08, seed });
  return dateLabels(totalPoints, 'day').map((label, i) => ({
    label,
    actual: i < historyPoints ? series[i] : null,
    forecast: i >= historyPoints - 1 ? series[i] : null,
  }));
}

export const AI_ANOMALY_META = {
  traffic_spike: { label: 'Traffic Spikes', icon: '📈', variant: 'warning' },
  unusual_signups: { label: 'Unusual Signups', icon: '👥', variant: 'warning' },
  suspicious_payment: { label: 'Suspicious Payment Activity', icon: '💳', variant: 'danger' },
  campaign_abuse: { label: 'Campaign Abuse', icon: '📣', variant: 'danger' },
  abnormal_behavior: { label: 'Abnormal User Behavior', icon: '🧭', variant: 'warning' },
  verification_fraud: { label: 'Verification Fraud', icon: '🪪', variant: 'danger' },
};

export const AI_ANOMALIES = [
  { id: 'anom-1', type: 'traffic_spike', title: 'Traffic spike on /campaigns endpoint', description: 'Request volume up 240% over 30 minutes, originating mostly from mobile clients.', detectedAt: hoursAgo(1) },
  { id: 'anom-2', type: 'unusual_signups', title: 'Unusual signup pattern from single IP range', description: '34 creator signups from the same IP block within 20 minutes.', detectedAt: hoursAgo(3) },
  { id: 'anom-3', type: 'suspicious_payment', title: 'Multiple failed payment attempts on one account', description: '7 failed payment attempts followed by a successful charge using a new card.', detectedAt: hoursAgo(5) },
  { id: 'anom-4', type: 'campaign_abuse', title: 'Campaign repeatedly resubmitted after rejection', description: 'Same campaign content resubmitted 4 times with minor text changes.', detectedAt: hoursAgo(9) },
  { id: 'anom-5', type: 'abnormal_behavior', title: 'Account accessed from 5 countries in 24 hours', description: 'Login activity pattern inconsistent with prior behavior for this account.', detectedAt: hoursAgo(14) },
  { id: 'anom-6', type: 'verification_fraud', title: 'Duplicate ID document detected across accounts', description: 'Same government ID document hash submitted by two different accounts.', detectedAt: hoursAgo(20) },
];

export const AI_AUTOMATIONS = [
  { id: 'auto-1', name: 'Auto Assign Tickets', description: 'Automatically assigns new support tickets to the least-loaded available agent.', category: 'Support', status: 'active', runsToday: 41 },
  { id: 'auto-2', name: 'Auto Escalate High Risk Cases', description: 'Escalates cases flagged with high fraud or dispute risk scores to senior staff.', category: 'Risk', status: 'active', runsToday: 6 },
  { id: 'auto-3', name: 'Auto Flag Suspicious Accounts', description: 'Flags accounts matching anomaly detection patterns for manual review.', category: 'Risk', status: 'active', runsToday: 9 },
  { id: 'auto-4', name: 'Auto Verify Low Risk Users', description: 'Automatically approves identity verification for users with low risk scores and complete documentation.', category: 'Verification', status: 'active', runsToday: 27 },
  { id: 'auto-5', name: 'Auto Generate Reports', description: 'Generates and emails daily operations summary reports to leadership.', category: 'Reporting', status: 'active', runsToday: 1 },
  { id: 'auto-6', name: 'Auto Notify Teams', description: 'Sends Slack/email notifications to relevant teams when SLA thresholds are breached.', category: 'Notifications', status: 'paused', runsToday: 0 },
];

export const AI_RECOMMENDED_ACTIONS = [
  { id: 'rec-1', title: 'Reassign 8 verification requests to free reviewers', confidence: 92, impact: 'high', timeSavedHours: 3.5, suggestedAction: 'Assign', category: 'Verification' },
  { id: 'rec-2', title: 'Auto-resolve 5 low-risk payment disputes with refunds', confidence: 88, impact: 'medium', timeSavedHours: 2, suggestedAction: 'Approve', category: 'Payments' },
  { id: 'rec-3', title: 'Escalate INC-501 (AI Services) to on-call engineer', confidence: 95, impact: 'high', timeSavedHours: 1, suggestedAction: 'Escalate', category: 'System Health' },
  { id: 'rec-4', title: 'Schedule moderation queue review for tomorrow 9am', confidence: 81, impact: 'medium', timeSavedHours: 1.5, suggestedAction: 'Schedule', category: 'Moderation' },
  { id: 'rec-5', title: 'Generate weekly operations report for leadership', confidence: 97, impact: 'low', timeSavedHours: 0.5, suggestedAction: 'Approve', category: 'Reporting' },
  { id: 'rec-6', title: 'Dismiss low-confidence anomaly on account #4821', confidence: 64, impact: 'low', timeSavedHours: 0.25, suggestedAction: 'Dismiss', category: 'Risk' },
];

/* ───────────────────────── Operations Workload ───────────────────────── */

export const OPERATIONS_WORKLOAD = [
  { id: 'moderation', label: 'Moderation Queue', count: 31, capacity: 50, trend: 'up' },
  { id: 'verification', label: 'Verification Queue', count: 23, capacity: 40, trend: 'up' },
  { id: 'support', label: 'Support Queue', count: 64, capacity: 80, trend: 'down' },
  { id: 'investigation', label: 'Investigation Queue', count: 14, capacity: 25, trend: 'flat' },
  { id: 'dispute', label: 'Dispute Queue', count: 9, capacity: 20, trend: 'down' },
];

/* ───────────────────────── Team Productivity ───────────────────────── */

export const TEAM_PRODUCTIVITY = {
  admins: [
    { name: 'Ayesha Khan', initials: 'AK', color: '#6d5cff', efficiency: 96, resolutionTimeMin: 14, casesClosed: 58, qualityScore: 98 },
    { name: 'Omar Farooq', initials: 'OF', color: '#857fff', efficiency: 91, resolutionTimeMin: 19, casesClosed: 49, qualityScore: 96 },
  ],
  moderators: [
    { name: 'Bilal Ahmed', initials: 'BA', color: '#16b364', efficiency: 98, resolutionTimeMin: 9, casesClosed: 96, qualityScore: 99 },
    { name: 'Sana Tariq', initials: 'ST', color: '#0ea5e9', efficiency: 94, resolutionTimeMin: 11, casesClosed: 84, qualityScore: 97 },
  ],
  supportAgents: [
    { name: 'Hira Malik', initials: 'HM', color: '#f59e0b', efficiency: 90, resolutionTimeMin: 16, casesClosed: 52, qualityScore: 95 },
    { name: 'Usman Raza', initials: 'UR', color: '#f0445f', efficiency: 86, resolutionTimeMin: 21, casesClosed: 46, qualityScore: 93 },
  ],
  verificationTeam: [
    { name: 'Komal Rashid', initials: 'KR', color: '#d946ef', efficiency: 99, resolutionTimeMin: 8, casesClosed: 39, qualityScore: 99 },
    { name: 'Talha Aziz', initials: 'TA', color: '#10b981', efficiency: 93, resolutionTimeMin: 12, casesClosed: 31, qualityScore: 96 },
  ],
};

/* ───────────────────────── Knowledge Center ───────────────────────── */

export const KNOWLEDGE_TYPE_META = {
  guide: { label: 'Guide', icon: '📘', variant: 'brand' },
  policy: { label: 'Policy', icon: '📋', variant: 'neutral' },
  sop: { label: 'SOP', icon: '🧭', variant: 'success' },
  playbook: { label: 'Playbook', icon: '📕', variant: 'warning' },
};

export const KNOWLEDGE_ITEMS = [
  { id: 'kb-1', title: 'Creator Verification Review Guide', type: 'guide', category: 'Verification', updatedAt: daysAgo(3), summary: 'Step-by-step checklist for reviewing creator identity and portfolio submissions.' },
  { id: 'kb-2', title: 'Payment Dispute Resolution SOP', type: 'sop', category: 'Payments', updatedAt: daysAgo(7), summary: 'Standard procedure for investigating and resolving payment disputes within SLA.' },
  { id: 'kb-3', title: 'Content Moderation Policy', type: 'policy', category: 'Moderation', updatedAt: daysAgo(14), summary: 'Defines prohibited content categories and escalation thresholds for moderators.' },
  { id: 'kb-4', title: 'Incident Response Playbook', type: 'playbook', category: 'System Health', updatedAt: daysAgo(2), summary: 'Runbook for triaging, communicating, and resolving production incidents.' },
  { id: 'kb-5', title: 'Brand Onboarding & Verification Guide', type: 'guide', category: 'Verification', updatedAt: daysAgo(10), summary: 'Process for verifying brand legitimacy before campaign launch approval.' },
  { id: 'kb-6', title: 'Escalation Matrix & On-Call Policy', type: 'policy', category: 'Operations', updatedAt: daysAgo(5), summary: 'Defines who is notified for each severity level and response time targets.' },
  { id: 'kb-7', title: 'Support Tone & Response Playbook', type: 'playbook', category: 'Support', updatedAt: daysAgo(1), summary: 'Guidelines for tone, empathy, and structure in customer support replies.' },
  { id: 'kb-8', title: 'Fraud & Abuse Investigation SOP', type: 'sop', category: 'Risk', updatedAt: daysAgo(6), summary: 'Procedure for investigating suspicious accounts, payments, and campaign abuse.' },
  { id: 'kb-9', title: 'Data Privacy & GDPR Request Policy', type: 'policy', category: 'Compliance', updatedAt: daysAgo(20), summary: 'Handling user data export and deletion requests within regulatory timelines.' },
  { id: 'kb-10', title: 'Campaign Approval Quality Checklist', type: 'guide', category: 'Campaigns', updatedAt: daysAgo(4), summary: 'Quality bar and checklist used when reviewing campaigns for approval.' },
];

/* ───────────────────────── Global search & filters ───────────────────────── */

export const SEARCH_INDEX = [
  ...TICKETS.map((t) => ({ type: 'ticket', id: t.id, label: `${t.id} · ${t.subject}`, sub: `${t.category} · ${t.user}` })),
  ...INCIDENTS.map((i) => ({ type: 'incident', id: i.id, label: `${i.id} · ${i.title}`, sub: `${i.service} · ${INCIDENT_SEVERITY_META[i.severity].label}` })),
  ...ADMIN_PERFORMANCE.map((a) => ({ type: 'admin', id: a.id, label: a.name, sub: a.role })),
  ...ACTIVITY_STREAM.slice(0, 10).map((a) => ({ type: 'activity', id: a.id, label: a.description, sub: `${a.actor} · ${ACTIVITY_TYPE_META[a.type].label}` })),
  ...KNOWLEDGE_ITEMS.map((k) => ({ type: 'report', id: k.id, label: k.title, sub: `${KNOWLEDGE_TYPE_META[k.type].label} · ${k.category}` })),
];

export const ADVANCED_FILTERS = {
  priority: ['All', 'Critical', 'High', 'Medium', 'Low'],
  severity: ['All', 'SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'],
  team: ['All', 'Admins', 'Moderators', 'Support Agents', 'Verification Team'],
  status: ['All', 'Open', 'In Progress', 'Resolved', 'Closed'],
  category: ['All', ...SUPPORT_CATEGORIES],
};

export const QUICK_ACTIONS = [
  { id: 'create_incident', icon: '🚨', label: 'Create Incident' },
  { id: 'assign_ticket', icon: '🧑‍💻', label: 'Assign Ticket' },
  { id: 'review_queue', icon: '🗂️', label: 'Review Queue' },
  { id: 'generate_report', icon: '📄', label: 'Generate Report' },
  { id: 'run_ai_analysis', icon: '🤖', label: 'Run AI Analysis' },
  { id: 'broadcast_alert', icon: '📢', label: 'Broadcast Alert' },
];
