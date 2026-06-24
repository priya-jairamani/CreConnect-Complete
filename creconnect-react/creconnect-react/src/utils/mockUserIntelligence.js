/**
 * Mock data layer for the Admin "User Intelligence & Verification Operations" page.
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
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    out.push(
      unit === 'day'
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'short' })
    );
  }
  return out;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/* ───────────────────────── Overview KPIs ───────────────────────── */

export const OVERVIEW_KPIS = [
  { id: 'totalUsers',     label: 'Total Users',         icon: '👥', value: 18420, prevValue: 17120, format: 'number',  sparkline: buildSeries(14, { base: 17000, trend: 0.006, seed: 21 }), accent: '#6d5cff' },
  { id: 'activeCreators', label: 'Active Creators',     icon: '✦',  value: 12860, prevValue: 12040, format: 'number',  sparkline: buildSeries(14, { base: 12000, trend: 0.005, seed: 22 }), accent: '#857fff' },
  { id: 'activeBrands',   label: 'Active Brands',       icon: '🏢', value: 1340,  prevValue: 1205,  format: 'number',  sparkline: buildSeries(14, { base: 1200,  trend: 0.006, seed: 23 }), accent: '#f59e0b' },
  { id: 'pendingVerify',  label: 'Pending Verification', icon: '🛂', value: 184,  prevValue: 221,   format: 'number',  sparkline: buildSeries(14, { base: 220,   trend: -0.012, seed: 24 }), accent: '#22c1ff' },
  { id: 'suspended',      label: 'Suspended Users',     icon: '⛔', value: 57,    prevValue: 49,    format: 'number',  sparkline: buildSeries(14, { base: 48,    trend: 0.01,  seed: 25 }), accent: '#f0445f' },
  { id: 'highRisk',       label: 'High Risk Accounts',  icon: '⚠️', value: 38,    prevValue: 46,    format: 'number',  sparkline: buildSeries(14, { base: 46,    trend: -0.01, seed: 26 }), accent: '#f5a623' },
];

/* ───────────────────────── Overview Charts ───────────────────────── */

const monthLabels = dateLabels(7, 'month');

export const USER_GROWTH_SERIES = monthLabels.map((label, i) => ({
  label,
  creators: buildSeries(7, { base: 9800, trend: 0.045, seed: 31 })[i],
  brands:   buildSeries(7, { base: 920,  trend: 0.05,  seed: 32 })[i],
}));

export const VERIFICATION_TRENDS = monthLabels.map((label, i) => ({
  label,
  approved: buildSeries(7, { base: 140, trend: 0.04, volatility: 0.1, seed: 33 })[i],
  rejected: buildSeries(7, { base: 28,  trend: 0.01, volatility: 0.2, seed: 34 })[i],
  pending:  buildSeries(7, { base: 180, trend: -0.03, volatility: 0.12, seed: 35 })[i],
}));

const dayLabels = dateLabels(14, 'day');

export const USER_ACTIVITY_TRENDS = dayLabels.map((label, i) => ({
  label,
  logins:    buildSeries(14, { base: 4200, trend: 0.01, volatility: 0.08, seed: 36 })[i],
  campaigns: buildSeries(14, { base: 320,  trend: 0.015, volatility: 0.12, seed: 37 })[i],
}));

/* ───────────────────────── AI Insights ───────────────────────── */

export const AI_INSIGHTS = [
  { id: 'ai-1', icon: '✅', category: 'Verification', impact: 'high',   confidence: 92, text: '12 creators are eligible for fast-track verification based on document and social signal match.' },
  { id: 'ai-2', icon: '⚠️', category: 'Fraud',        impact: 'high',   confidence: 87, text: '3 brands show elevated fraud risk due to repeated payment disputes and mismatched billing details.' },
  { id: 'ai-3', icon: '📈', category: 'Engagement',   impact: 'medium', confidence: 81, text: 'Fashion & Beauty creators have the highest average engagement rate this month (6.8%).' },
  { id: 'ai-4', icon: '🔄', category: 'Retention',    impact: 'medium', confidence: 78, text: 'Creator retention increased 9% month-over-month after the new payout cycle rollout.' },
  { id: 'ai-5', icon: '🚩', category: 'Risk',         impact: 'high',   confidence: 84, text: '5 accounts show sudden follower spikes consistent with bot-driven growth — recommend audit.' },
  { id: 'ai-6', icon: '💬', category: 'Trust',        impact: 'low',    confidence: 69, text: 'Brand satisfaction scores for tech-niche creators are trending upward (+4.2 pts).' },
];

/* ───────────────────────── Reference data ───────────────────────── */

export const FILTER_OPTIONS = {
  status: ['All Statuses', 'Active', 'Inactive', 'Suspended'],
  verification: ['All Verification', 'Verified', 'Pending', 'Rejected', 'Needs Review'],
  risk: ['All Risk Levels', 'Low', 'Medium', 'High', 'Critical'],
  industry: ['All Industries', 'Fashion', 'Beauty', 'Tech', 'Fitness', 'Food & Beverage', 'Travel', 'Gaming', 'Finance', 'Lifestyle', 'Education'],
  country: ['All Countries', 'Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States', 'Canada', 'Saudi Arabia'],
  niche: ['All Niches', 'Fashion', 'Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Gaming', 'Finance', 'Lifestyle', 'Parenting'],
  engagement: ['Any Engagement', '0–2%', '2–4%', '4–6%', '6%+'],
  followers: ['Any Followers', '< 10K', '10K–100K', '100K–500K', '500K+'],
  campaigns: ['Any Campaign Count', '0', '1–5', '6–15', '16+'],
};

export const VERIFICATION_STATUSES = ['verified', 'pending', 'rejected', 'needs_review'];
export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

export const RISK_META = {
  low:      { label: 'Low Risk',      variant: 'success' },
  medium:   { label: 'Medium Risk',   variant: 'brand' },
  high:     { label: 'High Risk',     variant: 'warning' },
  critical: { label: 'Critical Risk', variant: 'danger' },
};

export const VERIFICATION_META = {
  verified:      { label: 'Verified',     variant: 'success' },
  pending:       { label: 'Pending',      variant: 'warning' },
  rejected:      { label: 'Rejected',     variant: 'danger' },
  needs_review:  { label: 'Needs Review', variant: 'brand' },
};

export const STATUS_META = {
  active:    { label: 'Active',    variant: 'success' },
  inactive:  { label: 'Inactive',  variant: 'neutral' },
  suspended: { label: 'Suspended', variant: 'danger' },
};

/* ───────────────────────── Generators for nested records ───────────────────────── */

const REVIEW_AUTHORS = ['Zara Apparel', 'GlowUp Cosmetics', 'NovaTech', 'PeakFit Gear', 'Bistro Bites', 'Wander Travel Co.', 'PixelPlay Studios', 'WealthWise', 'UrbanLiving', 'BrightStart Edu'];
const REVIEW_COMMENTS = [
  'Delivered content on time and exceeded expectations.',
  'Great communication throughout the campaign.',
  'Audience engagement was higher than projected.',
  'Professional, creative, and easy to work with.',
  'Content quality was good but turnaround was slow.',
  'Solid results — would collaborate again.',
];
const REPORT_REASONS = ['Suspicious follower growth', 'Inappropriate content', 'Payment dispute', 'Fake engagement claims', 'Impersonation report', 'Contract violation'];
const FRAUD_SIGNAL_TYPES = [
  { type: 'Sudden Follower Spike', icon: '📈' },
  { type: 'Suspicious Engagement', icon: '🤖' },
  { type: 'Fake Audience Signals', icon: '👻' },
  { type: 'Repeated Violations', icon: '🔁' },
  { type: 'Multiple Accounts', icon: '🧬' },
  { type: 'Payment Abuse', icon: '💳' },
];

function genCampaignHistory(rand, seed, brandPool) {
  const count = 3 + Math.floor(rand() * 4);
  const statuses = ['Completed', 'In Progress', 'Completed', 'Cancelled'];
  return Array.from({ length: count }, (_, i) => ({
    id: `camp-${seed}-${i}`,
    brand: pick(rand, brandPool),
    name: pick(rand, ['Summer Launch', 'Product Spotlight', 'Brand Awareness', 'Festive Collection', 'App Promo', 'Unboxing Series']),
    status: pick(rand, statuses),
    payout: Math.round((15000 + rand() * 85000) / 500) * 500,
    date: daysAgo(Math.floor(rand() * 240)),
  }));
}

function genRevenueHistory(rand, seed) {
  const labels = dateLabels(6, 'month');
  const series = buildSeries(6, { base: 30000 + rand() * 60000, trend: 0.04, volatility: 0.18, seed });
  return labels.map((label, i) => ({ label, amount: series[i] }));
}

function genReviews(rand, seed, count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `rev-${seed}-${i}`,
    from: pick(rand, REVIEW_AUTHORS),
    rating: Math.round((3 + rand() * 2) * 10) / 10,
    comment: pick(rand, REVIEW_COMMENTS),
    date: daysAgo(Math.floor(rand() * 200)),
  }));
}

function genReports(rand, seed, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `rpt-${seed}-${i}`,
    reason: pick(rand, REPORT_REASONS),
    severity: pick(rand, ['low', 'medium', 'high']),
    status: pick(rand, ['Open', 'Resolved', 'Investigating']),
    date: daysAgo(Math.floor(rand() * 120)),
  }));
}

function genFraudSignals(rand, seed, count) {
  return Array.from({ length: count }, () => {
    const sig = pick(rand, FRAUD_SIGNAL_TYPES);
    return {
      type: sig.type,
      icon: sig.icon,
      severity: pick(rand, ['medium', 'high', 'critical']),
      description: `${sig.type} detected during routine analysis — flagged for admin review.`,
      date: daysAgo(Math.floor(rand() * 30)),
    };
  });
}

function genTimeline(rand, seed, { joinedAt, verification, status, extra = [] }) {
  const base = [
    { type: 'signup', icon: '🆕', label: 'Account created', date: joinedAt },
    { type: 'profile', icon: '✏️', label: 'Profile information updated', date: daysAgo(Math.floor(rand() * 200) + 10) },
  ];
  if (verification !== 'pending') {
    base.push({ type: 'verification', icon: '🛂', label: verification === 'verified' ? 'Identity verified by admin' : verification === 'rejected' ? 'Verification rejected — documents incomplete' : 'Flagged for manual review', date: daysAgo(Math.floor(rand() * 150) + 5) });
  }
  base.push({ type: 'campaign', icon: '🤝', label: 'Joined new collaboration', date: daysAgo(Math.floor(rand() * 90) + 1) });
  base.push({ type: 'payment', icon: '💰', label: 'Payout processed', date: daysAgo(Math.floor(rand() * 60) + 1) });
  if (status === 'suspended') {
    base.push({ type: 'report', icon: '🚫', label: 'Account suspended by admin', date: daysAgo(Math.floor(rand() * 20)) });
  }
  return [...base, ...extra].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* ───────────────────────── Creators ───────────────────────── */

const CREATOR_SEEDS = [
  { name: 'Ayesha Khan',      handle: '@ayeshakhan',     niche: 'Fashion',  country: 'Pakistan',              verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Bilal Ahmed',      handle: '@bilaltravels',   niche: 'Travel',   country: 'Pakistan',              verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Sara Malik',       handle: '@sara.glows',     niche: 'Beauty',   country: 'United Arab Emirates',  verification: 'pending',      status: 'active',    risk: 'medium' },
  { name: 'Hamza Tariq',      handle: '@hamzafitness',   niche: 'Fitness',  country: 'Pakistan',              verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Mehak Raza',       handle: '@mehakeats',      niche: 'Food',     country: 'United Kingdom',        verification: 'needs_review', status: 'active',    risk: 'high' },
  { name: 'Omar Farooq',      handle: '@omargamez',      niche: 'Gaming',   country: 'United States',         verification: 'verified',     status: 'active',    risk: 'medium' },
  { name: 'Fatima Sheikh',    handle: '@fatimastyle',    niche: 'Fashion',  country: 'Pakistan',              verification: 'rejected',     status: 'inactive',  risk: 'high' },
  { name: 'Usman Javed',      handle: '@usmanmoney',     niche: 'Finance',  country: 'Canada',                 verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Zainab Ali',       handle: '@zainablife',     niche: 'Lifestyle',country: 'Saudi Arabia',           verification: 'pending',      status: 'active',    risk: 'medium' },
  { name: 'Danish Iqbal',     handle: '@danishtech',     niche: 'Tech',     country: 'Pakistan',              verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Komal Shah',       handle: '@komalkids',      niche: 'Parenting',country: 'United Kingdom',        verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Talha Nadeem',     handle: '@talhabuzz',      niche: 'Gaming',   country: 'United States',         verification: 'needs_review', status: 'suspended', risk: 'critical' },
  { name: 'Hira Yousaf',      handle: '@hiraglam',       niche: 'Beauty',   country: 'United Arab Emirates',  verification: 'rejected',     status: 'suspended', risk: 'critical' },
  { name: 'Ahmed Raza',       handle: '@ahmedfit',       niche: 'Fitness',  country: 'Pakistan',              verification: 'pending',      status: 'active',    risk: 'medium' },
  { name: 'Noor Fatima',      handle: '@noortravels',    niche: 'Travel',   country: 'Canada',                 verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Bilawal Hussain',  handle: '@bilawalplays',   niche: 'Gaming',   country: 'Pakistan',              verification: 'needs_review', status: 'active',    risk: 'high' },
];

const BRAND_NAME_POOL = REVIEW_AUTHORS;

export const CREATORS = CREATOR_SEEDS.map((seed, i) => {
  const rand = seededRandom(100 + i * 7);
  const followers = Math.round((8000 + rand() * 480000));
  const baseScore = seed.risk === 'low' ? 80 + rand() * 15
    : seed.risk === 'medium' ? 65 + rand() * 15
    : seed.risk === 'high' ? 45 + rand() * 15
    : 20 + rand() * 20;

  const creatorScore = Math.round(baseScore + rand() * 6 - 3);
  const audienceQuality = Math.round(baseScore + rand() * 8 - 4);
  const trustScore = Math.round(baseScore + rand() * 6 - 3);
  const collaborationScore = Math.round(baseScore + rand() * 10 - 5);
  const brandSatisfaction = Math.round(baseScore + rand() * 8 - 4);
  const authenticityScore = Math.round(baseScore + rand() * 6 - 3);
  const fraudRisk = Math.round(100 - baseScore + rand() * 10 - 5);

  const joinedAt = daysAgo(120 + Math.floor(rand() * 600));
  const engagementRate = Math.round((seed.risk === 'critical' ? 0.5 + rand() * 1.5 : 2 + rand() * 6) * 10) / 10;
  const campaigns = 1 + Math.floor(rand() * 22);
  const earnings = Math.round((campaigns * (8000 + rand() * 30000)) / 1000) * 1000;

  const fraudSignalCount = seed.risk === 'critical' ? 3 + Math.floor(rand() * 2) : seed.risk === 'high' ? 1 + Math.floor(rand() * 2) : 0;

  return {
    id: `cr-${i + 1}`,
    type: 'creator',
    name: seed.name,
    handle: seed.handle,
    email: `${seed.handle.replace('@', '')}@gmail.com`,
    niche: seed.niche,
    country: seed.country,
    tags: [seed.niche, seed.risk === 'low' ? 'Top Performer' : seed.risk === 'critical' ? 'Under Investigation' : 'Growing'],

    creatorScore: clamp(creatorScore),
    audienceQuality: clamp(audienceQuality),
    trustScore: clamp(trustScore),
    collaborationScore: clamp(collaborationScore),
    brandSatisfaction: clamp(brandSatisfaction),
    authenticityScore: clamp(authenticityScore),
    fraudRisk: clamp(fraudRisk),

    followers,
    followerGrowth: buildSeries(12, { base: followers * 0.85, trend: 0.012, volatility: 0.05, seed: 200 + i }),
    engagementRate,
    campaigns,
    earnings,

    status: seed.status,
    verification: seed.verification,
    riskLevel: seed.risk,

    lastActive: daysAgo(Math.floor(rand() * (seed.status === 'suspended' ? 30 : 5))),
    joinedAt,

    audienceBreakdown: {
      age: [
        { label: '18-24', value: Math.round(20 + rand() * 25) },
        { label: '25-34', value: Math.round(25 + rand() * 25) },
        { label: '35-44', value: Math.round(10 + rand() * 15) },
        { label: '45+',   value: Math.round(5 + rand() * 10) },
      ],
      gender: [
        { label: 'Female', value: Math.round(35 + rand() * 40), color: '#857fff' },
        { label: 'Male',   value: Math.round(20 + rand() * 40), color: '#6d5cff' },
      ],
      topCountries: [seed.country, pick(rand, FILTER_OPTIONS.country.slice(1))],
    },

    campaignHistory: genCampaignHistory(rand, i, BRAND_NAME_POOL),
    revenueHistory: genRevenueHistory(rand, 300 + i),
    reviews: genReviews(rand, i, 2 + Math.floor(rand() * 3)),
    reports: genReports(rand, i, seed.risk === 'critical' ? 3 : seed.risk === 'high' ? 2 : seed.risk === 'medium' ? 1 : 0),
    fraudSignals: genFraudSignals(rand, i, fraudSignalCount),

    documents: {
      identity: seed.verification === 'verified' ? 'approved' : seed.verification === 'rejected' ? 'rejected' : 'pending',
      socialAccounts: [
        { platform: 'Instagram', handle: seed.handle, followers, verified: seed.verification === 'verified' },
        { platform: 'TikTok', handle: seed.handle, followers: Math.round(followers * (0.4 + rand() * 0.4)), verified: rand() > 0.4 },
      ],
      website: rand() > 0.5 ? `https://${seed.handle.replace('@', '')}.com` : null,
    },

    adminNotes: seed.risk === 'critical'
      ? 'Multiple fraud signals detected. Hold payouts pending investigation.'
      : seed.verification === 'needs_review'
        ? 'Awaiting manual review of submitted documents.'
        : '',

    timeline: genTimeline(rand, i, { joinedAt, verification: seed.verification, status: seed.status }),
  };
});

function clamp(n) {
  return Math.max(1, Math.min(99, Math.round(n)));
}

/* ───────────────────────── Brands ───────────────────────── */

const BRAND_SEEDS = [
  { name: 'Zara Apparel',       industry: 'Fashion',         country: 'Pakistan',              verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'GlowUp Cosmetics',   industry: 'Beauty',          country: 'United Arab Emirates',  verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'NovaTech',           industry: 'Tech',            country: 'United States',          verification: 'pending',      status: 'active',    risk: 'medium' },
  { name: 'PeakFit Gear',       industry: 'Fitness',         country: 'Pakistan',              verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'Bistro Bites',       industry: 'Food & Beverage',  country: 'United Kingdom',         verification: 'needs_review', status: 'active',    risk: 'high' },
  { name: 'Wander Travel Co.',  industry: 'Travel',          country: 'Canada',                  verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'PixelPlay Studios',  industry: 'Gaming',          country: 'United States',          verification: 'rejected',     status: 'inactive',  risk: 'critical' },
  { name: 'WealthWise',         industry: 'Finance',         country: 'Saudi Arabia',            verification: 'verified',     status: 'active',    risk: 'medium' },
  { name: 'UrbanLiving',        industry: 'Lifestyle',       country: 'Pakistan',              verification: 'pending',      status: 'active',    risk: 'medium' },
  { name: 'BrightStart Edu',    industry: 'Education',       country: 'United Kingdom',         verification: 'verified',     status: 'active',    risk: 'low' },
  { name: 'EliteRide Motors',   industry: 'Lifestyle',       country: 'United Arab Emirates',  verification: 'needs_review', status: 'suspended', risk: 'critical' },
  { name: 'SnapDeal Outlet',    industry: 'Fashion',         country: 'United States',          verification: 'rejected',     status: 'suspended', risk: 'critical' },
];

export const BRANDS = BRAND_SEEDS.map((seed, i) => {
  const rand = seededRandom(500 + i * 11);
  const baseScore = seed.risk === 'low' ? 82 + rand() * 14
    : seed.risk === 'medium' ? 65 + rand() * 15
    : seed.risk === 'high' ? 45 + rand() * 15
    : 18 + rand() * 20;

  const trustScore = Math.round(baseScore + rand() * 6 - 3);
  const creatorSatisfaction = Math.round(baseScore + rand() * 8 - 4);
  const paymentReliability = Math.round(baseScore + rand() * 8 - 4);
  const fraudRisk = Math.round(100 - baseScore + rand() * 10 - 5);

  const joinedAt = daysAgo(150 + Math.floor(rand() * 700));
  const campaigns = 1 + Math.floor(rand() * 30);
  const totalSpend = Math.round((campaigns * (40000 + rand() * 120000)) / 1000) * 1000;

  return {
    id: `br-${i + 1}`,
    type: 'brand',
    companyName: seed.name,
    industry: seed.industry,
    country: seed.country,
    tags: [seed.industry, seed.risk === 'low' ? 'Preferred Partner' : seed.risk === 'critical' ? 'Under Investigation' : 'Standard'],

    trustScore: clamp(trustScore),
    creatorSatisfaction: clamp(creatorSatisfaction),
    paymentReliability: clamp(paymentReliability),
    fraudRisk: clamp(fraudRisk),

    campaigns,
    totalSpend,
    spendHistory: genRevenueHistory(rand, 700 + i),

    status: seed.status,
    verification: seed.verification,
    riskLevel: seed.risk,

    lastActive: daysAgo(Math.floor(rand() * (seed.status === 'suspended' ? 30 : 5))),
    joinedAt,

    campaignAnalytics: Array.from({ length: 3 + Math.floor(rand() * 3) }, (_, j) => ({
      id: `cmpg-${i}-${j}`,
      name: pick(rand, ['Summer Launch', 'Product Spotlight', 'Brand Awareness', 'Festive Collection', 'App Promo', 'Unboxing Series']),
      creators: 2 + Math.floor(rand() * 18),
      budget: Math.round((30000 + rand() * 200000) / 1000) * 1000,
      status: pick(rand, ['Active', 'Completed', 'Draft', 'Completed']),
      date: daysAgo(Math.floor(rand() * 240)),
    })),

    creatorReviews: genReviews(rand, 800 + i, 2 + Math.floor(rand() * 3)),

    paymentHistory: Array.from({ length: 4 + Math.floor(rand() * 3) }, (_, j) => ({
      id: `pay-${i}-${j}`,
      creator: pick(rand, CREATOR_SEEDS).name,
      amount: Math.round((10000 + rand() * 60000) / 500) * 500,
      status: pick(rand, ['Paid', 'Paid', 'Pending', 'Failed']),
      date: daysAgo(Math.floor(rand() * 180)),
    })),

    reports: genReports(rand, 900 + i, seed.risk === 'critical' ? 3 : seed.risk === 'high' ? 2 : seed.risk === 'medium' ? 1 : 0),

    documents: {
      business: seed.verification === 'verified' ? 'approved' : seed.verification === 'rejected' ? 'rejected' : 'pending',
      registration: seed.verification === 'verified' ? 'approved' : 'pending',
      website: `https://${seed.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    },

    adminNotes: seed.risk === 'critical'
      ? 'Repeated payment disputes from creators. Escrow holds in effect.'
      : seed.verification === 'needs_review'
        ? 'Business documents under manual review.'
        : '',

    timeline: genTimeline(rand, 900 + i, { joinedAt, verification: seed.verification, status: seed.status }),
  };
});

/* ───────────────────────── Verification Queue ───────────────────────── */

export const VERIFICATION_QUEUE = [
  ...CREATORS.filter((c) => c.verification !== 'verified').map((c) => ({
    id: `vq-${c.id}`,
    entityId: c.id,
    entityType: 'creator',
    name: c.name,
    handle: c.handle,
    avatarLabel: c.name,
    submittedAt: daysAgo(Math.floor(Math.random() * 10) + 1),
    status: c.verification,
    riskLevel: c.riskLevel,
    documents: c.documents,
    riskAssessment: c.fraudSignals?.length
      ? `${c.fraudSignals.length} active fraud signal(s) detected. Manual review strongly recommended.`
      : 'No active fraud signals. Documents appear consistent.',
    adminNotes: c.adminNotes,
    history: c.timeline.slice(0, 3),
  })),
  ...BRANDS.filter((b) => b.verification !== 'verified').map((b) => ({
    id: `vq-${b.id}`,
    entityId: b.id,
    entityType: 'brand',
    name: b.companyName,
    handle: b.industry,
    avatarLabel: b.companyName,
    submittedAt: daysAgo(Math.floor(Math.random() * 10) + 1),
    status: b.verification,
    riskLevel: b.riskLevel,
    documents: b.documents,
    riskAssessment: b.riskLevel === 'critical'
      ? 'Multiple payment disputes on file. High fraud probability.'
      : 'Standard business verification — pending document cross-check.',
    adminNotes: b.adminNotes,
    history: b.timeline.slice(0, 3),
  })),
];

/* ───────────────────────── Suspended Accounts ───────────────────────── */

const SUSPENSION_REASONS = [
  'Fraudulent engagement detected on multiple campaigns',
  'Repeated payment disputes with creators',
  'Fake follower / bot audience signals',
  'Violation of platform content guidelines',
  'Multiple linked duplicate accounts detected',
];

export const SUSPENDED_ACCOUNTS = [
  ...CREATORS.filter((c) => c.status === 'suspended').map((c) => ({
    id: `sus-${c.id}`,
    entityId: c.id,
    entityType: 'creator',
    name: c.name,
    handle: c.handle,
    suspensionReason: pick(seededRandom(c.id.length * 13), SUSPENSION_REASONS),
    dateSuspended: daysAgo(Math.floor(Math.random() * 25) + 1),
    previousViolations: 1 + Math.floor(Math.random() * 4),
    riskScore: 100 - c.creatorScore,
    appealStatus: pick(seededRandom(c.id.length * 17), ['None', 'Pending Review', 'Denied']),
  })),
  ...BRANDS.filter((b) => b.status === 'suspended').map((b) => ({
    id: `sus-${b.id}`,
    entityId: b.id,
    entityType: 'brand',
    name: b.companyName,
    handle: b.industry,
    suspensionReason: pick(seededRandom(b.id.length * 19), SUSPENSION_REASONS),
    dateSuspended: daysAgo(Math.floor(Math.random() * 25) + 1),
    previousViolations: 1 + Math.floor(Math.random() * 4),
    riskScore: 100 - b.trustScore,
    appealStatus: pick(seededRandom(b.id.length * 23), ['None', 'Pending Review', 'Denied']),
  })),
];

/* ───────────────────────── Fraud Alerts ───────────────────────── */

export const FRAUD_ALERTS = CREATORS.concat(BRANDS)
  .filter((u) => (u.fraudSignals && u.fraudSignals.length) || u.riskLevel === 'critical')
  .flatMap((u) => {
    const name = u.name || u.companyName;
    const signals = u.fraudSignals?.length ? u.fraudSignals : [{ type: 'Multiple Accounts', icon: '🧬', severity: 'critical', description: 'Linked duplicate accounts detected during cross-reference scan.', date: daysAgo(2) }];
    return signals.map((s, idx) => ({
      id: `fraud-${u.id}-${idx}`,
      entityId: u.id,
      entityType: u.type,
      entityName: name,
      ...s,
    }));
  });

/* ───────────────────────── Search Index ───────────────────────── */

export const SEARCH_INDEX = [
  ...CREATORS.map((c) => ({ id: c.id, type: 'creator', label: c.name, sub: `${c.handle} · ${c.email}` })),
  ...BRANDS.map((b) => ({ id: b.id, type: 'brand', label: b.companyName, sub: `${b.industry} · ${b.id.toUpperCase()}` })),
];
