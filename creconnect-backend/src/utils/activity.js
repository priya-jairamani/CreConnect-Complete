const { AuditLog } = require('../models');
const { emitToUser } = require('../config/socket');

/**
 * Write one activity entry to audit_logs and push it live to the user's socket.
 * Safe to call fire-and-forget (never throws).
 */
async function logActivity(userId, action, { entity = null, entityId = null, meta = {} } = {}) {
  try {
    const entry = await AuditLog.create({ userId, action, entity, entityId, meta });

    // Push real-time update to the user's notification socket
    emitToUser(userId, 'brand-activity', {
      id:        entry.id,
      action,
      entity,
      entityId,
      meta,
      createdAt: entry.createdAt,
    });
  } catch (err) {
    // Activity logging must never crash the main request
    require('./logger').warn(`logActivity failed: ${err.message}`);
  }
}

module.exports = { logActivity };
