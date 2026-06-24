const { Router } = require('express');
const ctrl = require('../controllers/verification.controller');
const { authenticate } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');

const router = Router();
router.use(authenticate);

const docUploader = makeUploader('verification', 10); // 10 MB limit for ID documents

router.get ('/status',          ctrl.getStatus);
router.get ('/history',         ctrl.getHistory);
router.post('/nic',             ctrl.submitNIC);
router.post('/business',        ctrl.submitBusiness);
router.post('/domain',          ctrl.submitDomain);
router.post('/social',          ctrl.submitSocial);
router.post('/upload/:docType', docUploader.single('document'), ctrl.uploadDoc);

module.exports = router;
