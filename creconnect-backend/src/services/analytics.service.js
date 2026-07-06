const { fn, col, Op } = require('sequelize');
const {
  Campaign, Collaboration, Application, Payment, CreatorProfile, BrandProfile,
  SocialPlatform, User, Report, Message,
} = require('../models');
const { ForbiddenError } = require('../utils/errors');
const adminSvc = require('./admin.service');

// Buckets real, already-released payments into the last 6 calendar months (oldest first),
// filling zero for months with no releases — so the chart reflects actual history, not a
// single lump total.
function monthlySeries(payments) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, period: d.toLocaleDateString('en-US', { month: 'short' }), amount: 0 });
  }
  const byKey = new Map(months.map((m) => [m.key, m]));
  for (const p of payments) {
    const d = new Date(p.releasedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.amount += Number(p.amountPKR) || 0;
  }
  return months;
}

async function brandAnalytics(userId) {
  const brand = await BrandProfile.findOne({ where: { userId } });
  if (!brand) throw new ForbiddenError();

  const [campaigns, collabs, pendingApps, totalSpend] = await Promise.all([
    Campaign.findAll({
      where: { brandId: brand.id },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Collaboration.findAll({
      where: { brandId: brand.id },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Application.count({
      where: { '$campaign.brandId$': brand.id, status: 'PENDING' },
      include: [{ model: Campaign, as: 'campaign', attributes: [] }],
    }),
    Payment.findAll({
      where: { '$collaboration.brandId$': brand.id, status: 'RELEASED' },
      attributes: ['amountPKR', 'releasedAt'],
      include: [{ model: Collaboration, as: 'collaboration', attributes: [] }],
      raw: true,
    }),
  ]);

  const total    = campaigns.reduce((s, r) => s + Number(r.count), 0);
  const active   = collabs.find((r) => r.status === 'ACCEPTED');
  const spent    = totalSpend.reduce((s, p) => s + (Number(p.amountPKR) || 0), 0);

  return {
    metrics: {
      totalCampaigns:       total,
      activeCollaborations: active ? Number(active.count) : 0,
      pendingOffers:        pendingApps,
      messagesWaiting:      0,
      totalSpend:           spent,
      // No real reach data source exists yet — synced social posts aren't linked to a
      // specific campaign, so this can't be honestly computed. Left at 0 rather than faked.
      totalReach:           0,
    },
    spendSeries:  monthlySeries(totalSpend),
    reachSeries:  [],
  };
}

async function creatorAnalytics(userId) {
  const creator = await CreatorProfile.findOne({
    where: { userId },
    include: [{ model: SocialPlatform, as: 'platforms' }],
  });
  if (!creator) throw new ForbiddenError();

  const [collabs, earnings] = await Promise.all([
    Collaboration.findAll({
      where: { creatorId: creator.id },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Payment.findAll({
      where: { '$collaboration.creatorId$': creator.id, status: 'RELEASED' },
      attributes: ['amountPKR', 'releasedAt'],
      include: [{ model: Collaboration, as: 'collaboration', attributes: [] }],
      raw: true,
    }),
  ]);

  const active       = collabs.find((r) => r.status === 'ACCEPTED');
  const totalEarned  = earnings.reduce((s, p) => s + (Number(p.amountPKR) || 0), 0);

  return {
    metrics: {
      activeCollaborations: active ? Number(active.count) : 0,
      totalEarnings:        totalEarned,
    },
    platforms: (creator.platforms || []).map((p) => ({
      name:           p.name,
      handle:         p.handle,
      followerCount:  p.followerCount,
      engagementRate: p.engagementRate,
    })),
    earningsSeries: monthlySeries(earnings),
  };
}

/* ── Admin dashboard helpers ──────────────────────────────────────────── */

// Builds `points` bucket boundaries ending "now", each truncated to the start of its unit.
function dateBuckets(points, unit) {
  const now = new Date();
  const out = [];
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now);
    if (unit === 'day')   d.setDate(d.getDate() - i);
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    d.setHours(0, 0, 0, 0);
    if (unit === 'month') d.setDate(1);
    out.push(d);
  }
  return out;
}

function bucketKey(date, unit) {
  const iso = new Date(date).toISOString();
  return unit === 'month' ? iso.slice(0, 7) : iso.slice(0, 10);
}

// Real cumulative running-total series (not new-per-period) — e.g. total users as of each day.
async function cumulativeSeries(Model, where, points, unit) {
  const buckets    = dateBuckets(points, unit);
  const rangeStart = buckets[0];

  const [baseCount, rows] = await Promise.all([
    Model.count({ where: { ...where, createdAt: { [Op.lt]: rangeStart } } }),
    Model.findAll({
      where: { ...where, createdAt: { [Op.gte]: rangeStart } },
      attributes: [[fn('date_trunc', unit, col('createdAt')), 'period'], [fn('COUNT', col('id')), 'count']],
      group: [fn('date_trunc', unit, col('createdAt'))],
      raw: true,
    }),
  ]);

  const countByKey = new Map(rows.map((r) => [bucketKey(r.period, unit), Number(r.count)]));
  let running = baseCount;
  return buckets.map((d) => {
    running += countByKey.get(bucketKey(d, unit)) || 0;
    return { label: unit === 'month' ? d.toLocaleDateString('en-US', { month: 'short' }) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: running };
  });
}

const RANGE_CONFIG = {
  '7d':  { points: 7,  unit: 'day' },
  '30d': { points: 30, unit: 'day' },
  '90d': { points: 90, unit: 'day' },
  '1y':  { points: 12, unit: 'month' },
};

async function getGrowthSeries(range) {
  const { points, unit } = RANGE_CONFIG[range] ?? RANGE_CONFIG['30d'];
  const [users, creators, brands, campaigns] = await Promise.all([
    cumulativeSeries(User, {}, points, unit),
    cumulativeSeries(User, { role: 'CREATOR' }, points, unit),
    cumulativeSeries(User, { role: 'BRAND' }, points, unit),
    cumulativeSeries(Campaign, {}, points, unit),
  ]);
  return users.map((u, i) => ({
    label: u.label, users: u.value, creators: creators[i].value, brands: brands[i].value, campaigns: campaigns[i].value,
  }));
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function adminAnalytics(range = '30d') {
  const today = startOfToday();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo  = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    users, campaigns, collabs, reports,
    totalUsersNow, totalUsersPrevWindow,
    activeCreatorsNow, activeCreatorsPrevWindow,
    activeBrandsNow, activeBrandsPrevWindow,
    activeCampaignsNow, activeCampaignsPrevWindow,
    creatorsWithRecentActivity, totalCreators,
    revenue,
    campaignsToday, collabsToday, messagesToday, paymentsReleasedToday,
    growthSeries,
    recentUsers, recentCampaigns, recentPayments, recentReports,
  ] = await Promise.all([
    User.findAll({ attributes: ['role', 'status', [fn('COUNT', col('id')), 'count']], group: ['role', 'status'], raw: true }),
    Campaign.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
    Collaboration.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
    Report.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),

    User.count(),
    User.count({ where: { createdAt: { [Op.lt]: thirtyDaysAgo } } }),
    User.count({ where: { role: 'CREATOR' } }),
    User.count({ where: { role: 'CREATOR', createdAt: { [Op.lt]: thirtyDaysAgo } } }),
    User.count({ where: { role: 'BRAND' } }),
    User.count({ where: { role: 'BRAND', createdAt: { [Op.lt]: thirtyDaysAgo } } }),
    Campaign.count({ where: { status: 'PUBLISHED' } }),
    Campaign.count({ where: { status: 'PUBLISHED', createdAt: { [Op.lt]: thirtyDaysAgo } } }),

    CreatorProfile.count({
      where: { '$collaborations.createdAt$': { [Op.gte]: ninetyDaysAgo } },
      include: [{ model: Collaboration, as: 'collaborations', attributes: [] }],
      distinct: true,
      col: 'id',
    }),
    CreatorProfile.count(),

    adminSvc.getRevenueSummary(),

    Campaign.count({ where: { createdAt: { [Op.gte]: today } } }),
    Collaboration.count({ where: { createdAt: { [Op.gte]: today } } }),
    Message.count({ where: { createdAt: { [Op.gte]: today } } }),
    Payment.count({ where: { status: { [Op.in]: ['RELEASED', 'PAID'] }, releasedAt: { [Op.gte]: today } } }),

    getGrowthSeries(range),

    User.findAll({ attributes: ['id', 'email', 'role', 'createdAt'], order: [['createdAt', 'DESC']], limit: 8, raw: true }),
    Campaign.findAll({ attributes: ['id', 'title', 'createdAt'], order: [['createdAt', 'DESC']], limit: 8, raw: true }),
    Payment.findAll({ where: { status: { [Op.in]: ['RELEASED', 'PAID'] } }, attributes: ['id', 'amountPKR', 'releasedAt'], order: [['releasedAt', 'DESC']], limit: 8, raw: true }),
    Report.findAll({ attributes: ['id', 'violationType', 'createdAt'], order: [['createdAt', 'DESC']], limit: 8, raw: true }),
  ]);

  const pctChange = (now, prev) => (prev > 0 ? Number((((now - prev) / prev) * 100).toFixed(1)) : 0);

  const campaignStatusCount = (status) => Number(campaigns.find((c) => c.status === status)?.count || 0);

  const totalCampaignsAll = campaigns.reduce((s, c) => s + Number(c.count), 0);
  const completedCampaigns = campaignStatusCount('COMPLETED');
  const campaignCompletionPct = totalCampaignsAll > 0 ? Math.round((completedCampaigns / totalCampaignsAll) * 100) : 0;

  const pendingReports  = Number(reports.find((r) => r.status === 'OPEN')?.count || 0);
  const resolvedReports = Number(reports.find((r) => r.status === 'RESOLVED')?.count || 0);
  const totalReportsAll = reports.reduce((s, r) => s + Number(r.count), 0);

  const paymentStatusCounts = await Payment.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true });
  const totalPayments   = paymentStatusCounts.reduce((s, p) => s + Number(p.count), 0);
  const settledPayments = paymentStatusCounts
    .filter((p) => ['RELEASED', 'PAID'].includes(p.status))
    .reduce((s, p) => s + Number(p.count), 0);
  const paymentSuccessPct = totalPayments > 0 ? Math.round((settledPayments / totalPayments) * 100) : 100;

  const creatorRetentionPct = totalCreators > 0 ? Math.round((creatorsWithRecentActivity / totalCreators) * 100) : 0;

  const kpis = {
    totalUsers:       { value: totalUsersNow,       changePct: pctChange(totalUsersNow, totalUsersPrevWindow) },
    activeCreators:   { value: activeCreatorsNow,   changePct: pctChange(activeCreatorsNow, activeCreatorsPrevWindow) },
    activeBrands:     { value: activeBrandsNow,     changePct: pctChange(activeBrandsNow, activeBrandsPrevWindow) },
    activeCampaigns:  { value: activeCampaignsNow,  changePct: pctChange(activeCampaignsNow, activeCampaignsPrevWindow) },
    monthlyRevenue:   { value: revenue.platformRevenue },
    gmv:              { value: revenue.gmv },
  };

  const platformHealth = {
    breakdown: [
      { id: 'userGrowth',      label: 'User Growth',        value: Math.min(100, Math.max(0, 50 + kpis.totalUsers.changePct)),   detail: `${kpis.totalUsers.changePct >= 0 ? '+' : ''}${kpis.totalUsers.changePct}% vs prior 30 days` },
      { id: 'campaignSuccess', label: 'Campaign Completion', value: campaignCompletionPct,                                        detail: `${campaignCompletionPct}% of campaigns reach completion` },
      { id: 'retention',       label: 'Creator Retention',   value: creatorRetentionPct,                                          detail: `${creatorRetentionPct}% of creators active in the last 90 days (approximation — no login tracking exists)` },
      { id: 'payments',        label: 'Payment Success',     value: paymentSuccessPct,                                            detail: `${paymentSuccessPct}% of payments settle without dispute` },
      { id: 'reportVolume',    label: 'Report Volume',       value: totalUsersNow > 0 ? Math.max(0, 100 - Math.round((totalReportsAll / totalUsersNow) * 1000)) : 100, detail: `${totalReportsAll} reports filed vs ${totalUsersNow} total users` },
    ],
  };

  const marketplaceActivityToday = {
    campaignsToday, collabsStarted: collabsToday, messagesToday, paymentsReleasedToday,
  };

  const trustSafety = {
    pendingReports, resolvedReports, paymentDisputes: revenue.disputes.length,
  };

  const feed = [
    ...recentUsers.map((u) => ({ id: `user-${u.id}`, type: 'user', text: `New ${u.role.toLowerCase()} registered — ${u.email}`, timestamp: u.createdAt })),
    ...recentCampaigns.map((c) => ({ id: `campaign-${c.id}`, type: 'campaign', text: `Campaign launched — "${c.title}"`, timestamp: c.createdAt })),
    ...recentPayments.map((p) => ({ id: `payment-${p.id}`, type: 'payment', text: `Payment released — Rs ${Number(p.amountPKR).toLocaleString()}`, timestamp: p.releasedAt })),
    ...recentReports.map((r) => ({ id: `report-${r.id}`, type: 'report', text: `Report submitted — ${r.violationType}`, timestamp: r.createdAt })),
  ]
    .filter((e) => e.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);

  return {
    users, campaigns, collaborations: collabs,
    totalRevenueReleasedPKR: revenue.creatorEarnings + revenue.platformRevenue,
    kpis,
    platformHealth,
    marketplaceActivityToday,
    growthSeries,
    revenue,
    trustSafety,
    feed,
  };
}

module.exports = { brandAnalytics, creatorAnalytics, adminAnalytics };
