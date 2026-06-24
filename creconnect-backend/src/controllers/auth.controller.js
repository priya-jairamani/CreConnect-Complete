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
    await authSvc.sendOTPService(req.body.email);
    ok(res, {}, 'OTP sent');
  } catch (err) { next(err); }
};

const verifyOTP = async (req, res, next) => {
  try {
    await authSvc.verifyOTPService(req.body.email, req.body.code);
    ok(res, {}, 'OTP verified');
  } catch (err) { next(err); }
};

const health = (_req, res) => ok(res, { status: 'ok', timestamp: new Date().toISOString() });

module.exports = { register, login, logout, refresh, me, verifyEmail, forgotPassword, resetPassword, sendOTP, verifyOTP, health };
