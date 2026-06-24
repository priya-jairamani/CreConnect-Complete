import api from './api';

/**
 * All endpoints return { data, status } shaped Axios responses.
 * Each function is a thin wrapper; business logic lives in AuthContext.
 */

export const authService = {
  /** POST /auth/login */
  login: ({ email, password }) =>
    api.post('/auth/login', { email, password }),

  /** POST /auth/register/creator */
  registerCreator: (payload) =>
    api.post('/auth/register/creator', payload),

  /** POST /auth/register/brand */
  registerBrand: (payload) =>
    api.post('/auth/register/brand', payload),

  /** POST /auth/logout */
  logout: () =>
    api.post('/auth/logout'),

  /** POST /auth/forgot-password  – sends OTP to email */
  forgotPassword: ({ email }) =>
    api.post('/auth/forgot-password', { email }),

  /** POST /auth/verify-otp */
  verifyOtp: ({ email, otp }) =>
    api.post('/auth/verify-otp', { email, otp }),

  /** POST /auth/reset-password */
  resetPassword: ({ email, otp, newPassword }) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),

  /** POST /auth/refresh */
  refreshToken: ({ refreshToken }) =>
    api.post('/auth/refresh', { refreshToken }),

  /**
   * OAuth – redirect URL returned by backend.
   * Actual redirect is performed by the browser.
   */
  googleAuth:   () => api.get('/auth/google'),
  facebookAuth: () => api.get('/auth/facebook'),
  appleAuth:    () => api.get('/auth/apple'),
};
