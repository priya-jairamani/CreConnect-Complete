const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getAuthUrl, handleCallback, getPosts, syncPosts } = require('../controllers/social.controller');

const router = Router();

router.get('/:platform/auth-url',          authenticate, getAuthUrl);
router.get('/:platform/callback',                        handleCallback);
router.get('/platforms/:platformId/posts', authenticate, getPosts);
router.post('/platforms/:platformId/sync', authenticate, syncPosts);

module.exports = router;
