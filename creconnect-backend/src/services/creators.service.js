const { CreatorProfile, SocialPlatform, Collaboration, Application, User, Campaign, BrandProfile, CreatorMedia } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');

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

module.exports = { getMyProfile, updateMyProfile, getStats, getMyCollaborations, getMyOffers, getMyApplications, addPlatform, removePlatform, getPublicProfile, getMedia, getPublicMedia, addMedia, updateMedia, deleteMedia, setFeatured, reorderMedia };
