const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require('../config/env');

// Only use Cloudinary when credentials are real (not the default placeholders)
const PLACEHOLDER = /^your_|^REPLACE_ME|^changeme|^xxx/i;
const IS_CLOUDINARY = !!(
  CLOUDINARY_CLOUD_NAME && !PLACEHOLDER.test(CLOUDINARY_CLOUD_NAME) &&
  CLOUDINARY_API_KEY    && !PLACEHOLDER.test(CLOUDINARY_API_KEY)    &&
  CLOUDINARY_API_SECRET && !PLACEHOLDER.test(CLOUDINARY_API_SECRET)
);

if (IS_CLOUDINARY) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

// Local fallback directory (used when Cloudinary is not configured)
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function saveLocally(buffer, folder) {
  const dir = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ext      = '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  const BASE_URL = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000';
  return Promise.resolve({ secure_url: `${BASE_URL}/uploads/${folder}/${filename}` });
}

// Use memoryStorage so we can pipe the buffer to Cloudinary or write it locally
const memStorage = multer.memoryStorage();

const makeUploader = (folder, sizeLimitMB) =>
  multer({ storage: memStorage, limits: { fileSize: sizeLimitMB * 1024 * 1024 } });

const uploadAvatar         = makeUploader('avatars',   5);
const uploadCampaignAsset  = makeUploader('campaigns', 20);
const uploadChatAttachment = makeUploader('chat',      10);

function uploadToCloudinary(buffer, folder, options = {}) {
  if (!IS_CLOUDINARY) {
    return saveLocally(buffer, folder);
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `creconnect/${folder}`, ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  }).catch((err) => {
    // If Cloudinary fails at runtime (e.g. wrong credentials), fall back to local storage
    require('../utils/logger').warn(`Cloudinary upload failed (${err.message}), falling back to local storage`);
    return saveLocally(buffer, folder);
  });
}

module.exports = { uploadAvatar, uploadCampaignAsset, uploadChatAttachment, cloudinary, uploadToCloudinary, makeUploader };
