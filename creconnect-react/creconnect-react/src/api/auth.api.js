import api from './client';

export const authApi = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
  sendOtp:        (data) => api.post('/auth/send-otp', data),
  verifyOtp:      (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:       (data) => api.post('/auth/reset-password', data),
  checkOldPassword:    (data) => api.post('/auth/check-old-password', data),
  resetWithOldPassword:(data) => api.post('/auth/reset-password-old', data),
  verifyEmail:    (token) => api.get(`/auth/verify-email/${token}`),
};
