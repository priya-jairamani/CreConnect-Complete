/**
 * Resolve media URLs returned by the backend.
 *
 * Local uploads are stored as `/uploads/...`. In dev, Vite proxies that path to
 * the backend. We must NOT use stale absolute tunnel URLs baked into API
 * responses — extract the `/uploads/...` path and load via the current origin
 * (or VITE_MEDIA_BASE_URL when set).
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const UPLOADS_PATH_RE = /(\/uploads\/[^\s?#]+)/i;

function mediaOrigin() {
  const explicit = import.meta.env.VITE_MEDIA_BASE_URL;
  if (explicit) return String(explicit).replace(/\/$/, '');
  // Relative API base (e.g. `/api/v1`) → same-origin; Vite proxies `/uploads`
  if (String(API_BASE).startsWith('/')) return '';
  return String(API_BASE).replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

/** Pull `/uploads/...` out of any URL shape (relative, localhost, old tunnel host). */
export function extractUploadsPath(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(UPLOADS_PATH_RE);
  return match?.[1] ?? (url.startsWith('/uploads/') ? url.split('?')[0] : null);
}

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const uploadsPath = extractUploadsPath(url);
  if (uploadsPath) {
    const origin = mediaOrigin();
    return origin ? `${origin}${uploadsPath}` : uploadsPath;
  }

  return url;
}
