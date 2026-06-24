const { Router } = require('express');
const ctrl = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /search/creators:
 *   get:
 *     summary: Search and filter creators
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Full-text search on displayName, username, bio
 *         schema: { type: string }
 *       - in: query
 *         name: niche
 *         schema: { $ref: '#/components/schemas/Niche' }
 *       - in: query
 *         name: minFollowers
 *         schema: { type: integer, example: 10000 }
 *       - in: query
 *         name: maxFollowers
 *         schema: { type: integer, example: 500000 }
 *       - in: query
 *         name: minEngagement
 *         description: Minimum engagement rate (%)
 *         schema: { type: number, example: 3.0 }
 *       - in: query
 *         name: sort
 *         description: Sort by followers (default) or engagement
 *         schema: { type: string, enum: [followers, engagement] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated creators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/CreatorProfile' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/creators', ctrl.creators);

/**
 * @swagger
 * /search/brands:
 *   get:
 *     summary: Search brands by name and industry
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Company name search
 *         schema: { type: string }
 *       - in: query
 *         name: industry
 *         schema: { type: string, example: Fashion }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/BrandProfile' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/brands', ctrl.brands);

/**
 * @swagger
 * /search/campaigns:
 *   get:
 *     summary: Search published campaigns by title, niche, and objective
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Campaign title search
 *         schema: { type: string }
 *       - in: query
 *         name: niche
 *         schema: { $ref: '#/components/schemas/Niche' }
 *       - in: query
 *         name: objective
 *         schema: { $ref: '#/components/schemas/Objective' }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Campaign' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/campaigns', ctrl.campaigns);

module.exports = router;
