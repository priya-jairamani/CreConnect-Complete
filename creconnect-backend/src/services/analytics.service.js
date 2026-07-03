const { fn, col } = require('sequelize');
const { Campaign, Collaboration, Application, Payment, CreatorProfile, BrandProfile, SocialPlatform, User } = require('../models');
const { ForbiddenError } = require('../utils/errors');

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

async function adminAnalytics() {
  const [users, campaigns, collabs, revenue] = await Promise.all([
    User.findAll({
      attributes: ['role', 'status', [fn('COUNT', col('id')), 'count']],
      group: ['role', 'status'],
      raw: true,
    }),
    Campaign.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Collaboration.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Payment.findOne({
      where: { status: 'RELEASED' },
      attributes: [[fn('SUM', col('amountPKR')), 'total']],
      raw: true,
    }),
  ]);

  return {
    users,
    campaigns,
    collaborations: collabs,
    totalRevenueReleasedPKR: parseFloat(revenue?.total || 0),
  };
}

module.exports = { brandAnalytics, creatorAnalytics, adminAnalytics };
