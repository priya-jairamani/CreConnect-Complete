const { Router } = require('express');
const ctrl = require('../controllers/subscriptions.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /subscriptions/me:
 *   get:
 *     summary: Get the logged-in user's current plan, limits, and usage this period
 *     tags: [Subscriptions]
 *     responses:
 *       200: { description: Plan summary }
 */
router.get('/me', ctrl.getMyPlan);

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: List available plans for the logged-in user's role
 *     tags: [Subscriptions]
 *     responses:
 *       200: { description: Plan catalog }
 */
router.get('/plans', ctrl.listPlans);

/**
 * @swagger
 * /subscriptions/checkout:
 *   post:
 *     summary: Start a Stripe Checkout session to subscribe to a paid plan
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tier: { type: string, example: GROWTH }
 *     responses:
 *       201: { description: Checkout URL }
 */
router.post('/checkout', ctrl.checkout);

/**
 * @swagger
 * /subscriptions/billing-portal:
 *   post:
 *     summary: Get a Stripe Customer Portal link to manage/cancel the current plan
 *     tags: [Subscriptions]
 *     responses:
 *       200: { description: Portal URL }
 */
router.post('/billing-portal', ctrl.billingPortal);

module.exports = router;
