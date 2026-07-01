const { Op } = require('sequelize');
const { CreatorProfile, BrandProfile, Campaign, SocialPlatform, User } = require('../models');
const { parsePagination } = require('../utils/pagination');

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

  return { items: rows, total: count, page, limit };
}

async function searchBrands(query) {
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

  return { items: rows, total: count, page, limit };
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
