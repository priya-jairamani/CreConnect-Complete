const { Router } = require('express');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const { requireApproved } = require('../middleware/requireApproved');
const { ok, paginated } = require('../utils/response');
const { CreatorProfile, Campaign, BrandProfile, SocialPlatform } = require('../models');
const { parsePagination } = require('../utils/pagination');

const router = Router();

router.use(authenticate, requireApproved);

/**
 * @swagger
 * /matching/recommended:
 *   get:
 *     summary: Get recommended creators (for brands) or campaigns (for creators)
 *     description: |
 *       Role-aware endpoint:
 *       - **BRAND**: Returns approved creators sorted by rating descending
 *       - **CREATOR**: Returns published campaigns sorted by newest first
 *     tags: [Matching]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated recommended creators or campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/CreatorProfile'
 *                       - $ref: '#/components/schemas/Campaign'
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/recommended', async (req, res, next) => {
  try {
    const { offset, limit, page } = parsePagination(req.query);

    if (req.user.role === 'BRAND') {
      const { rows, count } = await CreatorProfile.findAndCountAll({
        where: { '$user.status$': 'APPROVED' },
        subQuery: false,
        offset, limit,
        order: [['rating', 'DESC']],
        include: [
          { model: SocialPlatform, as: 'platforms' },
          { model: require('../models').User, as: 'user', attributes: ['createdAt'] },
        ],
      });
      // Rename platforms → socialPlatforms to match frontend field expectations
      const enriched = rows.map((r) => {
        const obj = r.toJSON();
        obj.socialPlatforms = obj.platforms;
        delete obj.platforms;
        return obj;
      });
      return paginated(res, enriched, { page, limit, total: count });
    }

    const { rows, count } = await Campaign.findAndCountAll({
      where: { status: 'PUBLISHED' },
      offset, limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: BrandProfile, as: 'brand', attributes: ['companyName', 'logoUrl'] }],
    });
    paginated(res, rows, { page, limit, total: count });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /matching/campaign/{id}:
 *   get:
 *     summary: Find creators that match a campaign's criteria (BRAND only)
 *     description: |
 *       Returns approved creators whose niche, follower count, and engagement rate
 *       satisfy the campaign's targeting requirements. Results are sorted by
 *       engagement rate descending.
 *     tags: [Matching]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Campaign ID to match against
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated matched creators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/CreatorProfile' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/campaign/:id', async (req, res, next) => {
  try {
    const { offset, limit, page } = parsePagination(req.query);
    const campaign = await Campaign.findByPk(req.params.id);

    const where = { '$user.status$': 'APPROVED' };
    if (campaign) {
      if (campaign.followerMin) where.followerCount  = { [Op.gte]: campaign.followerMin };
      if (campaign.followerMax) where.followerCount  = { ...(where.followerCount || {}), [Op.lte]: campaign.followerMax };
      if (campaign.engagementMin) where.engagementRate = { [Op.gte]: campaign.engagementMin };
      if (campaign.niche) where.niche = campaign.niche;
    }

    const { rows, count } = await CreatorProfile.findAndCountAll({
      where,
      subQuery: false,
      offset, limit,
      order: [['engagementRate', 'DESC']],
      include: [
        { model: SocialPlatform, as: 'platforms' },
        { model: require('../models').User, as: 'user', attributes: ['createdAt'] },
      ],
    });
    const enriched = rows.map((r) => {
      const obj = r.toJSON();
      obj.socialPlatforms = obj.platforms;
      delete obj.platforms;
      return obj;
    });
    paginated(res, enriched, { page, limit, total: count });
  } catch (e) { next(e); }
});

module.exports = router;
