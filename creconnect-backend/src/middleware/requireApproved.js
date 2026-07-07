const { User } = require('../models');
const { ForbiddenError } = require('../utils/errors');

/** Blocks non-admin users until an admin has approved their account. */
async function requireApproved(req, _res, next) {
  if (req.user?.role === 'ADMIN') return next();

  const user = await User.findByPk(req.user.id, { attributes: ['status'] });
  if (!user || user.status !== 'APPROVED') {
    return next(new ForbiddenError('Account pending admin approval'));
  }

  req.user.status = user.status;
  next();
}

module.exports = { requireApproved };
