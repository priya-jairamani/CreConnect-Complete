// Resolve a backend-stored URL that may be a root-relative path (/uploads/...)
// to an absolute URL using the configured backend origin.
const _backend = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/uploads/')) return `${_backend}${url}`;
  return url;
}
