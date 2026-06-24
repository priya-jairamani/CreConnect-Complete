const Redis = require('ioredis');
const { REDIS_URL } = require('./env');
const logger = require('../utils/logger');

const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.warn('Redis error (non-fatal):', err.message));

// Gracefully degrade — if Redis is absent the app still starts.
// Rate-limiting and OTP will fall back to in-memory maps.
redis.connect().catch(() => {});

module.exports = redis;
