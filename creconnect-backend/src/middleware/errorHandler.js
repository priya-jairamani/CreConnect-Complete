const { UniqueConstraintError, ValidationError: SeqValidationError, ForeignKeyConstraintError } = require('sequelize');
const { AppError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Our own ValidationError (from express-validator)
  if (err instanceof ValidationError) {
    return res.status(422).json({ success: false, message: err.message, errors: err.errors });
  }

  // Our own operational errors (NotFoundError, UnauthorizedError, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Sequelize unique constraint violation
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  // Sequelize model validation error
  if (err instanceof SeqValidationError) {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  // Sequelize FK violation
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ success: false, message: 'Related resource not found' });
  }

  logger.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = { errorHandler };
