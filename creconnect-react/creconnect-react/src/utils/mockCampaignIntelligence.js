/**
 * Mock data layer for the Admin "Campaign Operations & Intelligence" page.
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

/* ───────────────────────── Overview KPIs ───────────────────────── */

export const OVERVIEW_KPIS = [
  { id: 'totalCampaigns',   label: 'Total Campaigns',         icon: '📋', value: 486,   prevValue: 452,  format: 'number',  sparkline: buildSeries(14, { base: 450,  trend: 0.006, seed: 101 }), accent: '#6d5cff' },
  { id: 'activeCampaigns',  label: 'Active Campaigns',        icon: '🚀', value: 142,   prevValue: 128,  format: 'number',  sparkline: buildSeries(14, { base: 125,  trend: 0.008, seed: 102 }), accent: '#857fff' },
  { id: 'completedCampaigns', label: 'Completed Campaigns',   icon: '✅', value: 298,   prevValue: 271,  format: 'number',  sparkline: buildSeries(14, { base: 270,  trend: 0.007, seed: 103 }), accent: '#16b364' },
  { id: 'successRate',     label: 'Campaign Success Rate',   icon: '🎯', value: 87.4,  prevValue: 84.1, format: 'percent', sparkline: buildSeries(14, { base: 84,   trend: 0.003, seed: 104 }), accent: '#22c1ff' },
  { id: 'avgROI',           label: 'Average Campaign ROI',    icon: '📈', value: 246,   prevValue: 221,  format: 'percent', sparkline: buildSeries(14, { base: 220,  trend: 0.008, seed: 105 }), accent: '#f59e0b' },
  { id: 'totalBudget',      label: 'Total Campaign Budget',   icon: '💰', value: 184500000, prevValue: 162300000, format: 'pkr', sparkline: buildSeries(14, { base: 160000000, trend: 0.009, seed: 106 }), accent: '#4c2dd1' },
  { id: 'creatorParticipation', label: 'Creator Participation Rate', icon: '✦', value: 73.2, prevValue: 68.9, format: 'percent', sparkline: buildSeries(14, { base: 68, trend: 0.005, seed: 107 }), accent: '#f0445f' },
  { id: 'brandRetention',   label: 'Brand Retention Rate',    icon: '🏢', value: 91.6,  prevValue: 89.2, format: 'percent', sparkline: buildSeries(14, { base: 89, trend: 0.002, seed: 108 }), accent: '#16b364' },
];

/* ───────────────────────── Meta lookups ───────────────────────── */

export const HEALTH_META = {
  excellent: { label: 'Excellent', variant: 'success', min: 85 },
  healthy:   { label: 'Healthy',   variant: 'brand',   min: 70 },
  warning:   { label: 'Warning',   variant: 'warning', min: 50 },
  critical:  { label: 'Critical',  variant: 'danger',  min: 0 },
};

export function healthStatusFor(score) {
  if (score >= HEALTH_META.excellent.min) return 'excellent';
  if (score >= HEALTH_META.healthy.min) return 'healthy';
  if (score >= HEALTH_META.warning.min) return 'warning';
  return 'critical';
}

export const RISK_META = {
  low:      { label: 'Low Risk',      variant: 'success' },
  medium:   { label: 'Medium Risk',   variant: 'brand' },
  high:     { label: 'High Risk',     variant: 'warning' },
  critical: { label: 'Critical Risk', variant: 'danger' },
};

export const STATUS_META = {
  active:    { label: 'Active',    variant: 'success' },
  paused:    { label: 'Paused',    variant: 'warning' },
  completed: { label: 'Completed', variant: 'brand' },
  flagged:   { label: 'Flagged',   variant: 'danger' },
  draft:     { label: 'Draft',     variant: 'neutral' },
  archived:  { label: 'Archived',  variant: 'neutral' },
};

export const PIPELINE_STAGE_META = [
  { id: 'draft',        label: 'Draft' },
  { id: 'published',    label: 'Published' },
  { id: 'applications',  label: 'Applications Received' },
  { id: 'selected',     label: 'Creator Selected' },
  { id: 'in_progress',  label: 'In Progress' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'completed',    label: 'Completed' },
  { id: 'archived',     label: 'Archived' },
];

export const INDUSTRIES = ['Fashion', 'Beauty', 'Technology', 'Gaming', 'Fitness', 'Travel', 'Education', 'Food', 'Finance'];

export const TEMPLATE_TYPES = [
  'Product Launch', 'Brand Awareness', 'UGC Campaign', 'Affiliate Campaign',
  'Event Promotion', 'Seasonal Campaign', 'Creator Ambassador Program',
];

export const FILTER_OPTIONS = {
  status: ['All Statuses', 'Active', 'Paused', 'Completed', 'Flagged', 'Draft', 'Archived'],
  industry: ['All Industries', ...INDUSTRIES],
  budget: ['Any Budget', 'Under 250K', '250K - 750K', '750K - 1.5M', 'Over 1.5M'],
  type: ['All Types', ...TEMPLATE_TYPES],
  creatorCount: ['Any Size', '1-3 Creators', '4-8 Creators', '9-15 Creators', '16+ Creators'],
  risk: ['All Risk Levels', 'Low', 'Medium', 'High', 'Critical'],
  performance: ['Any Performance', 'Below 50', '50-70', '70-85', '85+'],
};

/* ───────────────────────── Creator pool ───────────────────────── */

const CREATOR_POOL = [
  { name: 'Ayesha Khan',   handle: '@ayeshakhan',   color: '#6d5cff' },
  { name: 'Bilal Ahmed',   handle: '@bilaltravels', color: '#22c1ff' },
  { name: 'Sara Malik',    handle: '@sara.glows',   color: '#f0445f' },
  { name: 'Hamza Tariq',   handle: '@hamzafitness', color: '#16b364' },
  { name: 'Mehak Raza',    handle: '@mehakeats',    color: '#f59e0b' },
  { name: 'Omar Farooq',   handle: '@omargamez',    color: '#4c2dd1' },
  { name: 'Fatima Sheikh', handle: '@fatimastyle',  color: '#857fff' },
  { name: 'Usman Javed',   handle: '@usmanmoney',   color: '#16b364' },
  { name: 'Zainab Ali',    handle: '@zainablife',   color: '#f0445f' },
  { name: 'Talha Nadeem',  handle: '@talhabuzz',    color: '#22c1ff' },
  { name: 'Hira Yousaf',   handle: '@hiraglam',     color: '#6d5cff' },
  { name: 'Danial Sheikh', handle: '@danialtech',   color: '#f59e0b' },
  { name: 'Noor Fatima',   handle: '@noorvlogs',    color: '#857fff' },
  { name: 'Ahmed Raza',    handle: '@ahmedplays',   color: '#4c2dd1' },
];

const ROLES = ['Lead Creator', 'Co-Creator', 'Supporting Creator', 'Brand Ambassador'];
const DELIVERABLE_TYPES = ['Reels', 'Stories', 'Posts', 'Videos', 'UGC Content', 'Livestreams'];
const PARTICIPANT_STATUS = ['Active', 'Completed', 'Pending', 'Removed'];
const PAYMENT_STATUS = ['Paid', 'Pending', 'Escrowed', 'Refunded'];
const REVIEW_STATUS = ['Approved', 'Pending Review', 'Needs Revision', 'Rejected'];

function genInitials(name) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function genParticipants(rand, count, seed) {
  const out = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(rand() * CREATOR_POOL.length);
    while (used.has(idx) && used.size < CREATOR_POOL.length) idx = (idx + 1) % CREATOR_POOL.length;
    used.add(idx);
    const c = CREATOR_POOL[idx];
    const followers = Math.round((20000 + rand() * 480000) / 1000) * 1000;
    out.push({
      id: `PCP-${seed}-${i + 1}`,
      name: c.name,
      handle: c.handle,
      initials: genInitials(c.name),
      color: c.color,
      followers,
      engagement: Math.round((1.5 + rand() * 6) * 10) / 10,
      role: pick(rand, ROLES),
      deliverables: 1 + Math.floor(rand() * 5),
      status: pick(rand, PARTICIPANT_STATUS),
      performanceScore: clamp(55 + rand() * 45),
      paymentStatus: pick(rand, PAYMENT_STATUS),
      reach: Math.round(followers * (1.2 + rand() * 1.8)),
      roi: Math.round(80 + rand() * 320),
      conversionRate: Math.round((1 + rand() * 6) * 10) / 10,
    });
  }
  return out;
}

function genDeliverableTracker(rand, seed) {
  const count = 4 + Math.floor(rand() * 4);
  const out = [];
  for (let i = 0; i < count; i++) {
    const type = pick(rand, DELIVERABLE_TYPES);
    const status = pick(rand, ['Completed', 'In Progress', 'Pending', 'Overdue']);
    const dueOffset = Math.floor(rand() * 30) - 10;
    out.push({
      id: `DLV-${seed}-${i + 1}`,
      type,
      status,
      dueDate: daysFromNow(dueOffset),
      submissionDate: status === 'Pending' ? null : daysFromNow(dueOffset - Math.floor(rand() * 3)),
      reviewStatus: status === 'Pending' ? '—' : pick(rand, REVIEW_STATUS),
      revisionCount: status === 'Pending' ? 0 : Math.floor(rand() * 3),
    });
  }
  return out;
}

function genPerformanceTrend(seed, baseReach) {
  const labels = dateLabels(8, 'week');
  const reach = buildSeries(8, { base: baseReach, trend: 0.04, seed: seed + 1 });
  const engagement = buildSeries(8, { base: baseReach * 0.05, trend: 0.03, seed: seed + 2 });
  const conversions = buildSeries(8, { base: baseReach * 0.004, trend: 0.05, seed: seed + 3 });
  const clicks = buildSeries(8, { base: baseReach * 0.02, trend: 0.035, seed: seed + 4 });
  return labels.map((label, i) => ({
    label,
    reach: reach[i],
    engagement: engagement[i],
    conversions: conversions[i],
    clicks: clicks[i],
  }));
}

function genCommunications(rand, seed, campaignName) {
  const messages = [
    { id: `MSG-${seed}-1`, from: 'Brand Manager', text: `Reminder: please review the latest submissions for ${campaignName}.`, date: daysAgo(2) },
    { id: `MSG-${seed}-2`, from: 'Creator Support', text: 'Two creators flagged delivery delays — escalation queued.', date: daysAgo(5) },
  ];
  const announcements = [
    { id: `ANN-${seed}-1`, title: 'Campaign brief updated', date: daysAgo(8) },
  ];
  const updates = [
    { id: `UPD-${seed}-1`, title: 'Milestone 2 reached — 60% deliverables submitted', date: daysAgo(3) },
  ];
  const approvalRequests = [
    { id: `APR-${seed}-1`, title: 'Creative approval pending for Reel #3', status: pick(rand, ['Pending', 'Approved', 'Rejected']), date: daysAgo(1) },
  ];
  const feedbackThreads = [
    { id: `FBT-${seed}-1`, title: 'Brand feedback on UGC batch 1', replies: 1 + Math.floor(rand() * 6), date: daysAgo(4) },
  ];
  return { messages, announcements, updates, approvalRequests, feedbackThreads };
}

function genActivity(campaign) {
  const events = [
    { id: 'a1', type: 'created', icon: '🆕', label: 'Campaign Created', date: campaign.createdDate },
    { id: 'a2', type: 'invited', icon: '✉️', label: `${campaign.creatorCount + 3} creators invited`, date: daysAgo(campaign._age - 2) },
    { id: 'a3', type: 'applications', icon: '📥', label: `${campaign.applications} applications received`, date: daysAgo(campaign._age - 4) },
  ];
  if (['selected', 'in_progress', 'under_review', 'completed', 'archived'].includes(campaign.pipelineStage)) {
    events.push({ id: 'a4', type: 'approved', icon: '✅', label: `${campaign.creatorCount} creators approved`, date: daysAgo(campaign._age - 6) });
  }
  if (['in_progress', 'under_review', 'completed', 'archived'].includes(campaign.pipelineStage)) {
    events.push({ id: 'a5', type: 'submission', icon: '📤', label: 'First deliverable submitted', date: daysAgo(campaign._age - 10) });
    events.push({ id: 'a6', type: 'payment', icon: '💸', label: 'Milestone payment released to creators', date: daysAgo(campaign._age - 12) });
  }
  if (['completed', 'archived'].includes(campaign.pipelineStage)) {
    events.push({ id: 'a7', type: 'completed', icon: '🏁', label: 'Campaign marked completed', date: daysAgo(2) });
  }
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ───────────────────────── Campaign seeds ───────────────────────── */

const CAMPAIGN_SEEDS = [
  { id: 'CMP-1001', name: 'Eid Collection Launch',        brand: 'Zara Apparel',      industry: 'Fashion',    type: 'Product Launch',             pipelineStage: 'in_progress',  age: 28, budget: 1850000, manager: 'Areeba Noman', flags: [] },
  { id: 'CMP-1002', name: 'GlowUp Skincare UGC Drive',     brand: 'GlowUp Cosmetics',   industry: 'Beauty',     type: 'UGC Campaign',               pipelineStage: 'in_progress',  age: 22, budget: 980000,  manager: 'Saad Iqbal',  flags: [] },
  { id: 'CMP-1003', name: 'NovaPhone X Awareness',         brand: 'TechNova',           industry: 'Technology', type: 'Brand Awareness',            pipelineStage: 'under_review', age: 35, budget: 3200000, manager: 'Areeba Noman', flags: [] },
  { id: 'CMP-1004', name: 'PixelPlay Launch Bonus',        brand: 'PixelPlay Games',    industry: 'Gaming',     type: 'Affiliate Campaign',         pipelineStage: 'in_progress',  age: 18, budget: 740000,  manager: 'Hassan Raza', flags: [] },
  { id: 'CMP-1005', name: 'Summer Shred Challenge',        brand: 'FitZone',            industry: 'Fitness',    type: 'Seasonal Campaign',           pipelineStage: 'published',    age: 6,  budget: 520000,  manager: 'Mariam Sohail', flags: [] },
  { id: 'CMP-1006', name: 'Northern Escape Promo',         brand: 'Wanderlust Travels', industry: 'Travel',     type: 'Event Promotion',             pipelineStage: 'applications', age: 9,  budget: 1100000, manager: 'Hassan Raza', flags: [] },
  { id: 'CMP-1007', name: 'Future Learners Ambassadors',   brand: 'EduSmart',           industry: 'Education',  type: 'Creator Ambassador Program',  pipelineStage: 'selected',     age: 12, budget: 690000,  manager: 'Mariam Sohail', flags: [] },
  { id: 'CMP-1008', name: 'TasteBite Ramadan Specials',     brand: 'TasteBite Foods',    industry: 'Food',       type: 'Product Launch',              pipelineStage: 'completed',    age: 64, budget: 1320000, manager: 'Saad Iqbal',  flags: [] },
  { id: 'CMP-1009', name: 'SecureSave App Awareness',       brand: 'FinSecure',          industry: 'Finance',    type: 'Brand Awareness',             pipelineStage: 'draft',        age: 2,  budget: 2400000, manager: 'Areeba Noman', flags: [] },
  { id: 'CMP-1010', name: 'UrbanThreads Street Style UGC',  brand: 'UrbanThreads',       industry: 'Fashion',    type: 'UGC Campaign',                pipelineStage: 'in_progress',  age: 31, budget: 880000,  manager: 'Hassan Raza', flags: ['Missed Deadline', 'Creator Complaints'] },
  { id: 'CMP-1011', name: 'PureGlow Winter Edit',            brand: 'PureGlow',           industry: 'Beauty',     type: 'Seasonal Campaign',           pipelineStage: 'archived',     age: 120, budget: 610000,  manager: 'Saad Iqbal',  flags: [] },
  { id: 'CMP-1012', name: 'ByteCraft Referral Surge',        brand: 'ByteCraft',          industry: 'Technology', type: 'Affiliate Campaign',          pipelineStage: 'under_review', age: 40, budget: 1450000, manager: 'Hassan Raza', flags: ['Payment Issue', 'Policy Violation'] },
  { id: 'CMP-1013', name: 'GameVerse Launch Week',            brand: 'GameVerse',          industry: 'Gaming',     type: 'Event Promotion',             pipelineStage: 'completed',    age: 70, budget: 2050000, manager: 'Mariam Sohail', flags: [] },
  { id: 'CMP-1014', name: 'ActiveLife Ambassador Program',    brand: 'ActiveLife',         industry: 'Fitness',    type: 'Creator Ambassador Program',  pipelineStage: 'in_progress',  age: 45, budget: 1750000, manager: 'Areeba Noman', flags: [] },
  { id: 'CMP-1015', name: 'SkyHigh Getaway Deals',            brand: 'SkyHigh Airlines',   industry: 'Travel',     type: 'Product Launch',              pipelineStage: 'in_progress',  age: 26, budget: 2900000, manager: 'Saad Iqbal',  flags: ['Payment Issue', 'High Dispute Rate'] },
  { id: 'CMP-1016', name: 'LearnFast Study Habits UGC',       brand: 'LearnFast',          industry: 'Education',  type: 'UGC Campaign',                pipelineStage: 'published',    age: 4,  budget: 430000,  manager: 'Mariam Sohail', flags: [] },
];

/* ───────────────────────── Computed campaigns ───────────────────────── */

export const CAMPAIGNS = CAMPAIGN_SEEDS.map((seed, i) => {
  const rand = seededRandom(700 + i * 13);
  const n = i + 1;

  const creatorCount = 3 + Math.floor(rand() * 12);
  const applications = creatorCount + Math.floor(rand() * 25) + 5;

  let progress;
  switch (seed.pipelineStage) {
    case 'draft': progress = 0; break;
    case 'published': progress = Math.round(5 + rand() * 5); break;
    case 'applications': progress = Math.round(10 + rand() * 10); break;
    case 'selected': progress = Math.round(20 + rand() * 10); break;
    case 'in_progress': progress = Math.round(35 + rand() * 45); break;
    case 'under_review': progress = Math.round(80 + rand() * 12); break;
    case 'completed': progress = 100; break;
    case 'archived': progress = 100; break;
    default: progress = 0;
  }

  const hasFlags = seed.flags.length > 0;
  const completionRate = clamp(progress + (rand() * 10 - 5));
  const engagementScore = clamp(60 + rand() * 38 - (hasFlags ? 18 : 0));
  const creatorSatisfaction = clamp(65 + rand() * 32 - (hasFlags ? 22 : 0));
  const paymentCompletion = clamp(70 + rand() * 28 - (hasFlags ? 30 : 0));
  const disputeRate = clamp(hasFlags ? 30 + rand() * 40 : rand() * 12);

  const healthScore = clamp(
    completionRate * 0.25 + engagementScore * 0.2 + creatorSatisfaction * 0.2 +
    paymentCompletion * 0.2 + (100 - disputeRate) * 0.15
  );

  const paymentDelays = clamp(hasFlags ? 40 + rand() * 40 : rand() * 15);
  const negativeReviews = clamp(hasFlags ? 35 + rand() * 35 : rand() * 14);
  const violationReports = clamp(seed.flags.includes('Policy Violation') ? 50 + rand() * 30 : rand() * 8);
  const creatorComplaints = clamp(seed.flags.includes('Creator Complaints') ? 50 + rand() * 30 : rand() * 10);
  const missedDeliverables = clamp(seed.flags.includes('Missed Deadline') ? 45 + rand() * 35 : rand() * 12);

  const riskScore = Math.round(
    (paymentDelays + negativeReviews + violationReports + creatorComplaints + missedDeliverables) / 5
  );
  let riskLevel;
  if (riskScore >= 60) riskLevel = 'critical';
  else if (riskScore >= 40) riskLevel = 'high';
  else if (riskScore >= 20) riskLevel = 'medium';
  else riskLevel = 'low';

  const budget = seed.budget;
  const spentFraction = seed.pipelineStage === 'draft' ? 0 : Math.min(1, progress / 100) * (0.7 + rand() * 0.3);
  const spent = Math.round(budget * spentFraction);
  const escrow = Math.round((budget - spent) * (0.3 + rand() * 0.4));
  const remaining = budget - spent;
  const creatorPayments = Math.round(spent * (0.75 + rand() * 0.15));
  const pendingPayments = Math.round(remaining * (hasFlags ? 0.5 : 0.2));
  const refunds = hasFlags ? Math.round(budget * 0.03 * rand()) : 0;

  const baseReach = Math.round(creatorCount * (40000 + rand() * 60000));
  const reach = Math.round(baseReach * (1 + rand() * 0.6));
  const impressions = Math.round(reach * (1.6 + rand() * 0.8));
  const engagement = Math.round(reach * (0.04 + rand() * 0.05));
  const views = Math.round(impressions * (0.3 + rand() * 0.25));
  const clicks = Math.round(reach * (0.015 + rand() * 0.025));
  const conversions = Math.round(clicks * (0.04 + rand() * 0.08));
  const revenue = Math.round(conversions * (1500 + rand() * 4500));
  const roi = budget > 0 ? Math.round((revenue / budget) * 100) : 0;

  let activeStatus;
  if (hasFlags) activeStatus = 'flagged';
  else if (seed.pipelineStage === 'draft') activeStatus = 'draft';
  else if (seed.pipelineStage === 'archived') activeStatus = 'archived';
  else if (seed.pipelineStage === 'completed') activeStatus = 'completed';
  else if (seed.pipelineStage === 'published' && rand() < 0.15) activeStatus = 'paused';
  else activeStatus = 'active';

  const campaign = {
    id: seed.id,
    name: seed.name,
    brand: seed.brand,
    brandInitials: genInitials(seed.brand),
    industry: seed.industry,
    type: seed.type,
    description: `${seed.type} initiative for ${seed.brand} targeting ${seed.industry.toLowerCase()} audiences across Pakistan, focused on driving authentic creator-led storytelling and measurable conversions.`,
    objectives: [
      'Increase brand awareness among target demographics',
      'Drive measurable engagement and conversions',
      'Build a library of authentic creator content',
    ],
    deliverablesList: Array.from(new Set([pick(rand, DELIVERABLE_TYPES), pick(rand, DELIVERABLE_TYPES), pick(rand, DELIVERABLE_TYPES)])),
    campaignManager: seed.manager,
    budget,
    spent,
    remaining,
    escrow,
    creatorPayments,
    pendingPayments,
    refunds,
    creatorCount,
    applications,
    pipelineStage: seed.pipelineStage,
    activeStatus,
    progress,
    roi,
    healthScore,
    healthStatus: healthStatusFor(healthScore),
    healthFactors: { completionRate, engagement: engagementScore, creatorSatisfaction, paymentCompletion, disputeRate },
    riskLevel,
    riskScore,
    riskFactors: { paymentDelays, negativeReviews, violationReports, creatorComplaints, missedDeliverables },
    flags: seed.flags,
    createdDate: daysAgo(seed.age),
    deadline: daysFromNow(Math.round(30 - seed.age * 0.4 + rand() * 20)),
    _age: seed.age,
    performance: { reach, impressions, engagement, views, clicks, conversions, roi, revenue },
    performanceTrend: genPerformanceTrend(800 + i * 7, baseReach / 8),
    participants: genParticipants(rand, Math.min(creatorCount, 8), n),
    deliverableTracker: genDeliverableTracker(rand, n),
    communications: genCommunications(rand, n, seed.name),
  };

  campaign.activity = genActivity(campaign);
  campaign.creatorContribution = campaign.participants.map((p) => ({
    creator: p.name,
    initials: p.initials,
    color: p.color,
    handle: p.handle,
    reach: p.reach,
    engagement: p.engagement,
    roi: p.roi,
    conversionRate: p.conversionRate,
    performanceScore: p.performanceScore,
  }));

  return campaign;
});

/* ───────────────────────── Pipeline funnel ───────────────────────── */

export const PIPELINE_STAGES = (() => {
  const counts = {
    draft: 38, published: 64, applications: 92, selected: 71,
    in_progress: 142, under_review: 47, completed: 298, archived: 84,
  };
  let prev = null;
  return PIPELINE_STAGE_META.map((stage) => {
    const count = counts[stage.id] ?? 0;
    const conversion = prev ? Math.round((count / prev) * 1000) / 10 : 100;
    prev = count;
    return { ...stage, count, conversion };
  });
})();

/* ───────────────────────── Disputes ───────────────────────── */

export const DISPUTES = [
  { id: 'DSP-2001', campaignId: 'CMP-1010', campaign: 'UrbanThreads Street Style UGC', type: 'Contract Dispute', party: 'Creator: Zainab Ali', status: 'Under Investigation', opened: daysAgo(6), summary: 'Creator claims deliverables were rejected without valid feedback after deadline extension was granted.' },
  { id: 'DSP-2002', campaignId: 'CMP-1012', campaign: 'ByteCraft Referral Surge', type: 'Payment Dispute', party: 'Creator: Danial Sheikh', status: 'Open', opened: daysAgo(3), summary: 'Milestone payment delayed by 14 days beyond agreed terms; creator requesting escalation.' },
  { id: 'DSP-2003', campaignId: 'CMP-1015', campaign: 'SkyHigh Getaway Deals', type: 'Payment Dispute', party: 'Creator: Noor Fatima', status: 'Open', opened: daysAgo(2), summary: 'Escrow release blocked pending brand confirmation; creator reports cash-flow impact.' },
  { id: 'DSP-2004', campaignId: 'CMP-1015', campaign: 'SkyHigh Getaway Deals', type: 'Contract Dispute', party: 'Brand: SkyHigh Airlines', status: 'Under Investigation', opened: daysAgo(5), summary: 'Brand disputes scope of delivered content vs. agreed contract terms.' },
  { id: 'DSP-2005', campaignId: 'CMP-1012', campaign: 'ByteCraft Referral Surge', type: 'Policy Violation', party: 'Creator: Ahmed Raza', status: 'Resolved', opened: daysAgo(20), summary: 'Undisclosed sponsored content — resolved with creator acknowledgement and content update.' },
  { id: 'DSP-2006', campaignId: 'CMP-1010', campaign: 'UrbanThreads Street Style UGC', type: 'Payment Dispute', party: 'Creator: Talha Nadeem', status: 'Resolved', opened: daysAgo(35), summary: 'Disputed payment amount — resolved after rate-card reconciliation.' },
];

/* ───────────────────────── Templates ───────────────────────── */

export const TEMPLATES = [
  { id: 'TPL-01', name: 'Product Launch', icon: '🚀', description: 'Coordinated multi-creator rollout for a new product with teaser, launch-day and follow-up content.', usageCount: 86, avgROI: 268, deliverables: ['Reels', 'Posts', 'Stories'] },
  { id: 'TPL-02', name: 'Brand Awareness', icon: '📣', description: 'Broad-reach campaign focused on impressions and sentiment across a brand\'s target demographics.', usageCount: 104, avgROI: 198, deliverables: ['Videos', 'Posts', 'Stories'] },
  { id: 'TPL-03', name: 'UGC Campaign', icon: '🎬', description: 'Authentic, creator-generated content library for repurposing across brand channels.', usageCount: 121, avgROI: 234, deliverables: ['UGC Content', 'Reels'] },
  { id: 'TPL-04', name: 'Affiliate Campaign', icon: '🔗', description: 'Performance-based campaign rewarding creators on conversions and referral codes.', usageCount: 67, avgROI: 312, deliverables: ['Posts', 'Stories', 'Livestreams'] },
  { id: 'TPL-05', name: 'Event Promotion', icon: '🎉', description: 'Time-boxed campaign driving awareness and attendance for a launch or live event.', usageCount: 52, avgROI: 221, deliverables: ['Stories', 'Reels', 'Livestreams'] },
  { id: 'TPL-06', name: 'Seasonal Campaign', icon: '🎁', description: 'Holiday or seasonal promotion aligned to key shopping moments.', usageCount: 78, avgROI: 245, deliverables: ['Posts', 'Reels', 'UGC Content'] },
  { id: 'TPL-07', name: 'Creator Ambassador Program', icon: '🤝', description: 'Long-term, retainer-based partnership with recurring monthly deliverables.', usageCount: 43, avgROI: 287, deliverables: ['Videos', 'Posts', 'Stories', 'UGC Content'] },
];

/* ───────────────────────── AI Insights & Risk Detection ───────────────────────── */

export const AI_INSIGHTS = [
  { id: 'ai-1', icon: '💄', category: 'Industry Trend', impact: 'high', confidence: 92, text: 'Beauty campaigns achieved 27% higher engagement this month compared to platform average.' },
  { id: 'ai-2', icon: '✦', category: 'Creator Tier', impact: 'high', confidence: 88, text: 'Creators between 50K–200K followers delivered the highest ROI across active campaigns.' },
  { id: 'ai-3', icon: '🎬', category: 'Content Format', impact: 'medium', confidence: 85, text: 'Video-first campaigns outperform image-only campaigns by 34% on conversion rate.' },
  { id: 'ai-4', icon: '✅', category: 'Operations', impact: 'medium', confidence: 81, text: 'Campaign completion rate increased 12% over the previous quarter.' },
  { id: 'ai-5', icon: '🛫', category: 'Industry Trend', impact: 'medium', confidence: 76, text: 'Travel campaigns show the longest average time-to-completion — consider tighter milestone tracking.' },
  { id: 'ai-6', icon: '💰', category: 'Budget', impact: 'low', confidence: 70, text: 'Affiliate campaigns deliver the highest average ROI per rupee of budget allocated.' },
];

export const AI_RISK_DETECTION = CAMPAIGNS
  .filter((c) => c.riskLevel === 'high' || c.riskLevel === 'critical' || c.healthStatus === 'critical' || c.healthStatus === 'warning')
  .map((c) => {
    let reason;
    if (c.flags.includes('Payment Issue')) reason = 'Budget overrun risk — escrow utilisation exceeds 80% with payments pending.';
    else if (c.flags.includes('Missed Deadline')) reason = 'Likely delay — multiple deliverables past due date with no submissions.';
    else if (c.flags.includes('High Dispute Rate')) reason = 'Potential dispute escalation — dispute rate significantly above platform average.';
    else if (c.healthStatus === 'critical') reason = 'Low performance campaign — health score critically below platform benchmark.';
    else reason = 'Elevated risk signals detected — recommend manual review.';
    return {
      id: `risk-${c.id}`,
      campaignId: c.id,
      campaign: c.name,
      brand: c.brand,
      riskLevel: c.riskLevel,
      healthStatus: c.healthStatus,
      reason,
    };
  })
  .slice(0, 6);

/* ───────────────────────── Industry performance ───────────────────────── */

export const INDUSTRY_PERFORMANCE = INDUSTRIES.map((industry, i) => {
  const rand = seededRandom(900 + i * 11);
  const campaigns = CAMPAIGNS.filter((c) => c.industry === industry);
  const avgROI = campaigns.length
    ? Math.round(campaigns.reduce((s, c) => s + c.roi, 0) / campaigns.length)
    : Math.round(150 + rand() * 150);
  const avgEngagement = Math.round((2 + rand() * 6) * 10) / 10;
  const totalReach = campaigns.length
    ? campaigns.reduce((s, c) => s + c.performance.reach, 0)
    : Math.round(500000 + rand() * 2000000);
  const successRate = clamp(70 + rand() * 28);
  const trend = Math.round((rand() * 20 - 6) * 10) / 10;
  return { industry, avgROI, avgEngagement, totalReach, successRate, trend, campaignCount: campaigns.length || Math.floor(8 + rand() * 20) };
}).sort((a, b) => b.avgROI - a.avgROI);

/* ───────────────────────── Top campaigns leaderboards ───────────────────────── */

function topBy(key, n = 5) {
  return [...CAMPAIGNS].sort((a, b) => {
    const av = key.split('.').reduce((o, k) => o[k], a);
    const bv = key.split('.').reduce((o, k) => o[k], b);
    return bv - av;
  }).slice(0, n).map((c) => ({
    id: c.id, name: c.name, brand: c.brand, industry: c.industry,
    value: key.split('.').reduce((o, k) => o[k], c),
  }));
}

export const TOP_CAMPAIGNS = {
  highestReach: topBy('performance.reach'),
  highestEngagement: topBy('performance.engagement'),
  highestROI: topBy('roi'),
  highestRevenue: topBy('performance.revenue'),
  highestSatisfaction: topBy('healthFactors.creatorSatisfaction'),
};

/* ───────────────────────── Platform-wide trend series ───────────────────────── */

export const CAMPAIGN_GROWTH_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label,
  created: buildSeries(8, { base: 40, trend: 0.05, seed: 301 })[i],
  completed: buildSeries(8, { base: 28, trend: 0.06, seed: 302 })[i],
}));

export const SUCCESS_TREND_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label,
  successRate: buildSeries(8, { base: 78, trend: 0.012, volatility: 0.03, seed: 303 })[i],
}));

export const PARTICIPATION_TREND_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label,
  participation: buildSeries(8, { base: 60, trend: 0.018, volatility: 0.03, seed: 304 })[i],
}));

export const BUDGET_TREND_SERIES = dateLabels(8, 'month').map((label, i) => ({
  label,
  allocated: buildSeries(8, { base: 14000000, trend: 0.04, seed: 305 })[i],
  spent: buildSeries(8, { base: 11000000, trend: 0.045, seed: 306 })[i],
}));

export const ENGAGEMENT_TREND_SERIES = dateLabels(8, 'week').map((label, i) => ({
  label,
  engagement: buildSeries(8, { base: 48000, trend: 0.03, seed: 307 })[i],
}));

export const REACH_TREND_SERIES = dateLabels(8, 'week').map((label, i) => ({
  label,
  reach: buildSeries(8, { base: 620000, trend: 0.035, seed: 308 })[i],
}));

export const CONVERSION_TREND_SERIES = dateLabels(8, 'week').map((label, i) => ({
  label,
  conversions: buildSeries(8, { base: 1800, trend: 0.04, seed: 309 })[i],
}));

export const TOP_CATEGORIES = INDUSTRY_PERFORMANCE.slice(0, 5).map((ip) => ({
  label: ip.industry,
  value: ip.campaignCount,
}));

/* ───────────────────────── Derived collections ───────────────────────── */

export const ACTIVE_CAMPAIGNS = CAMPAIGNS.filter((c) =>
  ['published', 'applications', 'selected', 'in_progress', 'under_review'].includes(c.pipelineStage)
);

export const FLAGGED_CAMPAIGNS = CAMPAIGNS.filter((c) => c.flags.length > 0);

/* ───────────────────────── Global search index ───────────────────────── */

export const SEARCH_INDEX = [
  ...CAMPAIGNS.map((c) => ({ type: 'campaign', id: c.id, label: c.name, sub: `${c.brand} · ${c.id}` })),
  ...Array.from(new Set(CAMPAIGNS.map((c) => c.brand))).map((brand) => ({
    type: 'brand', id: brand, label: brand, sub: 'Brand',
  })),
  ...Array.from(new Set(CAMPAIGNS.flatMap((c) => c.participants.map((p) => p.name)))).map((name) => {
    const p = CAMPAIGNS.flatMap((c) => c.participants).find((x) => x.name === name);
    return { type: 'creator', id: p.handle, label: name, sub: `${p.handle} · Creator` };
  }),
  ...INDUSTRIES.map((industry) => ({ type: 'industry', id: industry, label: industry, sub: 'Industry' })),
];
