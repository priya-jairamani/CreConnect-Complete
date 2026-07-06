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
    { email, passwordHash, passwordHint: makePasswordHint(password), role: normalRole, status: 'APPROVED', emailToken, ...nestedData },
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
  console.log('user', user);
  const passwordMatch = user && await bcrypt.compare(password, user.passwordHash);
  if (!user || !passwordMatch) throw new UnauthorizedError('Invalid email or password');
  if (user.status === 'SUSPENDED') throw new UnauthorizedError('Account suspended');

  // If this account was created before the passwordHint feature, save the hint now
  // so the "reset via old password" similarity check works in future
  if (!user.passwordHint) {
    user.update({ passwordHint: makePasswordHint(password) }).catch(() => {});
  }

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

/* ─── Password hint helpers ─────────────────────────────────────────
   We store the sorted unique lowercase characters of the password as
   a plain comma-separated string so we can compute character-set
   similarity at reset time without storing the plaintext.
   Example: "Secret@1" → "1,@,c,e,r,s,t"
*/
function makePasswordHint(password) {
  const unique = [...new Set(password.toLowerCase().split(''))].sort();
  return unique.join(',');
}

function similarityScore(hintA, hintB) {
  if (!hintA || !hintB) return 0;
  const setA = new Set(hintA.split(','));
  const setB = new Set(hintB.split(','));
  const intersection = [...setA].filter(c => setB.has(c)).length;
  const union        = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union; // Jaccard similarity
}

async function checkOldPasswordSimilarity(email, enteredPassword) {
  const { Op } = require('sequelize');
  const user = await User.findOne({ where: { email: { [Op.iLike]: email.trim() } } });
  if (!user) throw new AppError('No account found with that email.', 404);

  // Accounts registered before the hint feature — try a small set of common
  // variations (trim, case) via bcrypt so the user doesn't need to be exact.
  if (!user.passwordHint) {
    const variants = [
      enteredPassword,
      enteredPassword.trim(),
      enteredPassword.toLowerCase(),
      enteredPassword.toUpperCase(),
      enteredPassword.trim().toLowerCase(),
    ];
    for (const v of variants) {
      if (await bcrypt.compare(v, user.passwordHash)) {
        // Save hint now so next time full similarity works
        user.update({ passwordHint: makePasswordHint(v) }).catch(() => {});
        return { similarity: 100, allowed: true };
      }
    }
    // None matched — tell the user to log in first OR use email reset
    return {
      similarity: 0,
      allowed: false,
      hint: 'Your account does not have a password fingerprint yet. Please log in once with your correct password, then try this option again — or use Email Reset.',
    };
  }

  const enteredHint = makePasswordHint(enteredPassword);
  const score       = similarityScore(enteredHint, user.passwordHint);
  const pct         = Math.round(score * 100);

  return { similarity: pct, allowed: score >= 0.5 };
}

async function resetWithOldPassword(email, enteredPassword, newPassword) {
  const { Op } = require('sequelize');
  const user = await User.findOne({ where: { email: { [Op.iLike]: email.trim() } } });
  if (!user) throw new AppError('No account found with that email.', 404);

  if (!user.passwordHint) {
    // Old account — try common variations
    const variants = [
      enteredPassword,
      enteredPassword.trim(),
      enteredPassword.toLowerCase(),
      enteredPassword.toUpperCase(),
      enteredPassword.trim().toLowerCase(),
    ];
    let matched = false;
    for (const v of variants) {
      if (await bcrypt.compare(v, user.passwordHash)) { matched = true; break; }
    }
    if (!matched) throw new AppError('Password does not match. Please log in once first to enable similarity reset, or use Email Reset.', 401);
  } else {
    // New account — use character-set similarity (≥50% required)
    const enteredHint = makePasswordHint(enteredPassword);
    const score       = similarityScore(enteredHint, user.passwordHint);
    const pct         = Math.round(score * 100);

    if (score < 0.5) {
      throw Object.assign(
        new AppError(`Password similarity is only ${pct}% — at least 50% is required. Please use the email reset option.`, 401),
        { similarity: pct }
      );
    }
  }

  // Prevent setting the exact same password again
  const isSame = await bcrypt.compare(newPassword, user.passwordHash);
  if (isSame) throw new AppError('New password must be different from your current one.', 400);

  const newHash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash: newHash, passwordHint: makePasswordHint(newPassword) });
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
  const newHash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash: newHash, passwordHint: makePasswordHint(newPassword), resetToken: null, resetTokenExp: null });
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
  const { passwordHash, passwordHint, emailToken, resetToken, resetTokenExp, ...safe } = data;
  return safe;
}

function _profile(user) {
  return user.creatorProfile || user.brandProfile || user.adminProfile || null;
}

module.exports = { register, login, refresh, me, verifyEmail, forgotPassword, resetPassword, resetWithOldPassword, checkOldPasswordSimilarity, sendOTPService, verifyOTPService };
