const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('reportedId').isUUID().withMessage('Valid reported user ID is required'),
    body('type').optional().isString(),
    body('violationType').optional().isString(),
    body('details').optional().isString(),
    body('description').optional().isString(),
  ],
  validate,
  ctrl.create,
);

module.exports = router;
