const { Router } = require('express');
const ctrl = require('../controllers/messages.controller');
const { authenticate } = require('../middleware/auth');
const { uploadChatAttachment } = require('../middleware/upload');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: List all conversations for the current user
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Conversations list (ordered by most recent message)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Conversation' } }
 *   post:
 *     summary: Start or retrieve a conversation with another user (idempotent)
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *     responses:
 *       201:
 *         description: Conversation created or retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Conversation' }
 */
router.get('/unread-count',   ctrl.getUnreadCount);
router.get('/conversations',  ctrl.getConversations);
router.post('/conversations', ctrl.createConversation);

/**
 * @swagger
 * /messages/conversations/{id}/messages:
 *   get:
 *     summary: Get paginated messages in a conversation
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Conversation ID
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Messages ordered by sentAt ascending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Message' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   post:
 *     summary: Send a message in a conversation (optionally attach a file)
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:    { type: string, example: "Hi! I am interested in your campaign." }
 *               attachment: { type: string, format: binary, description: "Optional file (max 10 MB)" }
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Message' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/conversations/:id/read',                              ctrl.markConversationRead);
router.get('/conversations/:id/messages',                           ctrl.getMessages);
router.post('/conversations/:id/messages',                          uploadChatAttachment.single('attachment'), ctrl.sendMessage);
router.patch('/conversations/:id/messages/:messageId/reaction',     ctrl.toggleReaction);

module.exports = router;
