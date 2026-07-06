const authSvc = require('../services/auth.service');
const { ok, created } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authSvc.register(req.body);
    created(res, { user }, 'Registration successful. Please verify your email.');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authSvc.login(req.body);
    ok(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const logout = (_req, res) => ok(res, {}, 'Logged out');

const refresh = async (req, res, next) => {
  try {
    const tokens = await authSvc.refresh(req.body.refreshToken);
    ok(res, tokens, 'Token refreshed');
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const result = await authSvc.me(req.user.id);
    ok(res, result);
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authSvc.verifyEmail(req.params.token);
    ok(res, {}, 'Email verified');
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authSvc.forgotPassword(req.body.email);
    ok(res, {}, 'If that email is registered, a reset link has been sent.');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    await authSvc.resetPassword(req.body.token, req.body.password);
    ok(res, {}, 'Password reset successful');
  } catch (err) { next(err); }
};

const sendOTP = async (req, res, next) => {
  try {
    const code = await authSvc.sendOTPService(req.body.email);
    const data = {};
    if (process.env.NODE_ENV !== 'production') data.devOtp = code;
    ok(res, data, 'OTP sent');
  } catch (err) { next(err); }
};

const verifyOTP = async (req, res, next) => {
  try {
    await authSvc.verifyOTPService(req.body.email, req.body.code);
    ok(res, {}, 'OTP verified');
  } catch (err) { next(err); }
};

const health = (_req, res) => ok(res, { status: 'ok', timestamp: new Date().toISOString() });

const checkOldPasswordSimilarity = async (req, res, next) => {
  try {
    const { email, oldPassword } = req.body;
    const result = await authSvc.checkOldPasswordSimilarity(email, oldPassword);
    ok(res, result, result.allowed ? 'Similarity check passed' : 'Similarity too low');
  } catch (err) { next(err); }
};

const resetWithOldPassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    await authSvc.resetWithOldPassword(email, oldPassword, newPassword);
    ok(res, {}, 'Password updated successfully');
  } catch (err) {
    // Attach similarity score to response if available
    if (err.similarity !== undefined) {
      return res.status(err.statusCode || 401).json({
        success: false,
        message: err.message,
        similarity: err.similarity,
      });
    }
    next(err);
  }
};

module.exports = { register, login, logout, refresh, me, verifyEmail, forgotPassword, resetPassword, resetWithOldPassword, checkOldPasswordSimilarity, sendOTP, verifyOTP, health };
