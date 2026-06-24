import api from './client';

/**
 * Verification API — all endpoints for the identity/document verification
 * workflow. The UI calls this through verificationService (abstraction layer),
 * not directly, so the underlying provider can be swapped without touching
 * any UI code.
 */
export const verificationApi = {
  /* ── Status & history ───────────────────────────────────────────
     Returns: { verifications: [{ type, status, submittedAt, reviewedAt, expiresAt, rejectionReason }] }
  */
  getStatus:            ()           => api.get('/verification/status'),
  getHistory:           ()           => api.get('/verification/history'),

  /* ── Email verification ─────────────────────────────────────────
     sendCode: triggers a verification email
     verify:   submits the 6-digit code
  */
  sendEmailCode:        ()           => api.post('/verification/email/send'),
  verifyEmailCode:      (code)       => api.post('/verification/email/verify', { code }),

  /* ── Phone verification ─────────────────────────────────────────
     sendCode: sends OTP to phone
     verify:   submits the OTP
  */
  sendPhoneCode:        (phone)      => api.post('/verification/phone/send', { phone }),
  verifyPhoneCode:      (code)       => api.post('/verification/phone/verify', { code }),

  /* ── National ID (NIC) verification ────────────────────────────
     data: { fullName, nicNumber, frontDocumentId, backDocumentId }
     Backend routes through configured nationalIdProvider (manual by default).
  */
  submitNIC:            (data)       => api.post('/verification/nic', data),

  /* ── Social media verification ──────────────────────────────────
     data: { platform, handle, verificationUrl }
  */
  submitSocial:         (data)       => api.post('/verification/social', data),

  /* ── Business verification (brands) ────────────────────────────
     data: { legalName, registrationNumber, documentIds[] }
  */
  submitBusiness:       (data)       => api.post('/verification/business', data),

  /* ── Domain verification (brands) ──────────────────────────────
     data: { domain }  — backend generates a DNS TXT record for the brand to add
  */
  submitDomain:         (data)       => api.post('/verification/domain', data),
  checkDomain:          (domain)     => api.get('/verification/domain/check', { params: { domain } }),

  /* ── Admin endpoints ────────────────────────────────────────────
     For Admin → Users & Verification page
  */
  adminGetPending:      (params)     => api.get('/admin/verifications', { params }),
  adminGetById:         (id)         => api.get(`/admin/verifications/${id}`),
  adminApprove:         (id)         => api.patch(`/admin/verifications/${id}/approve`),
  adminReject:          (id, reason) => api.patch(`/admin/verifications/${id}/reject`, { reason }),
  adminRequestReupload: (id, note)   => api.patch(`/admin/verifications/${id}/request-reupload`, { note }),
};
