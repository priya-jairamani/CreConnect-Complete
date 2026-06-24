const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = Router();

router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List and filter all platform users (ADMIN only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { $ref: '#/components/schemas/Role' }
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/UserStatus' }
 *       - in: query
 *         name: q
 *         description: Email search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/User' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/users', ctrl.listUsers);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Update a user's account status (ADMIN only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserStatusRequest'
 *           examples:
 *             approve:   { value: { status: "APPROVED" } }
 *             suspend:   { value: { status: "SUSPENDED" } }
 *     responses:
 *       200:
 *         description: Status updated
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/users/:id/status', ctrl.updateUserStatus);

/**
 * @swagger
 * /admin/campaigns:
 *   get:
 *     summary: List all campaigns across all brands (ADMIN only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/CampaignStatus' }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
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
router.get('/campaigns', ctrl.listCampaigns);

// Content moderation stub — campaigns/profiles serve as the moderation surface
router.get('/content',          (req, res) => res.json({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, pages: 0 } }));
router.patch('/content/:id/:action', (req, res) => res.json({ success: true, data: {}, message: 'Content moderated' }));

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: List all platform reports (ADMIN only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, RESOLVED, DISMISSED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Paginated reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Report' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/reports', ctrl.listReports);

/**
 * @swagger
 * /admin/reports/{id}/{action}:
 *   patch:
 *     summary: Resolve or dismiss a report (ADMIN only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: action
 *         required: true
 *         schema: { type: string, enum: [resolve, dismiss] }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResolveReportRequest'
 *     responses:
 *       200:
 *         description: Report updated
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/reports/:id/:action', ctrl.resolveReport);

/**
 * @swagger
 * /admin/announce:
 *   post:
 *     summary: Send a platform announcement to all users or a specific role (ADMIN only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnounceRequest'
 *           examples:
 *             all:      { value: { message: "Platform maintenance Sunday 2am PKT", audience: "ALL" } }
 *             creators: { value: { message: "New payout feature now available!", audience: "CREATORS" } }
 *     responses:
 *       200:
 *         description: Announcement broadcast + real-time push sent
 */
router.post('/announce', ctrl.announce);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get platform audit logs (ADMIN only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated audit log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       action:
 *                         type: string
 *                       entity:
 *                         type: string
 *                       entityId:
 *                         type: string
 *                       ip:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;
