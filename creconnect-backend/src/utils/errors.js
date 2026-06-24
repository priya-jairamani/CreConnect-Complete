class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(msg = 'Resource not found') { super(msg, 404); }
}

class ValidationError extends AppError {
  constructor(msg = 'Validation failed', errors = []) {
    super(msg, 422);
    this.errors = errors;
  }
}

class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') { super(msg, 401); }
}

class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') { super(msg, 403); }
}

class ConflictError extends AppError {
  constructor(msg = 'Conflict') { super(msg, 409); }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
