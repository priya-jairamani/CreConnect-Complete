const { Report, User } = require('../models');
const { NotFoundError, AppError } = require('../utils/errors');

async function create(reporterId, { reportedId, violationType, type, description, details }) {
  if (!reportedId || reportedId === 'unknown') {
    throw new AppError('Reported user is required', 400);
  }

  const reported = await User.findByPk(reportedId);
  if (!reported) throw new NotFoundError('Reported user not found');
  if (reportedId === reporterId) throw new AppError('You cannot report yourself', 400);

  const desc = (description || details || '').trim();
  if (!desc) throw new AppError('Report description is required', 400);

  return Report.create({
    reporterId,
    reportedUserId: reportedId,
    violationType: (violationType || type || 'OTHER').toUpperCase(),
    description: desc,
    status: 'OPEN',
  });
}

module.exports = { create };
