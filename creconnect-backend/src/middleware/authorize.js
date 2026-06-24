const { ForbiddenError } = require('../utils/errors');

// authorize('ADMIN', 'BRAND') — pass allowed roles
const authorize = (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };

module.exports = { authorize };
