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

// Content moderation — creator portfolio / media uploads
router.get('/content', ctrl.listContent);
router.patch('/content/:id/:action', ctrl.moderateContent);

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

/**
 * @swagger
 * /admin/users/{userId}/enterprise-plan:
 *   post:
 *     summary: Manually grant a custom Enterprise subscription (sales-assisted, no Stripe checkout)
 *     tags: [Admin]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [BRAND, CREATOR] }
 *               campaignLimit: { type: integer, nullable: true, description: "null = unlimited" }
 *               collabLimit: { type: integer, nullable: true, description: "null = unlimited" }
 *     responses:
 *       200: { description: Subscription granted }
 */
router.post('/users/:userId/enterprise-plan', ctrl.grantEnterprisePlan);

// Operations — support tickets
router.get('/tickets', ctrl.listTickets);
router.post('/tickets', ctrl.createTicket);
router.patch('/tickets/:id', ctrl.updateTicket);

// Revenue & Payments
router.get('/payments', ctrl.listPayments);
router.get('/subscriptions', ctrl.listSubscriptions);
router.get('/revenue', ctrl.getRevenueSummary);
router.patch('/payments/:id/dispute', ctrl.markPaymentDisputed);
router.patch('/payments/:id/resolve-dispute', ctrl.resolvePaymentDispute);

// Platform settings
router.get('/settings', ctrl.getSettings);
router.patch('/settings', ctrl.updateSettings);

// Identity / document verification queue
router.get('/verifications', ctrl.listVerifications);
router.get('/verifications/:id', ctrl.getVerification);
router.patch('/verifications/:id/approve', ctrl.approveVerification);
router.patch('/verifications/:id/reject', ctrl.rejectVerification);
router.patch('/verifications/:id/request-reupload', ctrl.requestReuploadVerification);

// Platform notifications (broadcast center)
router.get('/notifications/failed', ctrl.listFailedNotifications);
router.get('/notifications', ctrl.listNotifications);
router.post('/notifications/push', ctrl.pushNotification);

module.exports = router;
