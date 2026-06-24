const { createLogger, format, transports } = require('winston');
const { NODE_ENV } = require('../config/env');

const logger = createLogger({
  level: NODE_ENV === 'production' ? 'warn' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    NODE_ENV === 'production' ? format.json() : format.colorize(),
    NODE_ENV !== 'production' &&
      format.printf(({ timestamp, level, message, stack }) =>
        stack ? `${timestamp} ${level}: ${message}\n${stack}` : `${timestamp} ${level}: ${message}`
      )
  ),
  transports: [
    new transports.Console(),
    ...(NODE_ENV === 'production'
      ? [new transports.File({ filename: 'logs/error.log', level: 'error' })]
      : []),
  ],
});

module.exports = logger;
