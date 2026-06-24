import api from './client';

// Setting Content-Type to undefined lets the browser set the full
// "multipart/form-data; boundary=..." header automatically.
// Never set it to 'multipart/form-data' manually — that strips the boundary
// and multer cannot parse the request.
const multipart = { headers: { 'Content-Type': undefined } };

function multipartWithProgress(onProgress) {
  return {
    headers: { 'Content-Type': undefined },
    onUploadProgress: onProgress
      ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); }
      : undefined,
  };
}

export const uploadApi = {
  avatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/upload/avatar', form, multipart);
  },

  banner: (file) => {
    const form = new FormData();
    form.append('banner', file);
    return api.post('/upload/banner', form, multipart);
  },

  campaignAsset: (campaignId, file) => {
    const form = new FormData();
    form.append('asset', file);
    return api.post(`/upload/campaign/${campaignId}/asset`, form, multipart);
  },

  chatAttachment: (conversationId, file) => {
    const form = new FormData();
    form.append('attachment', file);
    return api.post(`/upload/chat/${conversationId}/attachment`, form, multipart);
  },

  /* ── Creator Media Gallery ──────────────────────────────────────
     Returns: { fileUrl, thumbnailUrl, fileType, mimeType, size }
  */
  mediaFile: (file, onProgress) => {
    const form = new FormData();
    form.append('media', file);
    return api.post('/upload/media', form, multipartWithProgress(onProgress));
  },

  /* ── Verification Documents (private/secure storage) ────────────
     docType: 'nic-front' | 'nic-back' | 'business-reg' | 'tax-cert'
              | 'domain-proof' | 'owner-id'
     Backend stores in a private bucket — NOT publicly accessible.
     Only the document owner and admins can retrieve via secure URL.
     Returns: { documentId, secureUrl }
  */
  verificationDoc: (file, docType, onProgress) => {
    const form = new FormData();
    form.append('document', file);
    form.append('type', docType);
    return api.post(`/upload/verification/${docType}`, form, multipartWithProgress(onProgress));
  },
};
