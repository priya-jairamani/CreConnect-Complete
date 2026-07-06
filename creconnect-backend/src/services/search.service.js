const { Op } = require('sequelize');
const { CreatorProfile, BrandProfile, Campaign, SocialPlatform, User, Verification } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { computeTrustScore } = require('../utils/trustScore');

async function enrichProfilesWithTrustScore(profiles, defaultRole) {
  if (!profiles.length) return [];
  const userIds = profiles.map((p) => p.userId);
  const [users, verifications] = await Promise.all([
    User.findAll({ where: { id: userIds }, attributes: ['id', 'role', 'emailVerified'] }),
    Verification.findAll({ where: { userId: userIds } }),
  ]);
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const verifByUser = verifications.reduce((acc, row) => {
    if (!acc[row.userId]) acc[row.userId] = [];
    acc[row.userId].push(row);
    return acc;
  }, {});

  return profiles.map((profile) => {
    const json = profile.toJSON ? profile.toJSON() : profile;
    const user = userMap[json.userId];
    const trust = computeTrustScore({
      role: user?.role || defaultRole,
      verifications: verifByUser[json.userId] || [],
      emailVerified: user?.emailVerified,
    });
    return { ...json, ...trust };
  });
}

async function searchCreators(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = { '$user.status$': 'APPROVED' };

  if (query.creatorId)     where.id            = query.creatorId;
  if (query.q) {
    where[Op.or] = [
      { displayName: { [Op.iLike]: `%${query.q}%` } },
      { username:    { [Op.iLike]: `%${query.q}%` } },
      { bio:         { [Op.iLike]: `%${query.q}%` } },
    ];
  }
  if (query.niche)         where.niche         = query.niche.toUpperCase();
  if (query.minFollowers)  where.followerCount  = { [Op.gte]: parseInt(query.minFollowers, 10) };
  if (query.maxFollowers)  where.followerCount  = { ...(where.followerCount || {}), [Op.lte]: parseInt(query.maxFollowers, 10) };
  if (query.minEngagement) where.engagementRate = { [Op.gte]: parseFloat(query.minEngagement) };

  const order = query.sort === 'engagement'
    ? [['engagementRate', 'DESC']]
    : [['followerCount', 'DESC']];

  const { rows, count } = await CreatorProfile.findAndCountAll({
    where,
    subQuery: false,
    offset,
    limit,
    order,
    include: [
      { model: SocialPlatform, as: 'platforms' },
      { model: User, as: 'user', attributes: ['createdAt'] },
    ],
  });

  const items = await enrichProfilesWithTrustScore(rows, 'CREATOR');
  return { items, total: count, page, limit };
}
  const { offset, limit, page } = parsePagination(query);
  const where = { '$user.status$': 'APPROVED' };
  if (query.q)        where.companyName = { [Op.iLike]: `%${query.q}%` };
  if (query.industry) where.industry    = { [Op.iLike]: `%${query.industry}%` };

  const { rows, count } = await BrandProfile.findAndCountAll({
    where,
    subQuery: false,
    offset,
    limit,
    order: [['companyName', 'ASC']],
    include: [{ model: User, as: 'user', attributes: ['createdAt'] }],
  });

  const items = await enrichProfilesWithTrustScore(rows, 'BRAND');
  return { items, total: count, page, limit };
}

async function searchCampaigns(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = { status: 'PUBLISHED' };
  if (query.q)         where.title     = { [Op.iLike]: `%${query.q}%` };
  if (query.niche)     where.niche     = query.niche.toUpperCase();
  if (query.objective) where.objective = query.objective.toUpperCase();

  const { rows, count } = await Campaign.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: BrandProfile, as: 'brand', attributes: ['companyName', 'logoUrl', 'isVerified'] }],
  });

  return { items: rows, total: count, page, limit };
}

module.exports = { searchCreators, searchBrands, searchCampaigns };
