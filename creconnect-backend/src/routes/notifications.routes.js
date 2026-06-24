const { Router } = require('express');
const ctrl = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user (paginated)
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: unread
 *         description: Pass "true" to return only unread notifications
 *         schema: { type: string, enum: ["true", "false"] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Paginated notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Notification' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.post('/self', ctrl.createSelf);
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get the number of unread notifications for the current user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: object, properties: { count: { type: integer, example: 4 } } }
 */
router.get('/unread-count', ctrl.getUnreadCount);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.patch('/read-all', ctrl.markAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Marked as read
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/:id/read', ctrl.markRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deleted
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', ctrl.deleteOne);

module.exports = router;
