'use strict';

const { Op } = require('sequelize');
const db = require('../../models');

async function fetchCreators({ niche, location, limit = 5 }) {
  const where = { '$user.status$': 'APPROVED' };
  if (niche)    where.niche     = niche;
  if (location) where.location  = { [Op.iLike]: `%${location}%` };

  const rows = await db.CreatorProfile.findAll({
    where,
    limit,
    order:    [['rating', 'DESC']],
    subQuery: false,
    include:  [{ model: db.User, as: 'user', attributes: ['status'] }],
  });
  return rows.map((r) => r.toJSON());
}

async function fetchBrands({ industry, limit = 5 }) {
  const where = {};
  if (industry) where.industry = { [Op.iLike]: `%${industry}%` };

  const rows = await db.BrandProfile.findAll({
    where,
    limit,
    order: [['isVerified', 'DESC'], ['createdAt', 'DESC']],
  });
  return rows.map((r) => r.toJSON());
}

async function fetchAiMatches(userId, role, limit = 5) {
  if (!db.AiMatch) return [];

  if (role === 'BRAND') {
    const brand = await db.BrandProfile.findOne({ where: { userId }, raw: true });
    if (!brand) return [];
    const rows = await db.AiMatch.findAll({
      where:   { brandId: brand.id },
      order:   [['matchScore', 'DESC']],
      limit,
      include: [{ model: db.CreatorProfile, as: 'creator', attributes: ['displayName', 'niche', 'followerCount', 'engagementRate', 'rating'] }],
    });
    return rows.map((r) => r.toJSON());
  }

  if (role === 'CREATOR') {
    const creator = await db.CreatorProfile.findOne({ where: { userId }, raw: true });
    if (!creator) return [];
    const rows = await db.AiMatch.findAll({
      where:   { creatorId: creator.id },
      order:   [['matchScore', 'DESC']],
      limit,
      include: [{ model: db.BrandProfile, as: 'brand', attributes: ['companyName', 'industry', 'location'] }],
    });
    return rows.map((r) => r.toJSON());
  }

  return [];
}

async function fetchAiMatchExplain(userId, role) {
  if (!db.AiMatch) return null;

  if (role === 'BRAND') {
    const brand = await db.BrandProfile.findOne({ where: { userId }, raw: true });
    if (!brand) return null;
    const row = await db.AiMatch.findOne({
      where:   { brandId: brand.id },
      order:   [['matchScore', 'DESC']],
      include: [{ model: db.CreatorProfile, as: 'creator', attributes: ['displayName', 'niche', 'engagementRate', 'followerCount'] }],
    });
    return row ? row.toJSON() : null;
  }

  if (role === 'CREATOR') {
    const creator = await db.CreatorProfile.findOne({ where: { userId }, raw: true });
    if (!creator) return null;
    const row = await db.AiMatch.findOne({
      where:   { creatorId: creator.id },
      order:   [['matchScore', 'DESC']],
      include: [{ model: db.BrandProfile, as: 'brand', attributes: ['companyName', 'industry'] }],
    });
    return row ? row.toJSON() : null;
  }

  return null;
}

async function fetchBudgetStats() {
  const [rows] = await db.sequelize.query(`
    SELECT
      ROUND(AVG("offerAmountPKR"))::int  AS avg,
      ROUND(MIN("offerAmountPKR"))::int  AS min,
      ROUND(MAX("offerAmountPKR"))::int  AS max,
      COUNT(*)::int                      AS total
    FROM collaborations
    WHERE status = 'COMPLETED' AND "offerAmountPKR" > 0
  `);
  return rows[0] || { avg: 0, min: 0, max: 0, total: 0 };
}

async function fetchCollabStatus(userId, role) {
  if (role === 'BRAND') {
    const brand = await db.BrandProfile.findOne({ where: { userId }, raw: true });
    if (!brand) return null;

    const [collabs, total, active, completed] = await Promise.all([
      db.Collaboration.findAll({
        where:   { brandId: brand.id },
        order:   [['createdAt', 'DESC']],
        limit:   4,
        include: [{ model: db.CreatorProfile, as: 'creator', attributes: ['displayName'] }],
      }),
      db.Collaboration.count({ where: { brandId: brand.id } }),
      db.Collaboration.count({ where: { brandId: brand.id, status: ['PENDING', 'ACCEPTED'] } }),
      db.Collaboration.count({ where: { brandId: brand.id, status: 'COMPLETED' } }),
    ]);
    return { collabs: collabs.map((c) => c.toJSON()), total, active, completed };
  }

  if (role === 'CREATOR') {
    const creator = await db.CreatorProfile.findOne({ where: { userId }, raw: true });
    if (!creator) return null;

    const [collabs, total, active, completed] = await Promise.all([
      db.Collaboration.findAll({
        where:   { creatorId: creator.id },
        order:   [['createdAt', 'DESC']],
        limit:   4,
        include: [{ model: db.BrandProfile, as: 'brand', attributes: ['companyName'] }],
      }),
      db.Collaboration.count({ where: { creatorId: creator.id } }),
      db.Collaboration.count({ where: { creatorId: creator.id, status: ['PENDING', 'ACCEPTED'] } }),
      db.Collaboration.count({ where: { creatorId: creator.id, status: 'COMPLETED' } }),
    ]);
    return { collabs: collabs.map((c) => c.toJSON()), total, active, completed };
  }

  return null;
}

async function fetchCampaignStatus(userId) {
  const brand = await db.BrandProfile.findOne({ where: { userId }, raw: true });
  if (!brand) return null;

  const [campaigns, total, published, completed] = await Promise.all([
    db.Campaign.findAll({ where: { brandId: brand.id }, order: [['createdAt', 'DESC']], limit: 4 }),
    db.Campaign.count({ where: { brandId: brand.id } }),
    db.Campaign.count({ where: { brandId: brand.id, status: 'PUBLISHED' } }),
    db.Campaign.count({ where: { brandId: brand.id, status: 'COMPLETED' } }),
  ]);
  return { campaigns: campaigns.map((c) => c.toJSON()), total, published, completed };
}

async function fetchEarnings(userId) {
  const creator = await db.CreatorProfile.findOne({ where: { userId }, raw: true });
  if (!creator) return null;

  // Sum from payments table (amountPKR)
  const [payRows] = await db.sequelize.query(`
    SELECT
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN p."amountPKR" ELSE 0 END), 0)::int    AS paid,
      COALESCE(SUM(CASE WHEN p.status != 'PAID' THEN p."amountPKR" ELSE 0 END), 0)::int   AS pending,
      COUNT(DISTINCT p."collaborationId")::int                                              AS collab_count
    FROM payments p
    JOIN collaborations c ON c.id = p."collaborationId"
    WHERE c."creatorId" = :creatorId
  `, { replacements: { creatorId: creator.id } });

  // Fallback: sum from offerAmountPKR on completed collaborations
  const [collabRows] = await db.sequelize.query(`
    SELECT
      COALESCE(SUM("offerAmountPKR"), 0)::int AS total,
      COUNT(*)::int                            AS count
    FROM collaborations
    WHERE "creatorId" = :creatorId AND status = 'COMPLETED'
  `, { replacements: { creatorId: creator.id } });

  const fromPayments = payRows[0] || { paid: 0, pending: 0, collab_count: 0 };
  const fromCollabs  = collabRows[0] || { total: 0, count: 0 };

  return {
    paid:    fromPayments.paid   || fromCollabs.total || 0,
    pending: fromPayments.pending || 0,
    collabs: fromPayments.collab_count || fromCollabs.count || 0,
  };
}

async function fetchUserProfile(userId, role) {
  if (role === 'BRAND')    return db.BrandProfile.findOne({ where: { userId }, raw: true });
  if (role === 'CREATOR')  return db.CreatorProfile.findOne({ where: { userId }, raw: true });
  return null;
}

module.exports = {
  fetchCreators,
  fetchBrands,
  fetchAiMatches,
  fetchAiMatchExplain,
  fetchBudgetStats,
  fetchCollabStatus,
  fetchCampaignStatus,
  fetchEarnings,
  fetchUserProfile,
};
