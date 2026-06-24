const svc = require('../services/notifications.service');
const { ok, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getAll(req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getUnreadCount = async (req, res, next) => {
  try { ok(res, { count: await svc.getUnreadCount(req.user.id) }); } catch (e) { next(e); }
};

const markRead = async (req, res, next) => {
  try { ok(res, await svc.markRead(req.params.id, req.user.id), 'Marked as read'); } catch (e) { next(e); }
};

const markAllRead = async (req, res, next) => {
  try {
    await svc.markAllRead(req.user.id);
    ok(res, {}, 'All marked as read');
  } catch (e) { next(e); }
};

const deleteOne = async (req, res, next) => {
  try {
    await svc.deleteOne(req.params.id, req.user.id);
    ok(res, {}, 'Notification deleted');
  } catch (e) { next(e); }
};

const createSelf = async (req, res, next) => {
  try {
    const { message, type } = req.body;
    if (!message?.trim()) return res.status(422).json({ success: false, message: 'message is required' });
    const notif = await svc.createForUser(req.user.id, message.trim(), type ?? 'SYSTEM');
    ok(res, { id: notif.id, message: notif.message, type: notif.type, createdAt: notif.createdAt }, 'Notification created');
  } catch (e) { next(e); }
};

module.exports = { getAll, getUnreadCount, markRead, markAllRead, deleteOne, createSelf };
