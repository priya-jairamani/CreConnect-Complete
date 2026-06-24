const { CreatorProfile, BrandProfile } = require('../models');
const { uploadToCloudinary } = require('../middleware/upload');
const { ok } = require('../utils/response');
const { ForbiddenError } = require('../utils/errors');

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new ForbiddenError('No file provided'));

    const result = await uploadToCloudinary(req.file.buffer, 'avatars', {
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });
    const url = result.secure_url;

    if (req.user.role === 'CREATOR') {
      await CreatorProfile.update({ avatarUrl: url }, { where: { userId: req.user.id } });
    } else if (req.user.role === 'BRAND') {
      await BrandProfile.update({ logoUrl: url }, { where: { userId: req.user.id } });
    }

    ok(res, { url }, 'Avatar uploaded');
  } catch (e) { next(e); }
};

const uploadBanner = async (req, res, next) => {
  try {
    if (!req.file) return next(new ForbiddenError('No file provided'));

    const result = await uploadToCloudinary(req.file.buffer, 'banners', {
      resource_type: 'image',
      transformation: [{ width: 1200, height: 400, crop: 'fill' }],
    });
    const url = result.secure_url;

    if (req.user.role === 'BRAND') {
      await BrandProfile.update({ bannerUrl: url }, { where: { userId: req.user.id } });
    } else if (req.user.role === 'CREATOR') {
      await CreatorProfile.update({ bannerUrl: url }, { where: { userId: req.user.id } });
    }

    ok(res, { url }, 'Banner uploaded');
  } catch (e) { next(e); }
};

const uploadCampaignAsset = async (req, res, next) => {
  try {
    if (!req.file) return next(new ForbiddenError('No file provided'));
    const result = await uploadToCloudinary(req.file.buffer, 'campaigns', { resource_type: 'auto' });
    ok(res, { url: result.secure_url }, 'Asset uploaded');
  } catch (e) { next(e); }
};

const uploadChatAttachment = async (req, res, next) => {
  try {
    if (!req.file) return next(new ForbiddenError('No file provided'));
    const result = await uploadToCloudinary(req.file.buffer, 'chat', { resource_type: 'auto' });
    ok(res, { url: result.secure_url }, 'Attachment uploaded');
  } catch (e) { next(e); }
};

const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) return next(new ForbiddenError('No file provided'));
    const isVideo   = req.file.mimetype.startsWith('video/');
    const fileType  = isVideo ? 'video' : 'image';
    const result    = await uploadToCloudinary(req.file.buffer, 'creator-media', {
      resource_type: isVideo ? 'video' : 'image',
    });
    ok(res, {
      fileUrl:      result.secure_url,
      thumbnailUrl: isVideo ? (result.eager?.[0]?.secure_url ?? null) : result.secure_url,
      fileType,
      mimeType:     req.file.mimetype,
      size:         req.file.size,
    }, 'Media uploaded');
  } catch (e) { next(e); }
};

module.exports = { uploadAvatar, uploadBanner, uploadCampaignAsset, uploadChatAttachment, uploadMedia };
