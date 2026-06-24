const { Router } = require('express');
const ctrl = require('../controllers/payments.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /payments/escrow/{collabId}:
 *   post:
 *     summary: Place collaboration payment into escrow (BRAND only)
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: collabId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Escrow created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Payment' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/escrow/:collabId', ctrl.createEscrow);

/**
 * @swagger
 * /payments/release/{paymentId}:
 *   post:
 *     summary: Release escrowed payment to the creator (BRAND only)
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Payment released
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Payment' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/release/:paymentId', ctrl.releasePayment);

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get payment history for the current user (brand or creator)
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated payment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { type: array, items: { $ref: '#/components/schemas/Payment' } }
 *                 meta:    { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/history', ctrl.getHistory);

module.exports = router;
