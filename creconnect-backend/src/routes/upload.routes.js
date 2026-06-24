const { Router } = require('express');
const ctrl = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar, uploadCampaignAsset, uploadChatAttachment, makeUploader } = require('../middleware/upload');
const uploadMedia = makeUploader('creator-media', 50); // 50 MB for photos/videos

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Upload a profile avatar (creator) or logo (brand) — max 5 MB
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, png, webp) — max 5 MB
 *     responses:
 *       200:
 *         description: Avatar uploaded and profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/avatar',  uploadAvatar.single('avatar'), ctrl.uploadAvatar);
router.post('/banner',  uploadAvatar.single('banner'), ctrl.uploadBanner);

/**
 * @swagger
 * /upload/campaign/{id}/asset:
 *   post:
 *     summary: Upload a campaign media asset — max 20 MB
 *     tags: [Upload]
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
 *             required: [asset]
 *             properties:
 *               asset:
 *                 type: string
 *                 format: binary
 *                 description: Image or video file — max 20 MB
 *     responses:
 *       200:
 *         description: Asset uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 */
router.post('/campaign/:id/asset', uploadCampaignAsset.single('asset'), ctrl.uploadCampaignAsset);

/**
 * @swagger
 * /upload/chat/{id}/attachment:
 *   post:
 *     summary: Upload a chat attachment — max 10 MB
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Conversation ID
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [attachment]
 *             properties:
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: Any file — max 10 MB
 *     responses:
 *       200:
 *         description: Attachment uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 */
router.post('/chat/:id/attachment', uploadChatAttachment.single('attachment'), ctrl.uploadChatAttachment);
router.post('/media',               uploadMedia.single('media'),              ctrl.uploadMedia);
// Verification document upload — also accessible via /upload/verification/:docType
const { makeUploader: _mk } = require('../middleware/upload');
const verificationDocUploader = _mk('verification', 10);
router.post('/verification/:docType', verificationDocUploader.single('document'), require('../controllers/verification.controller').uploadDoc);

module.exports = router;
