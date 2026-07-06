/** Normalize stored upload URLs to root-relative `/uploads/...` paths. */
function normalizeUploadUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const match = url.match(/(\/uploads\/[^\s?#]+)/i);
  return match ? match[1] : url;
}

module.exports = { normalizeUploadUrl };
