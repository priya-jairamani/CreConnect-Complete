/**
 * Verification Service — Provider-Agnostic Abstraction Layer
 *
 * The UI (VerificationCenter component) calls this service exclusively.
 * This layer decouples the UI from any specific identity provider, so that:
 *
 *   - NIC verification can be wired to NADRA, Jumio, Onfido, or manual review
 *   - Business verification can use Chamber of Commerce APIs, manual review, etc.
 *   - Domain verification uses DNS TXT record challenge (independent of provider)
 *   - Social verification can use OAuth or manual screenshot review
 *
 * To add a new provider, change PROVIDERS + getProviderForType() only.
 * No UI code needs to change.
 */

import { verificationApi } from '@/api/verification.api';
import { uploadApi }        from '@/api/upload.api';

/* ── Provider registry ──────────────────────────────────────────────
   Each provider key maps to an implementation. Currently all types
   use 'manual_review' (admin reviews documents in the admin panel).
   Future providers: 'nadra_api' | 'jumio' | 'onfido' | 'stripe_identity'
*/
export const PROVIDERS = {
  MANUAL_REVIEW:   'manual_review',
  NADRA_API:       'nadra_api',       // planned — not yet wired
  STRIPE_IDENTITY: 'stripe_identity', // planned — not yet wired
};

function getProviderForType(verificationType) {
  const routing = {
    nic:      PROVIDERS.MANUAL_REVIEW,  // swap to PROVIDERS.NADRA_API when ready
    business: PROVIDERS.MANUAL_REVIEW,
    domain:   PROVIDERS.MANUAL_REVIEW,
    social:   PROVIDERS.MANUAL_REVIEW,
    email:    PROVIDERS.MANUAL_REVIEW,
    phone:    PROVIDERS.MANUAL_REVIEW,
  };
  return routing[verificationType] ?? PROVIDERS.MANUAL_REVIEW;
}

/* ── Verification Service public API ────────────────────────────── */

export const verificationService = {
  /**
   * Load the current verification status for the signed-in user.
   * Returns an array of { type, status, submittedAt, reviewedAt, expiresAt }
   * Handles gracefully when the endpoint is not yet available.
   */
  async getStatus() {
    try {
      const { data } = await verificationApi.getStatus();
      const list = Array.isArray(data?.verifications)
        ? data.verifications
        : (Array.isArray(data) ? data : (data?.verifications ?? []));
      return {
        verifications: list,
        trustScore: data?.trustScore ?? 0,
        maxTrustScore: data?.maxTrustScore ?? 0,
        breakdown: data?.breakdown ?? {},
        error: null,
      };
    } catch {
      return { verifications: [], trustScore: 0, maxTrustScore: 0, breakdown: {}, error: null };
    }
  },

  /**
   * Submit a NIC verification.
   * Uploads front/back images first (to secure storage), then submits the record.
   * The provider is determined by getProviderForType('nic').
   */
  async submitNIC({ fullName, nicNumber, frontFile, backFile }, onProgress) {
    const provider = getProviderForType('nic');

    // Step 1 — upload documents to secure (private) storage
    const [frontRes, backRes] = await Promise.all([
      uploadApi.verificationDoc(frontFile, 'nic-front', (p) => onProgress?.('front', p)),
      uploadApi.verificationDoc(backFile,  'nic-back',  (p) => onProgress?.('back',  p)),
    ]);

    const frontDocumentId = frontRes.data?.documentId ?? frontRes.data?.id;
    const backDocumentId  = backRes.data?.documentId  ?? backRes.data?.id;
    const frontUrl        = frontRes.data?.secureUrl ?? frontRes.data?.url;
    const backUrl         = backRes.data?.secureUrl  ?? backRes.data?.url;

    // Step 2 — create verification record
    const { data } = await verificationApi.submitNIC({
      fullName,
      nicNumber,
      frontDocumentId,
      backDocumentId,
      frontUrl,
      backUrl,
      provider,
    });

    return data;
  },

  /**
   * Submit email OTP and verify.
   */
  async sendEmailCode() {
    await verificationApi.sendEmailCode();
  },

  async verifyEmailCode(code) {
    const { data } = await verificationApi.verifyEmailCode(code);
    return data;
  },

  /**
   * Submit phone OTP and verify.
   */
  async sendPhoneCode(phone) {
    await verificationApi.sendPhoneCode(phone);
  },

  async verifyPhoneCode(code) {
    const { data } = await verificationApi.verifyPhoneCode(code);
    return data;
  },

  /**
   * Submit social media verification.
   */
  async submitSocial(data) {
    const res = await verificationApi.submitSocial({ ...data, provider: getProviderForType('social') });
    return res.data;
  },

  /**
   * Submit business verification (brands only).
   * Uploads registration documents, then submits record.
   */
  async submitBusiness({ legalName, registrationNumber, files }, onProgress) {
    const provider = getProviderForType('business');
    const uploadedIds = await Promise.all(
      files.map((f, i) =>
        uploadApi.verificationDoc(f, 'business-reg', (p) => onProgress?.(i, p))
          .then((r) => r.data?.documentId ?? r.data?.id)
      )
    );

    const { data } = await verificationApi.submitBusiness({
      legalName, registrationNumber,
      documentIds: uploadedIds,
      provider,
    });
    return data;
  },

  /**
   * Initiate domain verification (generates a DNS TXT challenge).
   */
  async submitDomain(domain) {
    const { data } = await verificationApi.submitDomain({ domain });
    return data; // { txtRecord, verificationToken, expiresAt }
  },

  async checkDomain(domain) {
    const { data } = await verificationApi.checkDomain(domain);
    return data; // { verified: bool }
  },
};

/* ── Verification type metadata (shared with UI) ────────────────── */

export const VERIFICATION_TYPES_CREATOR = [
  {
    id:          'email',
    label:       'Email Verification',
    icon:        '✉️',
    description: 'Verify your email address to receive collaboration requests and platform notifications.',
    benefit:     'Required for all platform activity.',
    trustImpact: '+10 Trust Score',
  },
  {
    id:          'phone',
    label:       'Phone Verification',
    icon:        '📱',
    description: 'Verify your mobile number. Unlocks SMS notifications and two-factor authentication.',
    benefit:     'Enables 2FA and SMS alerts.',
    trustImpact: '+15 Trust Score',
  },
  {
    id:          'social',
    label:       'Social Media Verification',
    icon:        '🌐',
    description: 'Confirm ownership of your connected social accounts to display verified platform badges.',
    benefit:     'Platforms display a verified checkmark.',
    trustImpact: '+20 Trust Score',
  },
  {
    id:          'nic',
    label:       'National ID Verification',
    icon:        '🪪',
    description: 'Upload your CNIC/NICOP for identity verification. Documents are stored securely and never shared publicly.',
    benefit:     'Verified badge, priority ranking, higher earning limits.',
    trustImpact: '+35 Trust Score',
    requiresDocuments: true,
  },
];

export const VERIFICATION_TYPES_BRAND = [
  {
    id:          'email',
    label:       'Email Verification',
    icon:        '✉️',
    description: 'Verify the brand contact email to receive applications and platform updates.',
    benefit:     'Required for all platform activity.',
    trustImpact: '+10 Trust Score',
  },
  {
    id:          'phone',
    label:       'Phone Verification',
    icon:        '📱',
    description: 'Verify your business phone number.',
    benefit:     'Enables SMS alerts and 2FA.',
    trustImpact: '+15 Trust Score',
  },
  {
    id:          'business',
    label:       'Business Verification',
    icon:        '🏢',
    description: 'Submit business registration documents. Unlocks verified brand badge and higher campaign budgets.',
    benefit:     'Verified brand badge + higher budget limits.',
    trustImpact: '+30 Trust Score',
    requiresDocuments: true,
  },
  {
    id:          'domain',
    label:       'Domain Verification',
    icon:        '🌐',
    description: 'Prove ownership of your company domain by adding a DNS TXT record.',
    benefit:     'Domain-verified badge on brand profile.',
    trustImpact: '+20 Trust Score',
  },
  {
    id:          'nic',
    label:       'Owner / Admin NIC Verification',
    icon:        '🪪',
    description: 'Verify the identity of the account owner or admin via CNIC/NICOP.',
    benefit:     'Highest trust tier — required for escrow payouts > PKR 500,000.',
    trustImpact: '+25 Trust Score',
    requiresDocuments: true,
  },
];
