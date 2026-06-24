/**
 * Mock data layer for the Admin "Operations Command Center" dashboard.
 * All numbers are illustrative — wire up to `adminApi.getAnalytics()` /
 * dedicated admin-analytics endpoints once the backend exposes them.
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

/* ───────────────────────── Executive Overview ───────────────────────── */

export const EXECUTIVE_KPIS = [
  {
    id: 'totalUsers',
    label: 'Total Users',
    icon: '👥',
    value: 18420,
    prevValue: 17120,
    format: 'number',
    sparkline: buildSeries(14, { base: 17000, trend: 0.006, seed: 11 }),
    accent: '#6d5cff',
  },
  {
    id: 'activeCreators',
    label: 'Active Creators',
    icon: '✦',
    value: 6840,
    prevValue: 6510,
    format: 'number',
    sparkline: buildSeries(14, { base: 6400, trend: 0.005, seed: 22 }),
    accent: '#857fff',
  },
  {
    id: 'activeBrands',
    label: 'Active Brands',
    icon: '🏢',
    value: 1284,
    prevValue: 1190,
    format: 'number',
    sparkline: buildSeries(14, { base: 1180, trend: 0.006, seed: 33 }),
    accent: '#f59e0b',
  },
  {
    id: 'activeCampaigns',
    label: 'Active Campaigns',
    icon: '◈',
    value: 932,
    prevValue: 845,
    format: 'number',
    sparkline: buildSeries(14, { base: 830, trend: 0.008, seed: 44 }),
    accent: '#16b364',
  },
  {
    id: 'monthlyRevenue',
    label: 'Monthly Revenue',
    icon: '💰',
    value: 18650000,
    prevValue: 16420000,
    format: 'pkr',
    sparkline: buildSeries(14, { base: 16000000, trend: 0.009, seed: 55 }),
    accent: '#16b364',
  },
  {
    id: 'growthRate',
    label: 'Platform Growth Rate',
    icon: '📈',
    value: 12.4,
    prevValue: 9.8,
    format: 'percent',
    sparkline: buildSeries(14, { base: 9, trend: 0.018, volatility: 0.12, seed: 66 }),
    accent: '#6d5cff',
  },
];

/* ───────────────────────── Platform Health Center ───────────────────────── */

export const PLATFORM_HEALTH = {
  breakdown: [
    { id: 'userGrowth',     label: 'User Growth',         value: 92, weight: 0.20, icon: '👥', detail: '+8.2% MoM across creators & brands' },
    { id: 'campaignSuccess',label: 'Campaign Completion',  value: 88, weight: 0.25, icon: '◈', detail: '88% of campaigns reach completion' },
    { id: 'retention',      label: 'Creator Retention',    value: 81, weight: 0.20, icon: '✦', detail: '81% of creators active after 90 days' },
    { id: 'payments',       label: 'Payment Success',      value: 96, weight: 0.20, icon: '💳', detail: '96% of transactions settle without issue' },
    { id: 'reportVolume',   label: 'Report Volume',        value: 74, weight: 0.15, icon: '🛡️', detail: 'Lower report volume vs. active users' },
  ],
};

export function getHealthStatus(score) {
  if (score >= 85) return { label: 'Excellent', variant: 'success' };
  if (score >= 70) return { label: 'Good',      variant: 'brand' };
  if (score >= 50) return { label: 'Warning',   variant: 'warning' };
  return { label: 'Critical', variant: 'danger' };
}

export function computeHealthScore(breakdown) {
  const totalWeight = breakdown.reduce((sum, b) => sum + b.weight, 0);
  const weighted = breakdown.reduce((sum, b) => sum + b.value * b.weight, 0);
  return Math.round(weighted / totalWeight);
}

/* ───────────────────────── Marketplace Activity ───────────────────────── */

export const MARKETPLACE_ACTIVITY = [
  { id: 'creatorsOnline',   label: 'Creators Online',          icon: '🟢', value: 482,    delta: 34,    format: 'number' },
  { id: 'brandsOnline',     label: 'Brands Online',            icon: '🏢', value: 96,     delta: 5,     format: 'number' },
  { id: 'campaignsToday',   label: 'Campaigns Launched Today', icon: '🚀', value: 14,     delta: 3,     format: 'number' },
  { id: 'collabsStarted',   label: 'Collaborations Started',   icon: '🤝', value: 58,     delta: 12,    format: 'number' },
  { id: 'messagesToday',    label: 'Messages Sent Today',       icon: '💬', value: 4218,   delta: 210,   format: 'number' },
  { id: 'paymentsReleased', label: 'Payments Released Today',   icon: '💸', value: 326000, delta: 18000, format: 'pkr' },
];

/* ───────────────────────── Growth Analytics ───────────────────────── */

const RANGE_CONFIG = {
  '7d':  { points: 7,  unit: 'day' },
  '30d': { points: 30, unit: 'day' },
  '90d': { points: 13, unit: 'day' }, // weekly buckets for readability
  '1y':  { points: 12, unit: 'month' },
};

export const GROWTH_RANGES = Object.keys(RANGE_CONFIG);

export function getGrowthSeries(range) {
  const { points, unit } = RANGE_CONFIG[range] ?? RANGE_CONFIG['30d'];
  const labels = dateLabels(points, unit);
  const trendMul = range === '1y' ? 1 : range === '90d' ? 0.4 : range === '30d' ? 0.15 : 0.05;

  const users     = buildSeries(points, { base: 14500, trend: 0.012 * trendMul, seed: 101 + points });
  const creators  = buildSeries(points, { base: 5200,  trend: 0.014 * trendMul, seed: 202 + points });
  const brands    = buildSeries(points, { base: 980,   trend: 0.013 * trendMul, seed: 303 + points });
  const campaigns = buildSeries(points, { base: 620,   trend: 0.016 * trendMul, seed: 404 + points });

  return labels.map((label, i) => ({
    label,
    users: users[i],
    creators: creators[i],
    brands: brands[i],
    campaigns: campaigns[i],
  }));
}

/* ───────────────────────── Revenue Intelligence ───────────────────────── */

export const REVENUE_SUMMARY = {
  gmv:             84200000,
  platformRevenue: 12630000,
  escrowBalance:    5400000,
  creatorEarnings: 58900000,
  brandSpend:      84200000,
};

export const REVENUE_TREND = dateLabels(12, 'month').map((label, i) => ({
  label,
  revenue: buildSeries(12, { base: 9500000, trend: 0.025, volatility: 0.08, seed: 909 })[i],
}));

export const REVENUE_SOURCES = [
  { name: 'Campaign Fees',     value: 45, color: '#6d5cff' },
  { name: 'Subscriptions',     value: 25, color: '#857fff' },
  { name: 'Featured Listings', value: 18, color: '#f59e0b' },
  { name: 'Other',             value: 12, color: '#16b364' },
];

export const REVENUE_DISTRIBUTION = [
  { name: 'Creator Earnings',  value: 70, color: '#857fff' },
  { name: 'Platform Revenue',  value: 15, color: '#6d5cff' },
  { name: 'Escrow Balance',    value: 8,  color: '#f5a623' },
  { name: 'Refunds & Disputes', value: 7, color: '#f0445f' },
];

export const REVENUE_PROJECTION = (() => {
  const history = REVENUE_TREND.slice(-6).map((p) => ({ label: p.label, actual: p.revenue, projected: null }));
  const lastValue = history[history.length - 1].actual;
  const projection = dateLabels(6, 'month').map((label, i) => ({
    label: `+${i + 1}mo`,
    actual: null,
    projected: Math.round(lastValue * Math.pow(1.025, i + 1)),
  }));
  return [...history, ...projection];
})();

/* ───────────────────────── Trust & Safety Snapshot ───────────────────────── */

export const TRUST_SAFETY = [
  { id: 'pendingReports',   label: 'Pending Reports',      icon: '🚩', value: 23, severity: 'warning', trend: 4,  action: 'Review Reports' },
  { id: 'investigations',   label: 'Active Investigations', icon: '🔎', value: 5,  severity: 'danger',  trend: 1,  action: 'View Cases' },
  { id: 'suspiciousAccounts', label: 'Suspicious Accounts', icon: '👤', value: 12, severity: 'warning', trend: -2, action: 'Investigate' },
  { id: 'flaggedContent',   label: 'Flagged Content',      icon: '🖼️', value: 8,  severity: 'warning', trend: 0,  action: 'Moderate' },
  { id: 'paymentDisputes',  label: 'Payment Disputes',     icon: '⚖️', value: 3,  severity: 'danger',  trend: 1,  action: 'Resolve' },
];

/* ───────────────────────── AI Insights ───────────────────────── */

export const AI_INSIGHTS = [
  {
    id: 1,
    category: 'Growth',
    impact: 'high',
    confidence: 94,
    icon: '📈',
    text: 'Beauty campaigns grew 18% this week, outpacing all other niches.',
  },
  {
    id: 2,
    category: 'Retention',
    impact: 'medium',
    confidence: 88,
    icon: '✦',
    text: 'Creator retention improved by 6% after the new onboarding flow shipped.',
  },
  {
    id: 3,
    category: 'Brands',
    impact: 'high',
    confidence: 91,
    icon: '🏢',
    text: 'Three brands show unusually high growth — TechWave, Glowtique, and UrbanRoots.',
  },
  {
    id: 4,
    category: 'Campaigns',
    impact: 'high',
    confidence: 97,
    icon: '🚀',
    text: 'Campaign completion rate reached an all-time high of 88% this month.',
  },
  {
    id: 5,
    category: 'Risk',
    impact: 'medium',
    confidence: 76,
    icon: '🛡️',
    text: 'Report volume in the Lahore region is trending 12% above baseline — worth monitoring.',
  },
  {
    id: 6,
    category: 'Revenue',
    impact: 'medium',
    confidence: 85,
    icon: '💰',
    text: 'Featured-listing revenue is on pace to exceed last month by Rs 480,000.',
  },
];

/* ───────────────────────── Live Operations Feed ───────────────────────── */

const FEED_TEMPLATES = {
  users: [
    { icon: '🆕', text: (n) => `New creator registered — ${n}` },
    { icon: '✅', text: (n) => `Brand verified — ${n}` },
  ],
  campaigns: [
    { icon: '🚀', text: (n) => `Campaign launched — "${n}"` },
    { icon: '🤝', text: (n) => `Collaboration completed — ${n}` },
  ],
  payments: [
    { icon: '💸', text: (n) => `Payment released — Rs ${n.toLocaleString()} to creator` },
  ],
  safety: [
    { icon: '🚩', text: (n) => `Report submitted against ${n}` },
  ],
};

const FEED_NAMES = ['Laiba Khan', 'Ayesha Raza', 'TechWave', 'Glowtique', 'UrbanRoots', 'Bilal Ahmed', 'NovaWear', 'Sara Malik', 'PixelCraft', 'Zainab Tariq'];
const CAMPAIGN_NAMES = ['Summer Glow Launch', 'Eid Collection Drop', 'Tech Unboxing Series', 'Skincare Routine Push', 'Back to School Bundle'];

export function getLiveFeed(count = 24) {
  const rand = seededRandom(777);
  const out = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const types = Object.keys(FEED_TEMPLATES);
    const type = types[Math.floor(rand() * types.length)];
    const templates = FEED_TEMPLATES[type];
    const template = templates[Math.floor(rand() * templates.length)];
    const name = type === 'campaigns'
      ? CAMPAIGN_NAMES[Math.floor(rand() * CAMPAIGN_NAMES.length)]
      : FEED_NAMES[Math.floor(rand() * FEED_NAMES.length)];
    const value = type === 'payments' ? Math.round(2000 + rand() * 48000) : name;

    out.push({
      id: `feed-${i}`,
      type,
      icon: template.icon,
      text: template.text(value),
      timestamp: new Date(now - i * (3 + rand() * 14) * 60000).toISOString(),
    });
  }
  return out;
}

/* ───────────────────────── Global Search index ───────────────────────── */

export const SEARCH_INDEX = [
  { id: 'u-1', type: 'user',     label: 'Laiba Khan',    sub: 'Creator · Beauty & Lifestyle' },
  { id: 'u-2', type: 'user',     label: 'Ayesha Raza',   sub: 'Creator · Fashion' },
  { id: 'u-3', type: 'user',     label: 'Bilal Ahmed',   sub: 'Creator · Tech' },
  { id: 'b-1', type: 'brand',    label: 'TechWave',      sub: 'Brand · Technology' },
  { id: 'b-2', type: 'brand',    label: 'Glowtique',     sub: 'Brand · Beauty' },
  { id: 'b-3', type: 'brand',    label: 'UrbanRoots',    sub: 'Brand · Fashion' },
  { id: 'c-1', type: 'creator',  label: 'PixelCraft',    sub: 'Creator · Gaming' },
  { id: 'c-2', type: 'creator',  label: 'Zainab Tariq',  sub: 'Creator · Food' },
  { id: 'cm-1', type: 'campaign', label: 'Summer Glow Launch',     sub: 'Campaign · Active' },
  { id: 'cm-2', type: 'campaign', label: 'Eid Collection Drop',    sub: 'Campaign · Active' },
  { id: 'cm-3', type: 'campaign', label: 'Tech Unboxing Series',   sub: 'Campaign · Completed' },
  { id: 'cm-4', type: 'campaign', label: 'Back to School Bundle',  sub: 'Campaign · Draft' },
];

/* ───────────────────────── Advanced Filters ───────────────────────── */

export const FILTER_OPTIONS = {
  dateRange: ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'],
  region: ['All Regions', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'International'],
  industry: ['All Industries', 'Beauty', 'Fashion', 'Technology', 'Food & Beverage', 'Travel'],
  campaignType: ['All Types', 'Sponsored Post', 'Reel/Video', 'Unboxing', 'Long-term Partnership'],
  creatorCategory: ['All Categories', 'Nano (1K-10K)', 'Micro (10K-100K)', 'Mid (100K-500K)', 'Macro (500K+)'],
};
