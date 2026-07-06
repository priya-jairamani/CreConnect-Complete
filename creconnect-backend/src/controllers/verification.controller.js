const svc = require('../services/verification.service');
const { ok, created } = require('../utils/response');
const { uploadToCloudinary } = require('../middleware/upload');
const { normalizeUploadUrl } = require('../utils/media');

const getStatus  = async (req, res, next) => {
  try { ok(res, await svc.getStatus(req.user.id)); } catch (e) { next(e); }
};

const getHistory = async (req, res, next) => {
  try { ok(res, await svc.getHistory(req.user.id)); } catch (e) { next(e); }
};

const submitNIC = async (req, res, next) => {
  try {
    const v = await svc.submitNIC(req.user.id, req.body);
    created(res, { type: v.type, status: v.status.toLowerCase(), submittedAt: v.submittedAt }, 'NIC verification submitted');
  } catch (e) { next(e); }
};

const submitBusiness = async (req, res, next) => {
  try {
    const v = await svc.submitBusiness(req.user.id, req.body);
    created(res, { type: v.type, status: v.status.toLowerCase(), submittedAt: v.submittedAt }, 'Business verification submitted');
  } catch (e) { next(e); }
};

const submitDomain = async (req, res, next) => {
  try {
    const v = await svc.submitDomain(req.user.id, req.body);
    ok(res, { type: v.type, status: v.status.toLowerCase(), challengeToken: v.data?.challengeToken, submittedAt: v.submittedAt });
  } catch (e) { next(e); }
};

const submitSocial = async (req, res, next) => {
  try {
    const v = await svc.submitSocial(req.user.id, req.body);
    created(res, { type: v.type, status: v.status.toLowerCase(), submittedAt: v.submittedAt }, 'Social verification submitted');
  } catch (e) { next(e); }
};

// Upload a verification document and return its secure URL + publicId
const uploadDoc = async (req, res, next) => {
  try {
    if (!req.file) return res.status(422).json({ success: false, message: 'No file provided' });
    const docType = req.params.docType;
    const result  = await uploadToCloudinary(req.file.buffer, `verification/${docType}`, {
      resource_type: 'image',
    });
    ok(res, {
      documentId: normalizeUploadUrl(result.public_id || result.secure_url),
      secureUrl:  normalizeUploadUrl(result.secure_url),
    }, 'Document uploaded');
  } catch (e) { next(e); }
};

module.exports = { getStatus, getHistory, submitNIC, submitBusiness, submitDomain, submitSocial, uploadDoc };
