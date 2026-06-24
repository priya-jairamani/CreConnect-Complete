const { fn, col } = require('sequelize');
const { Campaign, Collaboration, Application, Payment, CreatorProfile, BrandProfile, SocialPlatform, User } = require('../models');
const { ForbiddenError } = require('../utils/errors');

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
    Payment.findOne({
      where: { '$collaboration.brandId$': brand.id, status: 'RELEASED' },
      attributes: [[fn('SUM', col('amountPKR')), 'total']],
      include: [{ model: Collaboration, as: 'collaboration', attributes: [] }],
      raw: true,
    }),
  ]);

  const total    = campaigns.reduce((s, r) => s + Number(r.count), 0);
  const active   = collabs.find((r) => r.status === 'ACCEPTED');
  const spent    = parseFloat(totalSpend?.total || 0);

  return {
    metrics: {
      totalCampaigns:       total,
      activeCollaborations: active ? Number(active.count) : 0,
      pendingOffers:        pendingApps,
      messagesWaiting:      0,
      totalSpend:           spent,
      totalReach:           0,
    },
    spendSeries:  spent ? [{ amount: spent }] : [],
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
    Payment.findOne({
      where: { '$collaboration.creatorId$': creator.id, status: 'RELEASED' },
      attributes: [[fn('SUM', col('amountPKR')), 'total']],
      include: [{ model: Collaboration, as: 'collaboration', attributes: [] }],
      raw: true,
    }),
  ]);

  const active       = collabs.find((r) => r.status === 'ACCEPTED');
  const totalEarned  = parseFloat(earnings?.total || 0);

  return {
    metrics: {
      activeCollaborations: active ? Number(active.count) : 0,
      totalEarnings:        totalEarned,
    },
    platforms: (creator.platforms || []).map((p) => ({
      name:           p.name,
      handle:         p.handle,
      followerCount:  p.followerCount,
      engagementRate: creator.engagementRate,
    })),
    earningsSeries: totalEarned ? [{ amount: totalEarned, period: 'Total' }] : [],
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
