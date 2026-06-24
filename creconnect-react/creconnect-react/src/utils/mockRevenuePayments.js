/**
 * Mock data layer for the Admin "Revenue & Payments" financial command center.
 * Illustrative data only — wire up to dedicated finance/ledger endpoints once available.
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

const AVATAR_COLORS = ['#6d5cff', '#857fff', '#16b364', '#f59e0b', '#f0445f', '#0ea5e9', '#d946ef', '#10b981', '#f97316', '#6366f1'];

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

export const TRANSACTION_STATUS_META = {
  pending:    { label: 'Pending',    variant: 'neutral' },
  processing: { label: 'Processing', variant: 'brand' },
  completed:  { label: 'Completed',  variant: 'success' },
  failed:     { label: 'Failed',     variant: 'danger' },
  refunded:   { label: 'Refunded',   variant: 'warning' },
  disputed:   { label: 'Disputed',   variant: 'danger' },
  cancelled:  { label: 'Cancelled',  variant: 'neutral' },
};

export const RISK_LEVEL_META = {
  low:      { label: 'Low Risk',      variant: 'success' },
  medium:   { label: 'Medium Risk',   variant: 'brand' },
  high:     { label: 'High Risk',     variant: 'warning' },
  critical: { label: 'Critical Risk', variant: 'danger' },
};

export function riskLevelFor(score) {
  if (score >= 70) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

export const ESCROW_STATUS_META = {
  deposited:  { label: 'Funds Deposited',  variant: 'neutral' },
  locked:     { label: 'Escrow Locked',    variant: 'brand' },
  in_progress:{ label: 'Work In Progress', variant: 'brand' },
  review:     { label: 'Review',           variant: 'warning' },
  approved:   { label: 'Release Approved', variant: 'success' },
  released:   { label: 'Released',         variant: 'success' },
};

export const DISPUTE_STATUS_META = {
  open:       { label: 'Open',       variant: 'danger' },
  reviewing:  { label: 'Reviewing',  variant: 'warning' },
  resolved:   { label: 'Resolved',   variant: 'success' },
  rejected:   { label: 'Rejected',   variant: 'neutral' },
};

export const TRANSACTION_TIMELINE_STAGES = ['Initiated', 'Authorized', 'Escrowed', 'Released', 'Completed', 'Refunded'];

export const ESCROW_PIPELINE_STAGES = [
  { id: 'deposited',  label: 'Funds Deposited' },
  { id: 'locked',     label: 'Escrow Locked' },
  { id: 'in_progress',label: 'Work In Progress' },
  { id: 'review',     label: 'Review' },
  { id: 'approved',   label: 'Release Approved' },
  { id: 'released',   label: 'Released' },
];

export const PAYMENT_METHODS = ['Bank Transfer', 'JazzCash', 'EasyPaisa', 'Credit Card', 'PayPal'];
export const INDUSTRIES = ['Fashion', 'Beauty', 'Gaming', 'Technology', 'Fitness', 'Travel', 'Food', 'Education', 'Finance'];
export const CAMPAIGN_TYPES = ['Sponsored Post', 'Product Review', 'Unboxing', 'Brand Ambassador', 'Livestream', 'Giveaway', 'UGC Content'];
export const REGIONS = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital'];
export const CREATOR_CATEGORIES = ['Mega', 'Macro', 'Mid-Tier', 'Micro', 'Nano'];
export const BRAND_TIERS = ['Enterprise', 'Growth', 'SMB', 'Startup'];

const CREATOR_NAMES = [
  'Ayesha Khan', 'Bilal Ahmed', 'Sara Malik', 'Hamza Tariq', 'Zara Sheikh',
  'Usman Raza', 'Mahnoor Aslam', 'Ali Hassan', 'Fatima Noor', 'Danish Iqbal',
  'Mariam Yousaf', 'Omar Farooq', 'Hira Baig', 'Saad Mehmood', 'Komal Riaz',
];

const BRANDS = [
  { name: 'Khaadi', industry: 'Fashion' },
  { name: 'Foodpanda', industry: 'Food' },
  { name: 'Daraz', industry: 'Technology' },
  { name: 'Bonanza Satrangi', industry: 'Fashion' },
  { name: 'Telenor', industry: 'Technology' },
  { name: 'Engro Foods', industry: 'Food' },
  { name: 'J.', industry: 'Fashion' },
  { name: 'Careem', industry: 'Travel' },
  { name: 'Al-Fatah', industry: 'Beauty' },
  { name: 'HBL', industry: 'Finance' },
  { name: 'GulAhmed', industry: 'Fashion' },
  { name: 'NLC Fitness', industry: 'Fitness' },
];

const CAMPAIGN_THEMES = ['Summer Collection Launch', 'Ramadan Sale Push', 'Back to School Bundle', 'Winter Essentials Drop', 'App Install Drive', 'Brand Awareness Sprint', 'New Product Unboxing', 'Festive Season Campaign', 'Loyalty Rewards Push', 'Flagship Store Opening'];

/* ───────────────────────── Overview KPIs ───────────────────────── */

export const OVERVIEW_KPIS = [
  { id: 'gmv',        label: 'Gross Marketplace Volume', icon: '💰', value: 458_200_000, prevValue: 421_600_000, format: 'pkr',    sparkline: buildSeries(12, { base: 430_000_000, trend: 0.018, volatility: 0.05, seed: 11 }), accent: 'brand' },
  { id: 'platRev',    label: 'Platform Revenue',         icon: '🏦', value: 45_820_000,  prevValue: 41_240_000,  format: 'pkr',    sparkline: buildSeries(12, { base: 42_000_000, trend: 0.022, volatility: 0.05, seed: 12 }), accent: 'success' },
  { id: 'mrr',        label: 'Monthly Recurring Revenue', icon: '🔁', value: 12_400_000,  prevValue: 11_650_000,  format: 'pkr',    sparkline: buildSeries(12, { base: 11_000_000, trend: 0.02, volatility: 0.04, seed: 13 }), accent: 'brand' },
  { id: 'creatorEarn',label: 'Creator Earnings',          icon: '🎙️', value: 382_900_000, prevValue: 351_400_000, format: 'pkr',    sparkline: buildSeries(12, { base: 360_000_000, trend: 0.017, volatility: 0.05, seed: 14 }), accent: 'success' },
  { id: 'brandSpend', label: 'Brand Spending',            icon: '🏢', value: 458_200_000, prevValue: 421_600_000, format: 'pkr',    sparkline: buildSeries(12, { base: 430_000_000, trend: 0.018, volatility: 0.05, seed: 15 }), accent: 'brand' },
  { id: 'escrowBal',  label: 'Escrow Balance',            icon: '🔒', value: 34_650_000,  prevValue: 31_900_000,  format: 'pkr',    sparkline: buildSeries(12, { base: 32_000_000, trend: 0.012, volatility: 0.06, seed: 16 }), accent: 'warning' },
  { id: 'successRate',label: 'Payment Success Rate',      icon: '✅', value: 97.4,        prevValue: 96.8,        format: 'percent',sparkline: buildSeries(12, { base: 96, trend: 0.001, volatility: 0.01, seed: 17 }), accent: 'success' },
  { id: 'avgTxn',     label: 'Average Transaction Value', icon: '📊', value: 86_400,      prevValue: 82_100,      format: 'pkr',    sparkline: buildSeries(12, { base: 82_000, trend: 0.006, volatility: 0.05, seed: 18 }), accent: 'brand' },
];

/* ───────────────────── Financial Health Center ───────────────────── */

export const FINANCIAL_HEALTH_SCORE = 88;

export const FINANCIAL_HEALTH_FACTORS = [
  { key: 'paymentSuccess',  label: 'Payment Success Rate', score: 97 },
  { key: 'disputeRate',     label: 'Dispute Rate (inverse)', score: 91 },
  { key: 'escrowStability', label: 'Escrow Stability',     score: 86 },
  { key: 'revenueGrowth',   label: 'Revenue Growth',       score: 84 },
  { key: 'payoutCompletion',label: 'Payout Completion',    score: 89 },
];

export const FINANCIAL_HEALTH_TREND = buildSeries(14, { base: 84, trend: 0.003, volatility: 0.015, seed: 21 }).map((v) => clamp(v, 60, 99));

/* ───────────────────────── Revenue snapshot ───────────────────────── */

export const REVENUE_SNAPSHOT = {
  today:     { label: 'Today',        revenue: 1_840_000,  transactions: 142,  growthPct: 6.2,  activePayers: 98 },
  week:      { label: 'This Week',    revenue: 11_260_000, transactions: 968,  growthPct: 8.4,  activePayers: 421 },
  month:     { label: 'This Month',   revenue: 45_820_000, transactions: 4_120,growthPct: 11.1, activePayers: 1_340 },
  quarter:   { label: 'This Quarter', revenue: 132_400_000,transactions: 11_860,growthPct: 14.6,activePayers: 2_980 },
  year:      { label: 'This Year',    revenue: 458_200_000,transactions: 41_900,growthPct: 22.0,activePayers: 6_540 },
};

/* ───────────────────────── Revenue trend series ───────────────────────── */

const RANGE_CONFIG = {
  '7D':  { points: 7,  unit: 'day' },
  '30D': { points: 30, unit: 'day' },
  '90D': { points: 12, unit: 'week' },
  '1Y':  { points: 12, unit: 'month' },
  'ALL': { points: 24, unit: 'month' },
};

export const TIME_FILTERS = ['7D', '30D', '90D', '1Y', 'ALL'];

export function getRevenueSeries(range = '30D') {
  const cfg = RANGE_CONFIG[range] ?? RANGE_CONFIG['30D'];
  const labels = dateLabels(cfg.points, cfg.unit);
  const revenue         = buildSeries(cfg.points, { base: 1_400_000, trend: 0.01, volatility: 0.08, seed: 101 });
  const gmv              = buildSeries(cfg.points, { base: 14_000_000, trend: 0.01, volatility: 0.07, seed: 102 });
  const platformRevenue  = buildSeries(cfg.points, { base: 1_400_000, trend: 0.011, volatility: 0.08, seed: 103 });
  const creatorEarnings  = buildSeries(cfg.points, { base: 11_700_000, trend: 0.01, volatility: 0.07, seed: 104 });
  const brandSpend       = buildSeries(cfg.points, { base: 14_000_000, trend: 0.01, volatility: 0.07, seed: 105 });

  return labels.map((label, i) => ({
    label,
    revenue: revenue[i],
    gmv: gmv[i],
    platformRevenue: platformRevenue[i],
    creatorEarnings: creatorEarnings[i],
    brandSpend: brandSpend[i],
  }));
}

/* ───────────────────────── Revenue breakdowns ───────────────────────── */

function makeBreakdown(labels, seed) {
  const rand = seededRandom(seed);
  const raw = labels.map(() => 8 + rand() * 22);
  const total = raw.reduce((a, b) => a + b, 0);
  return labels.map((label, i) => {
    const pct = Math.round((raw[i] / total) * 1000) / 10;
    return { label, pct, value: Math.round((pct / 100) * 458_200_000) };
  });
}

export const REVENUE_BREAKDOWN = {
  byIndustry:       makeBreakdown(INDUSTRIES, 201),
  byCampaignType:   makeBreakdown(CAMPAIGN_TYPES, 202),
  byRegion:         makeBreakdown(REGIONS, 203),
  byCreatorCategory:makeBreakdown(CREATOR_CATEGORIES, 204),
  byBrandTier:      makeBreakdown(BRAND_TIERS, 205),
};

/* ───────────────────────── Transactions ───────────────────────── */

const TXN_STATUSES = ['completed', 'completed', 'completed', 'pending', 'processing', 'failed', 'refunded', 'disputed', 'cancelled', 'completed'];

function buildTimeline(status, seed) {
  const rand = seededRandom(seed);
  const order = ['Initiated', 'Authorized', 'Escrowed', 'Released', 'Completed'];
  const reachedIndex = {
    completed: 4, pending: 0, processing: 2, failed: 1, refunded: 5, disputed: 2, cancelled: 1,
  }[status] ?? 2;

  const stages = status === 'refunded'
    ? ['Initiated', 'Authorized', 'Escrowed', 'Refunded']
    : order;

  return stages.map((stage, i) => ({
    stage,
    date: i <= reachedIndex || status === 'refunded' ? daysAgo(Math.floor(rand() * 10) + (stages.length - i)) : null,
    completed: status === 'refunded' ? true : i <= reachedIndex,
  }));
}

export const TRANSACTIONS = Array.from({ length: 22 }, (_, i) => {
  const rand = seededRandom(300 + i);
  const brand = pick(rand, BRANDS);
  const creator = pick(rand, CREATOR_NAMES);
  const campaign = `${brand.name} ${pick(rand, CAMPAIGN_THEMES)}`;
  const amount = Math.round((20_000 + rand() * 480_000) / 100) * 100;
  const feeRate = 0.10;
  const fee = Math.round(amount * feeRate);
  const net = amount - fee;
  const status = pick(rand, TXN_STATUSES);
  const riskScore = clamp(rand() * 100, 1, 99);
  const id = `TXN-${(10450 + i).toString()}`;

  return {
    id,
    campaign,
    campaignType: pick(rand, CAMPAIGN_TYPES),
    brand: brand.name,
    industry: brand.industry,
    creator,
    creatorInitials: genInitials(creator),
    creatorColor: pick(rand, AVATAR_COLORS),
    amount,
    fee,
    net,
    status,
    method: pick(rand, PAYMENT_METHODS),
    date: daysAgo(Math.floor(rand() * 60)),
    riskScore,
    riskLevel: riskLevelFor(riskScore),
    timeline: buildTimeline(status, 400 + i),
    fees: {
      platformFee: fee,
      paymentProcessingFee: Math.round(amount * 0.015),
      taxWithholding: Math.round(amount * 0.005),
      total: fee + Math.round(amount * 0.015) + Math.round(amount * 0.005),
    },
    riskAnalysis: {
      score: riskScore,
      level: riskLevelFor(riskScore),
      flags: riskScore >= 60
        ? [pick(rand, ['Unusual transaction amount', 'New payer account', 'Multiple retries before success', 'Geo-mismatch detected'])]
        : [],
    },
    relatedCampaign: {
      id: `CMP-${(2200 + i)}`,
      name: campaign,
      brand: brand.name,
      budget: amount * (2 + Math.floor(rand() * 4)),
      status: pick(rand, ['Active', 'Completed', 'Paused']),
    },
    documents: [
      { id: `INV-${10450 + i}`, name: `Invoice_${10450 + i}.pdf`, type: 'Invoice', size: '128 KB' },
      { id: `RCT-${10450 + i}`, name: `Receipt_${10450 + i}.pdf`, type: 'Receipt', size: '64 KB' },
    ],
  };
});

/* ───────────────────────── Creator Payouts ───────────────────────── */

export const CREATOR_PAYOUT_METRICS = {
  totalCreatorEarnings: 382_900_000,
  pendingPayouts: 18_400_000,
  completedPayouts: 364_500_000,
  avgCreatorIncome: 285_000,
  highestEarningCreator: 'Ayesha Khan',
};

export const CREATOR_PAYOUTS = CREATOR_NAMES.map((name, i) => {
  const rand = seededRandom(500 + i);
  const totalEarnings = Math.round((1_200_000 + rand() * 8_800_000) / 1000) * 1000;
  const pendingAmount = Math.round(totalEarnings * (0.03 + rand() * 0.08));
  const paidAmount = totalEarnings - pendingAmount;
  return {
    id: `CR-${1000 + i}`,
    name,
    initials: genInitials(name),
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    campaigns: Math.floor(6 + rand() * 24),
    totalEarnings,
    pendingAmount,
    paidAmount,
    lastPayout: daysAgo(Math.floor(rand() * 20) + 1),
    status: pick(rand, ['Active', 'Active', 'Active', 'Under Review', 'Suspended']),
    taxStatus: pick(rand, ['Filed', 'Filed', 'Pending', 'Exempt']),
    revenueHistory: dateLabels(8, 'month').map((label, m) => ({ label, amount: buildSeries(8, { base: totalEarnings / 8, trend: 0.02, volatility: 0.12, seed: 600 + i * 8 + m })[m] })),
    campaignIncome: Array.from({ length: 4 }, () => ({
      campaign: `${pick(rand, BRANDS).name} ${pick(rand, CAMPAIGN_THEMES)}`,
      amount: Math.round((80_000 + rand() * 420_000) / 100) * 100,
    })),
    paymentReliability: clamp(85 + rand() * 14, 80, 99),
    payoutTimeline: Array.from({ length: 5 }, (_, p) => ({
      date: daysAgo(p * 14),
      amount: Math.round((60_000 + rand() * 260_000) / 100) * 100,
      status: p === 0 ? 'Pending' : 'Paid',
    })),
  };
});

export const TOP_CREATORS_LEADERBOARD = {
  revenue: [...CREATOR_PAYOUTS].sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5)
    .map((c) => ({ ...c, metricLabel: 'Earnings', metricValue: c.totalEarnings, metricFormat: 'pkr' })),
  campaignSuccess: [...CREATOR_PAYOUTS].sort((a, b) => b.campaigns - a.campaigns).slice(0, 5)
    .map((c) => ({ ...c, metricLabel: 'Campaigns Completed', metricValue: c.campaigns, metricFormat: 'number' })),
  engagementROI: [...CREATOR_PAYOUTS].sort((a, b) => b.paymentReliability - a.paymentReliability).slice(0, 5)
    .map((c) => ({ ...c, metricLabel: 'Engagement ROI', metricValue: clamp(180 + seededRandom(700 + c.id.length)() * 220, 150, 420), metricFormat: 'percent' })),
  brandSatisfaction: [...CREATOR_PAYOUTS].sort((a, b) => b.paymentReliability - a.paymentReliability).slice(0, 5)
    .map((c) => ({ ...c, metricLabel: 'Brand Satisfaction', metricValue: c.paymentReliability, metricFormat: 'percent' })),
};

/* ───────────────────────── Brand Spending ───────────────────────── */

export const BRAND_SPEND_METRICS = {
  totalBrandSpend: 458_200_000,
  activeSpending: 312_600_000,
  avgCampaignBudget: 640_000,
  highestSpendingBrand: 'Daraz',
  paymentReliability: 96.1,
};

export const BRAND_SPENDING = BRANDS.map((brand, i) => {
  const rand = seededRandom(800 + i);
  const totalSpend = Math.round((8_000_000 + rand() * 60_000_000) / 1000) * 1000;
  const pendingSpend = Math.round(totalSpend * (0.02 + rand() * 0.08));
  return {
    id: `BR-${2000 + i}`,
    name: brand.name,
    industry: brand.industry,
    initials: genInitials(brand.name),
    color: AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length],
    campaigns: Math.floor(4 + rand() * 20),
    totalSpend,
    pendingSpend,
    completedPayments: totalSpend - pendingSpend,
    paymentReliability: clamp(88 + rand() * 11, 85, 99),
    status: pick(rand, ['Active', 'Active', 'Active', 'On Hold']),
    spendingTrend: dateLabels(8, 'month').map((label, m) => ({ label, amount: buildSeries(8, { base: totalSpend / 8, trend: 0.018, volatility: 0.1, seed: 900 + i * 8 + m })[m] })),
    campaignBudgetHistory: Array.from({ length: 4 }, () => ({
      campaign: `${brand.name} ${pick(rand, CAMPAIGN_THEMES)}`,
      budget: Math.round((400_000 + rand() * 2_600_000) / 1000) * 1000,
    })),
    disputeHistory: rand() > 0.6 ? [{ id: `DSP-${3000 + i}`, amount: Math.round(totalSpend * 0.01), status: pick(rand, ['Resolved', 'Open']) }] : [],
    roiTrends: dateLabels(6, 'month').map((label, m) => ({ label, roi: clamp(120 + buildSeries(6, { base: 40, trend: 0.02, volatility: 0.15, seed: 950 + i * 6 + m })[m], 90, 320) })),
  };
});

export const TOP_SPENDING_BRANDS = {
  lifetimeSpend: [...BRAND_SPENDING].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5)
    .map((b) => ({ ...b, metricLabel: 'Lifetime Spend', metricValue: b.totalSpend, metricFormat: 'pkr' })),
  monthlySpend: [...BRAND_SPENDING].sort((a, b) => b.spendingTrend[7].amount - a.spendingTrend[7].amount).slice(0, 5)
    .map((b) => ({ ...b, metricLabel: 'Monthly Spend', metricValue: b.spendingTrend[7].amount, metricFormat: 'pkr' })),
  campaignVolume: [...BRAND_SPENDING].sort((a, b) => b.campaigns - a.campaigns).slice(0, 5)
    .map((b) => ({ ...b, metricLabel: 'Campaign Volume', metricValue: b.campaigns, metricFormat: 'number' })),
  creatorRetention: [...BRAND_SPENDING].sort((a, b) => b.paymentReliability - a.paymentReliability).slice(0, 5)
    .map((b) => ({ ...b, metricLabel: 'Creator Retention', metricValue: b.paymentReliability, metricFormat: 'percent' })),
};

/* ───────────────────────── Escrow & Disputes ───────────────────────── */

export const ESCROW_METRICS = {
  escrowBalance: 34_650_000,
  fundsLocked: 21_300_000,
  pendingReleases: 9_840_000,
  disputedFunds: 3_510_000,
  releasedFunds: 286_400_000,
};

export const ESCROW_PIPELINE = ESCROW_PIPELINE_STAGES.map((stage, i) => {
  const rand = seededRandom(1000 + i);
  const count = Math.floor(4 + rand() * 18);
  return { ...stage, count, amount: Math.round((400_000 + rand() * 3_600_000) / 1000) * 1000 };
});

export const ESCROW_TABLE = Array.from({ length: 16 }, (_, i) => {
  const rand = seededRandom(1100 + i);
  const brand = pick(rand, BRANDS);
  const creator = pick(rand, CREATOR_NAMES);
  const stage = pick(rand, ESCROW_PIPELINE_STAGES.map((s) => s.id));
  const daysHeld = Math.floor(1 + rand() * 28);
  const riskScore = clamp(rand() * 100, 1, 99);
  return {
    id: `ESC-${4400 + i}`,
    campaign: `${brand.name} ${pick(rand, CAMPAIGN_THEMES)}`,
    brand: brand.name,
    creator,
    creatorInitials: genInitials(creator),
    creatorColor: AVATAR_COLORS[(i + 5) % AVATAR_COLORS.length],
    amount: Math.round((60_000 + rand() * 540_000) / 100) * 100,
    status: stage,
    daysHeld,
    releaseDate: daysFromNow(Math.floor(rand() * 14) + 1),
    riskScore,
    riskLevel: riskLevelFor(riskScore),
  };
});

export const DISPUTE_METRICS = {
  openDisputes: 9,
  resolvedDisputes: 47,
  disputedAmount: 3_510_000,
  avgResolutionTimeHours: 38,
};

const DISPUTE_REASONS = ['Work not delivered as agreed', 'Content quality below brief', 'Late delivery past deadline', 'Unauthorized usage of content', 'Payment amount mismatch', 'Campaign cancelled mid-flight'];

export const PAYMENT_DISPUTES = Array.from({ length: 10 }, (_, i) => {
  const rand = seededRandom(1200 + i);
  const brand = pick(rand, BRANDS);
  const creator = pick(rand, CREATOR_NAMES);
  const status = pick(rand, ['open', 'open', 'reviewing', 'resolved', 'resolved', 'rejected']);
  return {
    id: `DSP-${5500 + i}`,
    campaign: `${brand.name} ${pick(rand, CAMPAIGN_THEMES)}`,
    brand: brand.name,
    creator,
    creatorInitials: genInitials(creator),
    creatorColor: AVATAR_COLORS[(i + 7) % AVATAR_COLORS.length],
    amount: Math.round((40_000 + rand() * 360_000) / 100) * 100,
    reason: pick(rand, DISPUTE_REASONS),
    evidence: [
      { id: `EV-${i}-1`, label: 'Conversation transcript' },
      { id: `EV-${i}-2`, label: 'Content delivery proof' },
      ...(rand() > 0.5 ? [{ id: `EV-${i}-3`, label: 'Payment receipt' }] : []),
    ],
    timeline: [
      { stage: 'Dispute Filed', date: daysAgo(14) },
      { stage: 'Evidence Submitted', date: daysAgo(11) },
      ...(status !== 'open' ? [{ stage: 'Under Review', date: daysAgo(6) }] : []),
      ...(status === 'resolved' || status === 'rejected' ? [{ stage: status === 'resolved' ? 'Resolved' : 'Rejected', date: daysAgo(2) }] : []),
    ],
    status,
    adminNotes: status === 'open' ? [] : [{ author: 'Admin Finance Team', note: 'Reviewed evidence and platform messaging logs.', date: daysAgo(3) }],
  };
});

/* ───────────────────────── Financial Analytics ───────────────────────── */

export const REVENUE_INTELLIGENCE = {
  revenueGrowth:        getRevenueSeries('1Y').map((d) => ({ label: d.label, value: d.revenue })),
  gmvGrowth:            getRevenueSeries('1Y').map((d) => ({ label: d.label, value: d.gmv })),
  payoutTrends:         getRevenueSeries('1Y').map((d) => ({ label: d.label, value: d.creatorEarnings })),
  spendingTrends:       getRevenueSeries('1Y').map((d) => ({ label: d.label, value: d.brandSpend })),
  profitTrends:         getRevenueSeries('1Y').map((d) => ({ label: d.label, value: Math.round(d.platformRevenue * 0.62) })),
};

export const MARKETPLACE_ECONOMICS = {
  takeRate: 10.0,
  revenuePerUser: 6_840,
  revenuePerCampaign: 38_200,
  avgCampaignValue: 412_000,
  creatorLifetimeValue: 1_840_000,
  brandLifetimeValue: 9_260_000,
};

export const INDUSTRY_ANALYTICS = INDUSTRIES.map((industry, i) => {
  const rand = seededRandom(1300 + i);
  return {
    industry,
    revenue: Math.round((18_000_000 + rand() * 64_000_000) / 1000) * 1000,
    roi: clamp(140 + rand() * 220, 100, 380),
    campaignVolume: Math.floor(40 + rand() * 240),
    creatorEarnings: Math.round((14_000_000 + rand() * 52_000_000) / 1000) * 1000,
  };
});

export const FORECASTING = {
  nextMonthRevenue: 51_200_000,
  expectedGMV: 498_000_000,
  projectedPayouts: 412_000_000,
  expectedGrowthPct: 11.7,
  series: (() => {
    const hist = getRevenueSeries('1Y').map((d) => ({ label: d.label, actual: d.revenue, forecast: null }));
    const lastVal = hist[hist.length - 1].actual;
    const future = dateLabels(3, 'month').map((label, i) => ({
      label: `${label} (F)`,
      actual: null,
      forecast: Math.round(lastVal * (1 + 0.04 * (i + 1))),
    }));
    // bridge point so the forecast line connects to the actual line
    hist[hist.length - 1].forecast = lastVal;
    return [...hist, ...future];
  })(),
};

export const AI_FINANCIAL_INSIGHTS = [
  { id: 'fin-1', icon: '💄', category: 'Revenue', impact: 'high',   confidence: 94, text: 'Beauty campaigns generated the highest revenue this month, up 28% from the prior month.' },
  { id: 'fin-2', icon: '📈', category: 'Growth',  impact: 'high',   confidence: 91, text: 'Platform revenue increased 22% compared to last quarter, driven by Fashion and Technology brands.' },
  { id: 'fin-3', icon: '🏢', category: 'Spending',impact: 'medium', confidence: 88, text: 'Five brands account for 34% of total platform spend, led by Daraz and Khaadi.' },
  { id: 'fin-4', icon: '🎙️', category: 'Payouts', impact: 'medium', confidence: 90, text: 'Creator payouts reached a new monthly record of PKR 38.2M, up 9% month-over-month.' },
  { id: 'fin-5', icon: '🔒', category: 'Escrow',  impact: 'low',    confidence: 82, text: 'Average escrow hold time decreased from 9.4 to 7.1 days following workflow automation.' },
  { id: 'fin-6', icon: '⚠️', category: 'Risk',    impact: 'medium', confidence: 86, text: 'Refund requests on Gaming campaigns rose 15% — recommend reviewing brief clarity for that vertical.' },
];

export const AI_RISK_DETECTION = {
  highRiskTransactions: TRANSACTIONS.filter((t) => t.riskLevel === 'critical' || t.riskLevel === 'high').slice(0, 6),
  potentialChargebacks: TRANSACTIONS.filter((t) => t.status === 'disputed').slice(0, 5),
  fraudulentPayments: TRANSACTIONS.filter((t) => t.riskScore >= 75).slice(0, 4),
  abnormalSpending: BRAND_SPENDING.filter((b) => b.totalSpend > 40_000_000).slice(0, 4),
  suspiciousRefunds: TRANSACTIONS.filter((t) => t.status === 'refunded').slice(0, 5),
};

export const FINANCIAL_ALERTS = [
  { id: 'al-1', type: 'Failed Payments', severity: 'high',   message: '6 payment attempts failed in the last 24 hours — JazzCash gateway timeout spike.', timestamp: daysAgo(0) },
  { id: 'al-2', type: 'High Refund Rates', severity: 'medium', message: 'Gaming category refund rate climbed to 4.8%, above the 3% threshold.', timestamp: daysAgo(1) },
  { id: 'al-3', type: 'Large Transactions', severity: 'medium', message: 'Transaction TXN-10468 (PKR 480,000) flagged for manual review.', timestamp: daysAgo(1) },
  { id: 'al-4', type: 'Suspicious Activity', severity: 'high', message: '3 accounts triggered velocity rules with rapid repeat transactions.', timestamp: daysAgo(2) },
  { id: 'al-5', type: 'Escrow Delays', severity: 'low', message: '4 escrow releases are pending beyond their scheduled release date.', timestamp: daysAgo(3) },
];

/* ───────────────────────── Filters ───────────────────────── */

export const TRANSACTION_FILTERS = [
  { key: 'status', label: 'Status', options: ['All', ...Object.keys(TRANSACTION_STATUS_META)] },
  { key: 'method', label: 'Payment Method', options: ['All', ...PAYMENT_METHODS] },
  { key: 'industry', label: 'Industry', options: ['All', ...INDUSTRIES] },
  { key: 'campaignType', label: 'Campaign Type', options: ['All', ...CAMPAIGN_TYPES] },
  { key: 'riskLevel', label: 'Risk Level', options: ['All', ...Object.keys(RISK_LEVEL_META)] },
];

export const BULK_ACTIONS = [
  { id: 'approve_releases', label: 'Approve Releases', icon: '✅' },
  { id: 'export_transactions', label: 'Export Transactions', icon: '⬇' },
  { id: 'flag_transactions', label: 'Flag Transactions', icon: '🚩' },
  { id: 'assign_reviews', label: 'Assign Reviews', icon: '🧑‍💼' },
  { id: 'generate_reports', label: 'Generate Reports', icon: '📄' },
];

/* ───────────────────────── Search index ───────────────────────── */

export const SEARCH_INDEX = [
  ...TRANSACTIONS.map((t) => ({ type: 'transaction', id: t.id, label: `${t.id} · ${t.campaign}`, sub: `${t.brand} → ${t.creator} · PKR ${t.amount.toLocaleString()}` })),
  ...CREATOR_PAYOUTS.map((c) => ({ type: 'creator', id: c.id, label: c.name, sub: `Creator · ${c.campaigns} campaigns` })),
  ...BRAND_SPENDING.map((b) => ({ type: 'brand', id: b.id, label: b.name, sub: `Brand · ${b.industry}` })),
  ...ESCROW_TABLE.map((e) => ({ type: 'campaign', id: e.id, label: e.campaign, sub: `${e.brand} → ${e.creator}` })),
  ...PAYMENT_DISPUTES.map((d) => ({ type: 'dispute', id: d.id, label: `${d.id} · ${d.campaign}`, sub: `${d.brand} → ${d.creator} · ${DISPUTE_STATUS_META[d.status]?.label ?? d.status}` })),
];
