'use strict';

const { Router }   = require('express');
const { authenticate } = require('../middleware/auth');
const { chat }     = require('../controllers/copilot.controller');

const router = Router();

router.use(authenticate);

/**
 * POST /api/v1/copilot/chat
 * Body: { message: string, context?: { page, brandId, creatorId } }
 * Returns: { reply, action?, extra?, intent }
 */
router.post('/chat', chat);

module.exports = router;
