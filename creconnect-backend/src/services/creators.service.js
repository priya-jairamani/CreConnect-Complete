const { CreatorProfile, SocialPlatform, Collaboration, Application, User, Campaign, BrandProfile, CreatorMedia } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const stripe = require('../config/stripe');
const { FRONTEND_URL } = require('../config/env');

const CREATOR_INCLUDE = [
  { model: User,           as: 'user',      attributes: ['id', 'email', 'status', 'createdAt'] },
  { model: SocialPlatform, as: 'platforms' },
];

async function getMyProfile(userId) {
  const profile = await CreatorProfile.findOne({ where: { userId }, include: CREATOR_INCLUDE });
  if (!profile) throw new NotFoundError('Creator profile not found');
  return profile;
}

async function updateMyProfile(userId, data) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  await profile.update(data);
  return profile.reload({ include: CREATOR_INCLUDE });
}

// Creates (if needed) a Stripe Connect Express account for this creator and
// returns a fresh onboarding link — Stripe hosts identity/bank verification.
async function startPayoutOnboarding(userId) {
  const profile = await CreatorProfile.findOne({ where: { userId }, include: [{ model: User, as: 'user' }] });
  if (!profile) throw new NotFoundError('Creator profile not found');

  let accountId = profile.stripeConnectAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: profile.user?.email,
      capabilities: { transfers: { requested: true } },
    });
    accountId = account.id;
    await profile.update({ stripeConnectAccountId: accountId });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${FRONTEND_URL}/creator/payments?payouts=refresh`,
    return_url: `${FRONTEND_URL}/creator/payments?payouts=onboarded`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}

// Called from the Stripe webhook (account.updated) to keep payoutsEnabled in sync
async function syncPayoutStatus(account) {
  const profile = await CreatorProfile.findOne({ where: { stripeConnectAccountId: account.id } });
  if (!profile) return;
  await profile.update({ payoutsEnabled: !!account.payouts_enabled });
}

// Called when the creator returns from Stripe onboarding — checks status directly
// rather than waiting on a webhook (which may be delayed or, for accounts on newer
// Stripe API versions, delivered as a v2 event this endpoint doesn't listen for).
async function refreshPayoutStatus(userId) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  if (!profile.stripeConnectAccountId) return profile;

  const account = await stripe.accounts.retrieve(profile.stripeConnectAccountId);
  await profile.update({ payoutsEnabled: !!account.payouts_enabled });
  return profile;
}

async function getStats(userId) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');

  const [total, completed] = await Promise.all([
    Collaboration.count({ where: { creatorId: profile.id } }),
    Collaboration.count({ where: { creatorId: profile.id, status: 'COMPLETED' } }),
  ]);

  return {
    totalCollaborations: total,
    completedCollaborations: completed,
    followerCount:  profile.followerCount,
    engagementRate: profile.engagementRate,
    rating:         profile.rating,
  };
}

async function getMyCollaborations(userId, query) {
  const { offset, limit, page } = parsePagination(query);
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');

  const where = { creatorId: profile.id };
  if (query.status) where.status = query.status.toUpperCase();

  const { rows, count } = await Collaboration.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Campaign,     as: 'campaign', attributes: ['title', 'objective'] },
      { model: BrandProfile, as: 'brand',    attributes: ['userId', 'companyName', 'logoUrl'] },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function getMyOffers(userId) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');

  return Application.findAll({
    where: { creatorId: profile.id, status: ['PENDING', 'INVITED'] },
    order: [['createdAt', 'DESC']],
    include: [{ model: Campaign, as: 'campaign', include: [{ model: BrandProfile, as: 'brand' }] }],
  });
}

async function getMyApplications(userId) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');

  return Application.findAll({
    where: { creatorId: profile.id },
    order: [['createdAt', 'DESC']],
    include: [{ model: Campaign, as: 'campaign', include: [{ model: BrandProfile, as: 'brand' }] }],
  });
}

async function addPlatform(userId, data) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  return SocialPlatform.create({ ...data, creatorId: profile.id });
}

async function removePlatform(userId, platformId) {
  const platform = await SocialPlatform.findByPk(platformId);
  if (!platform) throw new NotFoundError('Platform not found');
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile || platform.creatorId !== profile.id) throw new ForbiddenError();
  await platform.destroy();
}

async function getPublicProfile(username) {
  const profile = await CreatorProfile.findOne({
    where: { username },
    attributes: { exclude: ['stripeConnectAccountId'] },
    include: [...CREATOR_INCLUDE],
  });
  if (!profile) throw new NotFoundError('Creator not found');
  return profile;
}

async function getMedia(userId, params = {}) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  const where = { creatorId: profile.id };
  if (params.visibility) where.visibility = params.visibility;
  if (params.platform)   where.platform   = params.platform;
  return CreatorMedia.findAll({ where, order: [['order','ASC'],['createdAt','DESC']] });
}

// Public: any authenticated user (brands, creators) can view another creator's public media
async function getPublicMedia(creatorProfileId) {
  return CreatorMedia.findAll({
    where: { creatorId: creatorProfileId, visibility: 'PUBLIC' },
    order: [['isFeatured','DESC'],['createdAt','DESC']],
    limit: 30,
  });
}

async function addMedia(userId, data) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  const clean = { ...data, creatorId: profile.id };
  if (clean.visibility) clean.visibility = clean.visibility.toUpperCase();
  return CreatorMedia.create(clean);
}

async function updateMedia(userId, mediaId, data) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  const item = await CreatorMedia.findOne({ where: { id: mediaId, creatorId: profile.id } });
  if (!item) throw new NotFoundError('Media not found');
  const clean = { ...data };
  if (clean.visibility) clean.visibility = clean.visibility.toUpperCase();
  await item.update(clean);
  return item;
}

async function deleteMedia(userId, mediaId) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  const item = await CreatorMedia.findOne({ where: { id: mediaId, creatorId: profile.id } });
  if (!item) throw new NotFoundError('Media not found');
  await item.destroy();
}

async function setFeatured(userId, mediaId, isFeatured) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  const item = await CreatorMedia.findOne({ where: { id: mediaId, creatorId: profile.id } });
  if (!item) throw new NotFoundError('Media not found');
  await item.update({ isFeatured });
  return item;
}

async function reorderMedia(userId, orderedIds) {
  const profile = await CreatorProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Creator profile not found');
  await Promise.all(
    orderedIds.map((id, idx) =>
      CreatorMedia.update({ order: idx }, { where: { id, creatorId: profile.id } })
    )
  );
}

module.exports = { getMyProfile, updateMyProfile, getStats, getMyCollaborations, getMyOffers, getMyApplications, addPlatform, removePlatform, getPublicProfile, getMedia, getPublicMedia, addMedia, updateMedia, deleteMedia, setFeatured, reorderMedia, startPayoutOnboarding, syncPayoutStatus, refreshPayoutStatus };
