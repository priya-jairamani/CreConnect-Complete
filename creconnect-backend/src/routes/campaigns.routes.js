const { Router } = require('express');
const ctrl = require('../controllers/campaigns.controller');
const deliverablesCtrl = require('../controllers/deliverables.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = Router();

/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: List published campaigns (all authenticated users)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Search by title
 *         schema: { type: string }
 *       - in: query
 *         name: niche
 *         schema: { $ref: '#/components/schemas/Niche' }
 *       - in: query
 *         name: objective
 *         schema: { $ref: '#/components/schemas/Objective' }
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/CampaignStatus' }
 *       - in: query
 *         name: brandId
 *         schema: { type: string, format: uuid }
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
 *   post:
 *     summary: Create a new campaign (BRAND only)
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *           example:
 *             title: "Eid Collection 2025 Launch"
 *             description: "We are looking for fashion creators to promote our Eid lawn collection."
 *             objective: "AWARENESS"
 *             niche: "FASHION"
 *             platforms: ["INSTAGRAM", "TIKTOK"]
 *             followerMin: 10000
 *             followerMax: 500000
 *             engagementMin: 3.0
 *             budgetType: "FIXED"
 *             budgetPKR: 75000
 *             reels: 3
 *             posts: 2
 *             stories: 5
 *             status: "PUBLISHED"
 *             deadline: "2025-03-20T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Campaign created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Campaign' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/ValidationError' }
 */
router.get('/',  authenticate, ctrl.list);
router.post('/', authenticate, authorize('BRAND'), ctrl.create);

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get a single campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Campaign detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Campaign' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   patch:
 *     summary: Update a campaign (BRAND — owner only)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *     responses:
 *       200:
 *         description: Updated campaign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Campaign' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     summary: Delete a campaign (BRAND — owner only)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Campaign deleted
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id',    authenticate, ctrl.getById);
router.patch('/:id',  authenticate, authorize('BRAND'), ctrl.update);
router.delete('/:id', authenticate, authorize('BRAND'), ctrl.remove);

/**
 * @swagger
 * /campaigns/{id}/apply:
 *   post:
 *     summary: Apply to a campaign (CREATOR only)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyRequest'
 *     responses:
 *       201:
 *         description: Application submitted
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.post('/:id/apply', authenticate, authorize('CREATOR'), ctrl.apply);

/**
 * @swagger
 * /campaigns/{id}/applications:
 *   get:
 *     summary: Get all applications for a campaign (BRAND — owner only)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/CollabStatus' }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Paginated applications with creator details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { type: object } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/:id/applications', authenticate, authorize('BRAND'), ctrl.getApplications);

/**
 * @swagger
 * /campaigns/applications/{appId}/{action}:
 *   patch:
 *     summary: Accept or reject an application (BRAND only). Accepting auto-creates a Collaboration.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: action
 *         required: true
 *         schema: { type: string, enum: [accept, reject] }
 *     responses:
 *       200:
 *         description: Application updated; collaboration created if accepted
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/applications/:appId/:action', authenticate, authorize('BRAND'),   ctrl.respondToApplication);
router.delete('/applications/:appId/withdraw', authenticate, authorize('CREATOR'), ctrl.withdrawApplication);
router.post('/:id/invite', authenticate, authorize('BRAND'), ctrl.inviteCreator);
router.patch('/applications/:appId/respond/:action', authenticate, authorize('CREATOR'), ctrl.creatorRespondToInvitation);

/**
 * @swagger
 * /campaigns/collaborations/{collabId}/deliverables:
 *   get:
 *     summary: List deliverables for a collaboration (creator or brand, must be part of it)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: collabId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Deliverables list }
 *   post:
 *     summary: Submit a deliverable for a collaboration (CREATOR only)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: collabId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note: { type: string }
 *               link: { type: string }
 *     responses:
 *       201: { description: Deliverable submitted }
 */
router.get('/collaborations/:collabId/deliverables',  authenticate, deliverablesCtrl.list);
router.post('/collaborations/:collabId/deliverables', authenticate, authorize('CREATOR'), deliverablesCtrl.submit);

/**
 * @swagger
 * /campaigns/deliverables/{deliverableId}/{action}:
 *   patch:
 *     summary: Approve or request revision on a submitted deliverable (BRAND only)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: deliverableId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: action
 *         required: true
 *         schema: { type: string, enum: [approve, request-revision] }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback: { type: string }
 *     responses:
 *       200: { description: Deliverable reviewed }
 */
router.patch('/deliverables/:deliverableId/:action', authenticate, authorize('BRAND'), deliverablesCtrl.respond);

module.exports = router;
