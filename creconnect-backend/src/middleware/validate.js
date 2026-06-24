const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Drop this after your express-validator chains to auto-throw on errors
function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ValidationError('Validation failed', errors));
  }
  next();
}

module.exports = { validate };
