const svc = require('../services/admin.service');
const verificationSvc = require('../services/verification.service');
const subscriptionsSvc = require('../services/subscriptions.service');
const { ok, paginated } = require('../utils/response');

const listUsers = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listUsers(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const updateUserStatus = async (req, res, next) => {
  try { ok(res, await svc.updateUserStatus(req.params.id, req.body.status), 'User status updated'); } catch (e) { next(e); }
};

const listCampaigns = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listCampaigns(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const listReports = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listReports(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const resolveReport = async (req, res, next) => {
  try {
    ok(res, await svc.resolveReport(req.params.id, req.params.action, req.body.resolution));
  } catch (e) { next(e); }
};

const announce = async (req, res, next) => {
  try { ok(res, await svc.announce(req.body.message, req.body.audience || 'ALL'), 'Announcement sent'); } catch (e) { next(e); }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getAuditLogs(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const grantEnterprisePlan = async (req, res, next) => {
  try {
    const { role, campaignLimit, collabLimit } = req.body;
    const sub = await subscriptionsSvc.grantEnterpriseSubscription(req.user.id, req.params.userId, role, { campaignLimit, collabLimit });
    ok(res, sub, 'Enterprise plan granted');
  } catch (e) { next(e); }
};

const listTickets = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listTickets(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const createTicket = async (req, res, next) => {
  try { ok(res, await svc.createTicket(req.user.id, req.body), 'Ticket created'); } catch (e) { next(e); }
};

const updateTicket = async (req, res, next) => {
  try { ok(res, await svc.updateTicket(req.params.id, req.body), 'Ticket updated'); } catch (e) { next(e); }
};

const listPayments = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listPayments(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const listSubscriptions = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listSubscriptions(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getRevenueSummary = async (req, res, next) => {
  try { ok(res, await svc.getRevenueSummary()); } catch (e) { next(e); }
};

const markPaymentDisputed = async (req, res, next) => {
  try { ok(res, await svc.markPaymentDisputed(req.params.id, req.body.reason), 'Payment marked disputed'); } catch (e) { next(e); }
};

const resolvePaymentDispute = async (req, res, next) => {
  try { ok(res, await svc.resolvePaymentDispute(req.params.id, req.body.resolution), 'Dispute resolved'); } catch (e) { next(e); }
};

const getSettings = async (req, res, next) => {
  try { ok(res, await svc.getSettings()); } catch (e) { next(e); }
};

const updateSettings = async (req, res, next) => {
  try { ok(res, await svc.updateSettings(req.body, req.user.id), 'Settings updated'); } catch (e) { next(e); }
};

const listVerifications = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await verificationSvc.listForAdmin(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getVerification = async (req, res, next) => {
  try { ok(res, await verificationSvc.getById(req.params.id)); } catch (e) { next(e); }
};

const approveVerification = async (req, res, next) => {
  try {
    ok(res, await verificationSvc.approve(req.params.id, req.user.id), 'Verification approved');
  } catch (e) { next(e); }
};

const rejectVerification = async (req, res, next) => {
  try {
    ok(res, await verificationSvc.reject(req.params.id, req.user.id, req.body.reason), 'Verification rejected');
  } catch (e) { next(e); }
};

const requestReuploadVerification = async (req, res, next) => {
  try {
    ok(res, await verificationSvc.requestReupload(req.params.id, req.user.id, req.body.note), 'Re-upload requested');
  } catch (e) { next(e); }
};

const listContent = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listContent(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const moderateContent = async (req, res, next) => {
  try {
    ok(res, await svc.moderateContent(req.params.id, req.params.action), 'Content moderated');
  } catch (e) { next(e); }
};

const listNotifications = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listNotifications(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const listFailedNotifications = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listFailedNotifications(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const pushNotification = async (req, res, next) => {
  try {
    ok(res, await svc.pushNotification(req.body), 'Notification sent');
  } catch (e) { next(e); }
};

module.exports = {
  listUsers, updateUserStatus, listCampaigns, listReports, resolveReport, announce, getAuditLogs, grantEnterprisePlan,
  listTickets, createTicket, updateTicket,
  listPayments, listSubscriptions, getRevenueSummary, markPaymentDisputed, resolvePaymentDispute,
  getSettings, updateSettings,
  listVerifications, getVerification, approveVerification, rejectVerification, requestReuploadVerification,
  listContent, moderateContent,
  listNotifications, listFailedNotifications, pushNotification,
};
