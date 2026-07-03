const { Router } = require('express');

const router = Router();

router.use('/auth',          require('./auth.routes'));
router.use('/creators',      require('./creators.routes'));
router.use('/brands',        require('./brands.routes'));
router.use('/campaigns',     require('./campaigns.routes'));
router.use('/messages',      require('./messages.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/search',        require('./search.routes'));
router.use('/matching',      require('./matching.routes'));
router.use('/analytics',     require('./analytics.routes'));
router.use('/payments',      require('./payments.routes'));
router.use('/subscriptions', require('./subscriptions.routes'));
router.use('/upload',        require('./upload.routes'));
router.use('/social',        require('./social.routes'));
router.use('/verification',  require('./verification.routes'));
router.use('/admin',         require('./admin.routes'));
router.use('/ai',            require('./ai.routes'));
router.use('/copilot',       require('./copilot.routes'));

module.exports = router;
