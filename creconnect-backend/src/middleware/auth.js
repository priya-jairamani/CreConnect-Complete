const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token required'));
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

module.exports = { authenticate };
