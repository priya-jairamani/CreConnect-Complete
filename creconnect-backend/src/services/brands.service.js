const { Op } = require('sequelize');
const { BrandProfile, Campaign, Application, Collaboration, CreatorProfile, SocialPlatform, User, AuditLog } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const { logActivity } = require('../utils/activity');

async function getMyProfile(userId) {
  const profile = await BrandProfile.findOne({
    where: { userId },
    include: [{ model: User, as: 'user', attributes: ['email', 'status', 'createdAt'] }],
  });
  if (!profile) throw new NotFoundError('Brand profile not found');
  return profile;
}

async function updateMyProfile(userId, data) {
  const profile = await BrandProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Brand profile not found');
  await profile.update(data);
  logActivity(userId, 'profile.updated', { entity: 'brand_profile', entityId: String(profile.id), meta: { fields: Object.keys(data) } });
  return profile.reload({
    include: [{ model: User, as: 'user', attributes: ['email', 'status', 'createdAt'] }],
  });
}

async function getStats(userId) {
  const profile = await BrandProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Brand profile not found');

  const [campaigns, activeCollabs, completedCollabs] = await Promise.all([
    Campaign.count({ where: { brandId: profile.id } }),
    Collaboration.count({ where: { brandId: profile.id, status: 'ACCEPTED' } }),
    Collaboration.count({ where: { brandId: profile.id, status: 'COMPLETED' } }),
  ]);

  return { totalCampaigns: campaigns, activeCollaborations: activeCollabs, completedCollaborations: completedCollabs };
}

async function getMyCampaigns(userId, query) {
  const { offset, limit, page } = parsePagination(query);
  const profile = await BrandProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Brand profile not found');

  const where = { brandId: profile.id };
  if (query.status) where.status = query.status.toUpperCase();

  const { rows, count } = await Campaign.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Collaboration,
        as: 'collaborations',
        required: false,
        where: { status: 'ACCEPTED' },
        include: [{
          model: CreatorProfile,
          as: 'creator',
          attributes: ['id', 'displayName', 'username', 'avatarUrl'],
        }],
      },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function getMyCollaborations(userId, query) {
  const { offset, limit, page } = parsePagination(query);
  const profile = await BrandProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Brand profile not found');

  const where = { brandId: profile.id };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.stage)  where.stage  = query.stage.toUpperCase();

  const { rows, count } = await Collaboration.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Campaign,       as: 'campaign', attributes: ['title', 'objective', 'niche', 'budgetPKR', 'deadline'] },
      { model: CreatorProfile, as: 'creator',  attributes: ['userId', 'displayName', 'username', 'avatarUrl', 'niche'],
        include: [{ model: SocialPlatform, as: 'platforms', attributes: ['name', 'handle', 'followerCount', 'isConnected'] }] },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function getMyApplications(userId, query) {
  const { offset, limit, page } = parsePagination(query);
  const profile = await BrandProfile.findOne({ where: { userId } });
  if (!profile) throw new NotFoundError('Brand profile not found');

  const campaignIds = (await Campaign.findAll({
    where: { brandId: profile.id },
    attributes: ['id'],
    raw: true,
  })).map((c) => c.id);

  if (!campaignIds.length) return { items: [], total: 0, page, limit };

  const where = { campaignId: { [Op.in]: campaignIds }, status: 'PENDING' };

  const { rows, count } = await Application.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Campaign,       as: 'campaign', attributes: ['title', 'niche', 'budgetPKR'] },
      { model: CreatorProfile, as: 'creator',  attributes: ['userId', 'displayName', 'username', 'avatarUrl', 'niche', 'followerCount', 'engagementRate'],
        include: [{ model: SocialPlatform, as: 'platforms', attributes: ['name', 'handle', 'followerCount', 'isConnected'] }] },
    ],
  });

  return { items: rows, total: count, page, limit };
}

// Count only — for the sidebar badge. Naturally decreases only when a request is
// accepted/rejected (status leaves PENDING), never just from viewing the list.
async function getPendingRequestsCount(userId) {
  const profile = await BrandProfile.findOne({ where: { userId } });
  if (!profile) return 0;

  const campaignIds = (await Campaign.findAll({
    where: { brandId: profile.id },
    attributes: ['id'],
    raw: true,
  })).map((c) => c.id);
  if (!campaignIds.length) return 0;

  return Application.count({ where: { campaignId: { [Op.in]: campaignIds }, status: 'PENDING' } });
}

async function listBrands(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = { '$user.status$': 'APPROVED' };
  if (query.industry) where.industry = { [Op.iLike]: `%${query.industry}%` };
  if (query.q)        where.companyName = { [Op.iLike]: `%${query.q}%` };

  const { rows, count } = await BrandProfile.findAndCountAll({
    where,
    offset,
    limit,
    include: [{ model: User, as: 'user', attributes: ['createdAt'] }],
  });

  return { items: rows, total: count, page, limit };
}

async function getMyActivity(userId, query) {
  const { offset, limit, page } = parsePagination(query, 50);
  const where = { userId };
  if (query.entity) where.entity = query.entity;

  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { items: rows, total: count, page, limit };
}

module.exports = { getMyProfile, updateMyProfile, getStats, getMyCampaigns, getMyCollaborations, getMyApplications, getPendingRequestsCount, listBrands, getMyActivity };
