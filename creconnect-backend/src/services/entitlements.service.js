const { Op } = require('sequelize');
const { Subscription, Campaign, Collaboration, User, BrandProfile, CreatorProfile } = require('../models');
const { getPlan } = require('../config/plans');
const { ForbiddenError } = require('../utils/errors');

// The most recent monthly anniversary of `createdAt` that has already happened —
// this is the free-tier equivalent of a Stripe billing period start, computed
// on the fly with no extra column needed.
function freeTierPeriodStart(createdAt, now = new Date()) {
  const anchorDay = createdAt.getDate();
  let candidate = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  if (candidate > now) candidate = new Date(now.getFullYear(), now.getMonth() - 1, anchorDay);
  return candidate;
}

async function getSubscription(userId) {
  return Subscription.findOne({ where: { userId } });
}

// Returns the plan definition + period window currently in effect for this user.
// Limits for an ACTIVE subscription come from the Subscription row itself (set from
// the plan catalog at checkout/grant time), not re-derived from the catalog by tier
// name — this lets an admin-granted Enterprise row carry custom, per-customer limits
// instead of always being a hardcoded "unlimited".
async function getEffectivePlan(userId, role) {
  const sub = await getSubscription(userId);

  if (sub && sub.status === 'ACTIVE') {
    return {
      tier: sub.planTier,
      plan: {
        campaignLimit: sub.campaignLimit,
        collabLimit: sub.collabLimit,
        collabLimitPerCampaign: null, // only the free tier has a per-campaign cap
        aiEnabled: sub.aiEnabled,
      },
      periodStart: sub.currentPeriodStart ?? new Date(0),
      periodEnd: sub.currentPeriodEnd ?? null,
    };
  }

  const user = await User.findByPk(userId, { attributes: ['createdAt'] });
  const periodStart = freeTierPeriodStart(user?.createdAt ?? new Date());
  return { tier: 'FREE', plan: getPlan(role, 'FREE'), periodStart, periodEnd: null };
}

async function canCreateCampaign(brandUserId) {
  const brand = await BrandProfile.findOne({ where: { userId: brandUserId } });
  const { plan, periodStart } = await getEffectivePlan(brandUserId, 'BRAND');

  if (plan.campaignLimit === null) return; // unlimited

  const usedThisPeriod = await Campaign.count({
    where: { brandId: brand.id, createdAt: { [Op.gte]: periodStart } },
  });
  if (usedThisPeriod >= plan.campaignLimit) {
    throw new ForbiddenError(
      `Your plan allows ${plan.campaignLimit} new campaign(s) per month — you've used all of them this period. Upgrade to create more.`
    );
  }
}

// Free-tier-only: a single campaign can have at most `collabLimitPerCampaign` accepted creators.
async function canAcceptCreatorOnCampaign(campaignId, brandUserId) {
  const { plan } = await getEffectivePlan(brandUserId, 'BRAND');
  if (plan.collabLimitPerCampaign === null || plan.collabLimitPerCampaign === undefined) return; // no per-campaign cap on this plan

  const acceptedCount = await Collaboration.count({ where: { campaignId, status: 'ACCEPTED' } });
  if (acceptedCount >= plan.collabLimitPerCampaign) {
    throw new ForbiddenError(
      `Your plan allows at most ${plan.collabLimitPerCampaign} creators per campaign. Upgrade to work with more creators on this campaign.`
    );
  }
}

async function canAcceptCollaboration(creatorUserId) {
  const creator = await CreatorProfile.findOne({ where: { userId: creatorUserId } });
  const { plan, periodStart } = await getEffectivePlan(creatorUserId, 'CREATOR');

  if (plan.collabLimit === null) return; // unlimited

  const usedThisPeriod = await Collaboration.count({
    where: { creatorId: creator.id, createdAt: { [Op.gte]: periodStart } },
  });
  if (usedThisPeriod >= plan.collabLimit) {
    throw new ForbiddenError(
      `Your plan allows ${plan.collabLimit} new brand collaboration(s) per month — you've used all of them this period. Upgrade to accept more.`
    );
  }
}

async function hasAI(userId, role) {
  const { plan } = await getEffectivePlan(userId, role);
  return !!plan.aiEnabled;
}

module.exports = {
  freeTierPeriodStart,
  getSubscription,
  getEffectivePlan,
  canCreateCampaign,
  canAcceptCreatorOnCampaign,
  canAcceptCollaboration,
  hasAI,
};
