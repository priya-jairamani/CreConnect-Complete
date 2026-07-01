const { Router } = require('express');
const ctrl = require('../controllers/brands.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = Router();

/**
 * @swagger
 * /brands/me:
 *   get:
 *     summary: Get the logged-in brand's profile
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Brand profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/BrandProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   patch:
 *     summary: Update the logged-in brand's profile
 *     tags: [Brands]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrandRequest'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/BrandProfile' }
 */
router.get('/me',   authenticate, authorize('BRAND'), ctrl.getMe);
router.patch('/me', authenticate, authorize('BRAND'), ctrl.updateMe);

/**
 * @swagger
 * /brands/me/stats:
 *   get:
 *     summary: Get campaign and collaboration counts for the logged-in brand
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Brand stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCampaigns:          { type: integer, example: 5 }
 *                     activeCollaborations:    { type: integer, example: 3 }
 *                     completedCollaborations: { type: integer, example: 8 }
 */
router.get('/me/stats', authenticate, authorize('BRAND'), ctrl.getStats);

/**
 * @swagger
 * /brands/me/campaigns:
 *   get:
 *     summary: List campaigns owned by the logged-in brand (paginated)
 *     tags: [Brands]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/CampaignStatus' }
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
router.get('/me/campaigns',       authenticate, authorize('BRAND'), ctrl.getMyCampaigns);
router.get('/me/collaborations',  authenticate, authorize('BRAND'), ctrl.getMyCollaborations);
router.get('/me/applications',    authenticate, authorize('BRAND'), ctrl.getMyApplications);

/**
 * @swagger
 * /brands/list:
 *   get:
 *     summary: List and search all approved brands
 *     tags: [Brands]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Search by company name
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
 *         description: Paginated brands list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/BrandProfile' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/list',       authenticate,                ctrl.listBrands);
router.get('/me/activity', authenticate, authorize('BRAND'), ctrl.getMyActivity);

module.exports = router;
