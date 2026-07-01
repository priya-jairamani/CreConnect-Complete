const { Router } = require('express');
const ctrl = require('../controllers/creators.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = Router();

/**
 * @swagger
 * /creators/me:
 *   get:
 *     summary: Get the logged-in creator's full profile
 *     tags: [Creators]
 *     responses:
 *       200:
 *         description: Creator profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/CreatorProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   patch:
 *     summary: Update the logged-in creator's profile
 *     tags: [Creators]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCreatorRequest'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/CreatorProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/me',   authenticate, authorize('CREATOR'), ctrl.getMe);
router.patch('/me', authenticate, authorize('CREATOR'), ctrl.updateMe);

/**
 * @swagger
 * /creators/me/stats:
 *   get:
 *     summary: Get the logged-in creator's engagement and collaboration stats
 *     tags: [Creators]
 *     responses:
 *       200:
 *         description: Creator stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCollaborations:
 *                       type: integer
 *                       example: 12
 *                     completedCollaborations:
 *                       type: integer
 *                       example: 9
 *                     followerCount:
 *                       type: integer
 *                       example: 85000
 *                     engagementRate:
 *                       type: number
 *                       example: 4.2
 *                     rating:
 *                       type: number
 *                       example: 4.7
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me/stats', authenticate, authorize('CREATOR'), ctrl.getStats);

/**
 * @swagger
 * /creators/me/collaborations:
 *   get:
 *     summary: List the logged-in creator's collaborations (paginated)
 *     tags: [Creators]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/CollabStatus'
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated collaborations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Collaboration' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/me/collaborations', authenticate, authorize('CREATOR'), ctrl.getCollaborations);

/**
 * @swagger
 * /creators/me/offers:
 *   get:
 *     summary: Get pending campaign applications (offers) for the logged-in creator
 *     tags: [Creators]
 *     responses:
 *       200:
 *         description: Pending offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { type: object } }
 */
router.get('/me/offers',       authenticate, authorize('CREATOR'), ctrl.getOffers);
router.get('/me/applications', authenticate, authorize('CREATOR'), ctrl.getApplications);

router.get   ('/me/media',                 authenticate, authorize('CREATOR'), ctrl.getMedia);
router.post  ('/me/media',                 authenticate, authorize('CREATOR'), ctrl.addMedia);
router.patch ('/me/media/reorder',         authenticate, authorize('CREATOR'), ctrl.reorderMedia);
router.patch ('/me/media/:id/featured',    authenticate, authorize('CREATOR'), ctrl.setFeatured);
router.patch ('/me/media/:id',             authenticate, authorize('CREATOR'), ctrl.updateMedia);
router.delete('/me/media/:id',             authenticate, authorize('CREATOR'), ctrl.deleteMedia);

/**
 * @swagger
 * /creators/me/platforms:
 *   post:
 *     summary: Add a social platform to the creator's profile
 *     tags: [Creators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddPlatformRequest'
 *           example:
 *             { name: "INSTAGRAM", handle: "@ayesha_creates", url: "https://instagram.com/ayesha_creates", followerCount: 55000 }
 *     responses:
 *       201:
 *         description: Platform added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/SocialPlatform' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/me/platforms', authenticate, authorize('CREATOR'), ctrl.addPlatform);

/**
 * @swagger
 * /creators/me/platforms/{id}:
 *   delete:
 *     summary: Remove a social platform from the creator's profile
 *     tags: [Creators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Platform removed
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/me/platforms/:id', authenticate, authorize('CREATOR'), ctrl.removePlatform);

/**
 * @swagger
 * /creators/{username}:
 *   get:
 *     summary: Get a creator's public profile by username
 *     tags: [Creators]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *         example: ayesha_creates
 *     responses:
 *       200:
 *         description: Public creator profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/CreatorProfile' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:username', authenticate, ctrl.getPublicProfile);
router.get('/:creatorId/public-media', authenticate, ctrl.getPublicMedia);

module.exports = router;
