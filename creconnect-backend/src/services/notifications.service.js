const { Notification, UserNotification, User } = require('../models');
const { emitToUser } = require('../config/socket');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');

async function getAll(userId, query) {
  const { offset, limit, page } = parsePagination(query, 30);
  const where = { userId };
  if (query.unread === 'true') where.isRead = false;

  const { rows, count } = await UserNotification.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Notification, as: 'notification' }],
  });

  return { items: rows, total: count, page, limit };
}

async function getUnreadCount(userId) {
  return UserNotification.count({ where: { userId, isRead: false } });
}

async function markRead(id, userId) {
  const un = await UserNotification.findOne({ where: { id, userId } });
  if (!un) throw new NotFoundError('Notification not found');
  await un.update({ isRead: true, readAt: new Date() });
  return un;
}

async function markAllRead(userId) {
  await UserNotification.update(
    { isRead: true, readAt: new Date() },
    { where: { userId, isRead: false } }
  );
}

async function deleteOne(id, userId) {
  const un = await UserNotification.findOne({ where: { id, userId } });
  if (!un) throw new NotFoundError('Notification not found');
  await un.destroy();
}

async function createForUser(userId, message, type = 'SYSTEM') {
  const notification = await Notification.create({ message, type, audience: 'ALL', status: 'SENT' });
  await UserNotification.create({ userId, notificationId: notification.id, isRead: false });
  return notification;
}

async function push(userIds, message, audience = 'ALL') {
  const notification = await Notification.create({ message, audience, status: 'SENT' });

  const recipients = userIds.map((userId) => ({
    userId,
    notificationId: notification.id,
    isRead: false,
  }));
  await UserNotification.bulkCreate(recipients, { ignoreDuplicates: true });

  for (const userId of userIds) {
    emitToUser(userId, 'notification', { id: notification.id, message, createdAt: notification.createdAt });
    const count = await getUnreadCount(userId);
    emitToUser(userId, 'unread-count', { count });
  }

  return notification;
}

module.exports = { getAll, getUnreadCount, markRead, markAllRead, deleteOne, push, createForUser };
