const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { User, CreatorProfile, BrandProfile, AdminProfile } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError, NotFoundError, AppError } = require('../utils/errors');
const { sendVerificationEmail, sendPasswordReset, sendOTP } = require('./email.service');
const { createOTP, verifyOTP } = require('../utils/otp');

async function register({ email, password, role, ...profileData }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const emailToken   = uuid();
  const normalRole   = role.toUpperCase();

  const include = [];
  const nestedData = {};

  if (normalRole === 'CREATOR') {
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
    nestedData.creatorProfile = {
      username:    (profileData.username || emailPrefix).toLowerCase(),
      displayName: profileData.displayName || profileData.username || emailPrefix,
    };
    include.push({ model: CreatorProfile, as: 'creatorProfile' });
  } else if (normalRole === 'BRAND') {
    nestedData.brandProfile = {
      companyName: profileData.companyName || email.split('@')[0],
      contactName: profileData.contactName || null,
      industry:    profileData.industry    || null,
    };
    include.push({ model: BrandProfile, as: 'brandProfile' });
  }

  const user = await User.create(
    { email, passwordHash, role: normalRole, status: 'APPROVED', emailToken, ...nestedData },
    { include }
  );

  await sendVerificationEmail(email, emailToken);
  return _sanitize(user);
}

async function login({ email, password }) {
  const user = await User.findOne({
    where: { email },
    include: [
      { model: CreatorProfile, as: 'creatorProfile' },
      { model: BrandProfile,   as: 'brandProfile' },
      { model: AdminProfile,   as: 'adminProfile' },
    ],
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  if (user.status === 'SUSPENDED') throw new UnauthorizedError('Account suspended');

  const payload      = { id: user.id, role: user.role, status: user.status };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user.id });

  return { user: _sanitize(user), accessToken, refreshToken, profile: _profile(user) };
}

async function refresh(token) {
  let decoded;
  try { decoded = verifyRefreshToken(token); } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await User.findByPk(decoded.id);
  if (!user) throw new UnauthorizedError('User not found');

  const accessToken  = signAccessToken({ id: user.id, role: user.role, status: user.status });
  const refreshToken = signRefreshToken({ id: user.id });
  return { accessToken, refreshToken };
}

async function me(userId) {
  const user = await User.findByPk(userId, {
    include: [
      { model: CreatorProfile, as: 'creatorProfile' },
      { model: BrandProfile,   as: 'brandProfile' },
      { model: AdminProfile,   as: 'adminProfile' },
    ],
  });
  if (!user) throw new NotFoundError('User not found');
  // Return flat merged shape — same structure that login stores in localStorage
  return { ..._sanitize(user), profile: _profile(user) };
}

async function verifyEmail(token) {
  const user = await User.findOne({ where: { emailToken: token } });
  if (!user) throw new AppError('Invalid verification token', 400);
  await user.update({ emailVerified: true, emailToken: null, status: 'APPROVED' });
}

async function forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) return;
  const token = uuid();
  await user.update({ resetToken: token, resetTokenExp: new Date(Date.now() + 60 * 60 * 1000) });
  await sendPasswordReset(email, token);
}

async function resetPassword(token, newPassword) {
  const { Op } = require('sequelize');
  const user = await User.findOne({ where: { resetToken: token, resetTokenExp: { [Op.gte]: new Date() } } });
  if (!user) throw new AppError('Invalid or expired reset token', 400);
  await user.update({ passwordHash: await bcrypt.hash(newPassword, 12), resetToken: null, resetTokenExp: null });
}

async function sendOTPService(email) {
  const code = await createOTP(email);
  await sendOTP(email, code);
}

async function verifyOTPService(email, code) {
  const valid = await verifyOTP(email, code);
  if (!valid) throw new AppError('Invalid or expired OTP', 400);
}

function _sanitize(user) {
  const data = user.toJSON ? user.toJSON() : user;
  const { passwordHash, emailToken, resetToken, resetTokenExp, ...safe } = data;
  return safe;
}

function _profile(user) {
  return user.creatorProfile || user.brandProfile || user.adminProfile || null;
}

module.exports = { register, login, refresh, me, verifyEmail, forgotPassword, resetPassword, sendOTPService, verifyOTPService };
