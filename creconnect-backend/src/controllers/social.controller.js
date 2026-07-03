const crypto  = require('crypto');
const axios   = require('axios');
const jwt     = require('jsonwebtoken');
const { Op }  = require('sequelize');
const { CreatorProfile, BrandProfile, SocialPlatform, SocialPost } = require('../models');
const { JWT_ACCESS_SECRET, FRONTEND_URL } = require('../config/env');
const { fetchPlatformProfile, fetchPlatformMedia, exchangeInstagramLongLivedToken, exchangeFacebookLongLivedToken, updateEngagementRate } = require('../services/socialMedia.service');

const CALLBACK_BASE = process.env.BACKEND_URL || 'http://localhost:5000';

const PLATFORM_CALLBACK_OVERRIDES = {
  FACEBOOK: process.env.FACEBOOK_CALLBACK_URL,
};

function callbackUrl(platform) {
  return PLATFORM_CALLBACK_OVERRIDES[platform] ||
    `${CALLBACK_BASE}/api/v1/social/${platform.toLowerCase()}/callback`;
}

const PLATFORMS = {
  INSTAGRAM: { authUrl: 'https://api.instagram.com/oauth/authorize',       tokenUrl: 'https://api.instagram.com/oauth/access_token',         clientId: process.env.INSTAGRAM_CLIENT_ID, secret: process.env.INSTAGRAM_CLIENT_SECRET, scope: 'user_profile,user_media' },
  // TIKTOK:    { authUrl: 'https://www.tiktok.com/v2/auth/authorize/',        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',           clientId: process.env.TIKTOK_CLIENT_KEY,   secret: process.env.TIKTOK_CLIENT_SECRET,   scope: 'user.info.basic,video.list' },
  // YOUTUBE:   { authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',     tokenUrl: 'https://oauth2.googleapis.com/token',                   clientId: process.env.GOOGLE_CLIENT_ID,    secret: process.env.GOOGLE_CLIENT_SECRET,   scope: 'https://www.googleapis.com/auth/youtube.readonly', extra: { access_type: 'offline', prompt: 'consent' } },
  LINKEDIN:  { authUrl: 'https://www.linkedin.com/oauth/v2/authorization',  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',         clientId: process.env.LINKEDIN_CLIENT_ID,  secret: process.env.LINKEDIN_CLIENT_SECRET, scope: 'r_liteprofile r_emailaddress' },
  FACEBOOK:  { authUrl: 'https://www.facebook.com/v25.0/dialog/oauth',      tokenUrl: 'https://graph.facebook.com/v25.0/oauth/access_token',   clientId: process.env.FACEBOOK_CLIENT_ID,  secret: process.env.FACEBOOK_CLIENT_SECRET, scope: 'email,public_profile', extra: { display: 'popup' } },
  TWITTER:   { authUrl: 'https://twitter.com/i/oauth2/authorize',           tokenUrl: 'https://api.twitter.com/2/oauth2/token',                clientId: process.env.TWITTER_CLIENT_ID,   secret: process.env.TWITTER_CLIENT_SECRET,  scope: 'tweet.read users.read follows.read', pkce: true },
};

function encodeState(p) { return jwt.sign(p, JWT_ACCESS_SECRET, { expiresIn: '10m' }); }
function decodeState(s) { return jwt.verify(s, JWT_ACCESS_SECRET); }
function pkceVerifier() { return crypto.randomBytes(32).toString('base64url'); }
function pkceChallenge(v) { return crypto.createHash('sha256').update(v).digest('base64url'); }

function popupHtml(payload, error = null) {
  const json = JSON.stringify(error ? { type: 'CC_SOCIAL_ERROR', error } : { type: 'CC_SOCIAL_CONNECTED', ...payload });
  return `<!DOCTYPE html><html><head><title>Connecting…</title>
<style>body{font-family:system-ui,sans-serif;background:#0a0b14;color:#f2f4fb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.box{text-align:center}.icon{font-size:2.5rem;margin-bottom:1rem}p{color:#9aa1b6;font-size:.875rem}</style>
</head><body><div class="box">
${error ? `<div class="icon">⚠</div><p>${String(error).replace(/</g,'&lt;')}</p>` : `<div class="icon">✓</div><p>Connected! Closing…</p>`}
</div>
<script>try{window.opener.postMessage(${json},'${FRONTEND_URL}')}catch(e){}setTimeout(function(){window.close()},800)</script>
</body></html>`;
}

async function getAuthUrl(req, res) {
  const platform = req.params.platform.toUpperCase();
  const cfg = PLATFORMS[platform];
  if (!cfg) return res.status(400).json({ success: false, message: 'Unsupported platform' });
  if (!cfg.clientId || !cfg.secret) return res.json({ success: true, data: { url: null, configured: false } });

  const cb = callbackUrl(platform);
  console.log(`\n[${platform}] Auth URL requested`);
  console.log(`[${platform}] Redirect URI:`, cb);
  let state = encodeState({ userId: req.user.id, role: req.user.role, platform });
  const params = new URLSearchParams({ client_id: cfg.clientId, redirect_uri: cb, response_type: 'code', scope: cfg.scope, state, ...(cfg.extra ?? {}) });

  if (cfg.pkce) {
    const v = pkceVerifier(); const c = pkceChallenge(v);
    params.set('code_challenge', c); params.set('code_challenge_method', 'S256');
    params.set('state', encodeState({ userId: req.user.id, role: req.user.role, platform, verifier: v }));
  }
  const fullUrl = `${cfg.authUrl}?${params}`;
  console.log(`[${platform}] Full OAuth URL:`, fullUrl);
  res.json({ success: true, data: { url: fullUrl, configured: true } });
}

async function handleCallback(req, res) {
  const platform = req.params.platform.toUpperCase();
  const cfg = PLATFORMS[platform];
  const { code, state, error: oauthError } = req.query;

  console.log('==================================================');
  console.log(`[${platform}] ── OAuth Callback HIT ──────────────`);
  console.log(`[${platform}] Query params:`, req.query);

  if (oauthError) {
    console.error(`[${platform}] OAuth denied:`, oauthError);
    return res.send(popupHtml(null, `Authorization denied: ${oauthError}`));
  }
  if (!cfg) return res.send(popupHtml(null, 'Unsupported platform.'));

  let stateData;
  try { stateData = decodeState(state); } catch {
    console.error(`[${platform}] Invalid state token`);
    return res.send(popupHtml(null, 'Invalid state — please try again.'));
  }
  console.log(`[${platform}] State decoded:`, { userId: stateData.userId, role: stateData.role });

  const cb = callbackUrl(platform);
  console.log(`[${platform}] Callback URL used:`, cb);

  try {
    const tokenParams = { client_id: cfg.clientId, client_secret: cfg.secret, code, redirect_uri: cb, grant_type: 'authorization_code', ...(cfg.pkce && stateData.verifier ? { code_verifier: stateData.verifier } : {}) };
    let accessToken, refreshToken, expiresIn;

    if (platform === 'TWITTER') {
      const creds = Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString('base64');
      const { data } = await axios.post(cfg.tokenUrl, new URLSearchParams(tokenParams), { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
      console.log(`[${platform}] Token response:`, data);
      accessToken = data.access_token; refreshToken = data.refresh_token ?? null; expiresIn = data.expires_in ?? 7200;
    } else {
      const { data } = await axios.post(cfg.tokenUrl, new URLSearchParams(tokenParams), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      console.log(`[${platform}] Token response:`, data);
      accessToken = data.access_token; refreshToken = data.refresh_token ?? null; expiresIn = data.expires_in ?? 3600;
    }

    if (platform === 'INSTAGRAM') {
      try {
        const ll = await exchangeInstagramLongLivedToken(accessToken);
        console.log(`[${platform}] Long-lived token exchanged, expires in ${ll.expiresInSecs}s`);
        accessToken = ll.accessToken; expiresIn = ll.expiresInSecs;
      } catch (e) { console.warn(`[${platform}] Long-lived token exchange failed:`, e?.message); }
    }

    if (platform === 'FACEBOOK') {
      try {
        const ll = await exchangeFacebookLongLivedToken(accessToken);
        console.log(`[${platform}] Long-lived token exchanged, expires in ${ll.expiresInSecs}s`);
        accessToken = ll.accessToken; expiresIn = ll.expiresInSecs;
      } catch (e) { console.warn(`[${platform}] Long-lived token exchange failed:`, e?.message); }
    }

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    console.log(`[${platform}] Fetching platform profile…`);
    const profile = await fetchPlatformProfile(platform, accessToken);
    console.log(`[${platform}] Profile:`, profile);

    const { userId, role } = stateData;
    let platformRecord = null;

    if (role === 'CREATOR') {
      const creator = await CreatorProfile.findOne({ where: { userId } });
      if (!creator) return res.send(popupHtml(null, 'Creator profile not found.'));
      await SocialPlatform.destroy({ where: { creatorId: creator.id, name: platform } });
      platformRecord = await SocialPlatform.create({ creatorId: creator.id, name: platform, handle: profile.handle, followerCount: profile.followerCount ?? 0, mediaCount: profile.mediaCount ?? 0, profilePictureUrl: profile.profilePictureUrl ?? null, platformUserId: profile.platformUserId ?? null, accessToken, refreshToken, tokenExpiresAt, isConnected: true, lastSyncedAt: new Date() });
      console.log(`[${platform}] Platform record saved, id:`, platformRecord.id);
      try {
        const posts = await fetchPlatformMedia(platform, accessToken, profile.platformUserId);
        console.log(`[${platform}] Media fetched: ${posts.length} posts`);
        if (posts.length) await SocialPost.bulkCreate(posts.map((p) => ({ ...p, platformId: platformRecord.id })), { updateOnDuplicate: ['caption','mediaUrl','thumbnailUrl','permalink','likeCount','commentCount','viewCount','shareCount','updatedAt'], ignoreDuplicates: false });
        await updateEngagementRate(platformRecord.id);
      } catch (e) { console.warn(`[${platform}] Media sync failed:`, e?.message); }
    } else if (role === 'BRAND') {
      const fm = { TWITTER:'twitter', INSTAGRAM:'instagram', TIKTOK:'tiktok', YOUTUBE:'youtube', LINKEDIN:'linkedin', FACEBOOK:'facebook' };
      if (fm[platform]) await BrandProfile.update({ [fm[platform]]: profile.handle }, { where: { userId } });
      console.log(`[${platform}] Brand profile updated with handle:`, profile.handle);
    }

    console.log(`[${platform}] ✓ Connection successful`);
    res.send(popupHtml({ platform, handle: profile.handle, followerCount: profile.followerCount ?? 0, profilePictureUrl: profile.profilePictureUrl ?? null, platformId: platformRecord?.id ?? null }));
  } catch (err) {
    console.error(`[${platform}] ✗ Error:`, err?.response?.data || err?.message);
    res.send(popupHtml(null, err?.response?.data?.error_description || err?.message || 'Connection failed'));
  }
}

async function getPosts(req, res, next) {
  try {
    const platform = await SocialPlatform.findByPk(req.params.platformId);
    if (!platform) return next(Object.assign(new Error('Platform not found'), { statusCode: 404 }));
    const creator = await CreatorProfile.findOne({ where: { userId: req.user.id } });
    if (!creator || platform.creatorId !== creator.id) return next(Object.assign(new Error('Forbidden'), { statusCode: 403 }));
    const posts = await SocialPost.findAll({ where: { platformId: platform.id }, order: [['postedAt', 'DESC']], limit: 50 });
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
}

async function syncPosts(req, res, next) {
  try {
    const platform = await SocialPlatform.findByPk(req.params.platformId);
    if (!platform) return next(Object.assign(new Error('Platform not found'), { statusCode: 404 }));
    const creator = await CreatorProfile.findOne({ where: { userId: req.user.id } });
    if (!creator || platform.creatorId !== creator.id) return next(Object.assign(new Error('Forbidden'), { statusCode: 403 }));
    if (!platform.accessToken) return res.status(400).json({ success: false, message: 'No access token — reconnect this platform.' });
    const posts = await fetchPlatformMedia(platform.name, platform.accessToken, platform.platformUserId);
    if (posts.length) await SocialPost.bulkCreate(posts.map((p) => ({ ...p, platformId: platform.id })), { updateOnDuplicate: ['caption','mediaUrl','thumbnailUrl','permalink','likeCount','commentCount','viewCount','shareCount','updatedAt'], ignoreDuplicates: false });
    await platform.update({ lastSyncedAt: new Date() });
    await updateEngagementRate(platform.id);
    res.json({ success: true, data: { synced: posts.length } });
  } catch (err) { next(err); }
}

module.exports = { getAuthUrl, handleCallback, getPosts, syncPosts };
