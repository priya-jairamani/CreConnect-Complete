const { Router } = require('express');
const ctrl = require('../controllers/public.controller');

const router = Router();

router.get('/discover', ctrl.getDiscover);

module.exports = router;
