const { Router } = require('express');
const ctrl = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = Router();

/**
 * @swagger
 * /analytics/brand:
 *   get:
 *     summary: Campaign and collaboration analytics for the logged-in brand
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Brand analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/BrandAnalytics' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/brand', authenticate, authorize('BRAND'), ctrl.brand);

/**
 * @swagger
 * /analytics/creator:
 *   get:
 *     summary: Collaboration and earnings analytics for the logged-in creator
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Creator analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/CreatorAnalytics' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/creator', authenticate, authorize('CREATOR'), ctrl.creator);

/**
 * @swagger
 * /analytics/admin:
 *   get:
 *     summary: Platform-wide analytics (ADMIN only)
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Platform analytics — users, campaigns, collabs, revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:                   { type: array }
 *                     campaigns:               { type: array }
 *                     collaborations:          { type: array }
 *                     totalRevenueReleasedPKR: { type: number, example: 3250000 }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/admin', authenticate, authorize('ADMIN'), ctrl.admin);

module.exports = router;
