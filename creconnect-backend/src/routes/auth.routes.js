const { Router } = require('express');
const { body } = require('express-validator');
const ctrl       = require('../controllers/auth.controller');
const googleCtrl = require('../controllers/googleAuth.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

/**
 * @swagger
 * /auth/health:
 *   get:
 *     summary: Health check
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: API is up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:    { type: string, example: ok }
 *                     timestamp: { type: string, format: date-time }
 */
router.get('/health', ctrl.health);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new creator or brand account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             creator:
 *               summary: Register a creator
 *               value: { email: "ayesha@example.com", password: "Pass@1234", role: "CREATOR", username: "ayesha_creates", displayName: "Ayesha Malik" }
 *             brand:
 *               summary: Register a brand
 *               value: { email: "sapphire@example.com", password: "Pass@1234", role: "BRAND", companyName: "Sapphire Pvt Ltd", contactName: "Zara Ahmed", industry: "Fashion" }
 *     responses:
 *       201:
 *         description: Account created — verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['CREATOR', 'BRAND']),
  ],
  validate,
  ctrl.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT token pair
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             creator: { summary: Creator login, value: { email: "creator@creconnect.pk", password: "Creator@12345" } }
 *             brand:   { summary: Brand login,   value: { email: "brand@creconnect.pk",   password: "Brand@12345" } }
 *             admin:   { summary: Admin login,   value: { email: "admin@creconnect.pk",   password: "Admin@12345" } }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current session (client should discard tokens)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate access + refresh tokens using a valid refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRefreshRequest'
 *     responses:
 *       200:
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenRefreshResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/refresh', [body('refreshToken').notEmpty()], validate, ctrl.refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user and profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:    { $ref: '#/components/schemas/User' }
 *                     profile: { $ref: '#/components/schemas/CreatorProfile' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', authenticate, ctrl.me);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email address with the token sent after registration
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email/:token', ctrl.verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email (silent — does not reveal user existence)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Reset link sent if email is registered
 */
router.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, ctrl.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token from the reset email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  ctrl.resetPassword
);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send a 6-digit OTP to the given email (valid 10 min)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/send-otp', authLimiter, [body('email').isEmail()], validate, ctrl.sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify a 6-digit OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', [body('email').isEmail(), body('code').isLength({ min: 6, max: 6 })], validate, ctrl.verifyOTP);

// ── Google OAuth ──────────────────────────────────────────────────────────
router.get('/google',          authLimiter, googleCtrl.googleStart);
router.get('/google/callback',             googleCtrl.googleCallback);

module.exports = router;
