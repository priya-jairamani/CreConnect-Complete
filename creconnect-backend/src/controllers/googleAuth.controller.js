const crypto = require('crypto');
const axios  = require('axios');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User, CreatorProfile, BrandProfile } = require('../models');
const { signAccessToken, signRefreshToken }  = require('../utils/jwt');
const { JWT_ACCESS_SECRET, FRONTEND_URL }    = require('../config/env');

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL          = process.env.BACKEND_URL || 'http://localhost:5000';
const CALLBACK_URI         = `${BACKEND_URL}/api/v1/auth/google/callback`;

function googleStart(req, res) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(
      `${FRONTEND_URL}/login?error=${encodeURIComponent('Google sign-in is not configured on this server.')}`
    );
  }

  const role  = (req.query.role || 'CREATOR').toUpperCase();
  const state = jwt.sign({ role }, JWT_ACCESS_SECRET, { expiresIn: '10m' });

  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  CALLBACK_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
    state,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

async function googleCallback(req, res) {
  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(oauthError)}`);
  }

  let role = 'CREATOR';
  try {
    const decoded = jwt.verify(state, JWT_ACCESS_SECRET);
    role = decoded.role || 'CREATOR';
  } catch { /* default to CREATOR */ }

  try {
    const { data: tokenData } = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri:  CALLBACK_URI,
        grant_type:    'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { data: gUser } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const { email, name, picture } = gUser;
    let user = await User.findOne({ where: { email } });

    if (!user) {
      const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const randomHash  = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const nestedData  = {};
      const include     = [];

      if (role === 'CREATOR') {
        nestedData.creatorProfile = { username: emailPrefix, displayName: name || emailPrefix, avatarUrl: picture || null };
        include.push({ model: CreatorProfile, as: 'creatorProfile' });
      } else if (role === 'BRAND') {
        nestedData.brandProfile = { companyName: name || emailPrefix, contactName: name || emailPrefix, industry: 'Other', logoUrl: picture || null };
        include.push({ model: BrandProfile, as: 'brandProfile' });
      }

      user = await User.create(
        { email, passwordHash: randomHash, role, status: 'PENDING', emailVerified: true, ...nestedData },
        { include }
      );
    }

    if (user.status === 'REJECTED') {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Account registration was rejected')}`);
    }
    if (user.status === 'SUSPENDED') {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Account suspended')}`);
    }

    const accessToken  = signAccessToken({ id: user.id, role: user.role, status: user.status });
    const refreshToken = signRefreshToken({ id: user.id });

    const qs = new URLSearchParams({ accessToken, refreshToken, userId: user.id, role: user.role, status: user.status });
    res.redirect(`${FRONTEND_URL}/auth/callback?${qs}`);
  } catch (err) {
    const msg = err?.response?.data?.error_description || err?.message || 'Google sign-in failed';
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(msg)}`);
  }
}

module.exports = { googleStart, googleCallback };
