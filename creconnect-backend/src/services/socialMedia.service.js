const axios = require('axios');

async function exchangeInstagramLongLivedToken(shortToken) {
  const { data } = await axios.get('https://graph.instagram.com/access_token', {
    params: { grant_type: 'ig_exchange_token', client_secret: process.env.INSTAGRAM_CLIENT_SECRET, access_token: shortToken },
  });
  return { accessToken: data.access_token, expiresInSecs: data.expires_in ?? 5183944 };
}

async function fetchInstagramProfile(accessToken) {
  const { data } = await axios.get('https://graph.instagram.com/me', {
    params: { fields: 'id,username,media_count,account_type', access_token: accessToken },
  });
  return { platformUserId: data.id, handle: `@${data.username}`, mediaCount: data.media_count ?? 0, followerCount: 0 };
}

async function fetchInstagramMedia(accessToken) {
  const { data } = await axios.get('https://graph.instagram.com/me/media', {
    params: { fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count', limit: 20, access_token: accessToken },
  });
  return (data.data ?? []).map((p) => ({
    externalId: p.id, mediaType: p.media_type === 'VIDEO' ? 'REEL' : p.media_type === 'CAROUSEL_ALBUM' ? 'CAROUSEL_ALBUM' : 'IMAGE',
    caption: p.caption ?? null, mediaUrl: p.media_url ?? null, thumbnailUrl: p.thumbnail_url ?? p.media_url ?? null,
    permalink: p.permalink ?? null, likeCount: p.like_count ?? 0, commentCount: p.comments_count ?? 0, viewCount: 0, shareCount: 0,
    postedAt: p.timestamp ? new Date(p.timestamp) : null,
  }));
}

async function fetchYoutubeProfile(accessToken) {
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
    params: { part: 'snippet,statistics,contentDetails', mine: true }, headers: { Authorization: `Bearer ${accessToken}` },
  });
  const ch = data.items?.[0];
  return {
    platformUserId: ch?.id ?? null,
    handle: `@${ch?.snippet?.customUrl?.replace(/^@/, '') ?? ch?.snippet?.title ?? 'channel'}`,
    followerCount: parseInt(ch?.statistics?.subscriberCount ?? 0, 10),
    mediaCount: parseInt(ch?.statistics?.videoCount ?? 0, 10),
    profilePictureUrl: ch?.snippet?.thumbnails?.high?.url ?? null,
  };
}

async function fetchYoutubeMedia(accessToken) {
  const { data: ch } = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
    params: { part: 'contentDetails', mine: true }, headers: { Authorization: `Bearer ${accessToken}` },
  });
  const playlistId = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) return [];
  const { data: pl } = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
    params: { part: 'snippet,contentDetails', playlistId, maxResults: 20 }, headers: { Authorization: `Bearer ${accessToken}` },
  });
  const ids = (pl.items ?? []).map((i) => i.contentDetails?.videoId).filter(Boolean);
  if (!ids.length) return [];
  const { data: vd } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: { part: 'snippet,statistics', id: ids.join(',') }, headers: { Authorization: `Bearer ${accessToken}` },
  });
  return (vd.items ?? []).map((v) => ({
    externalId: v.id, mediaType: 'VIDEO', caption: v.snippet?.title ?? null,
    mediaUrl: `https://www.youtube.com/watch?v=${v.id}`, thumbnailUrl: v.snippet?.thumbnails?.high?.url ?? null,
    permalink: `https://www.youtube.com/watch?v=${v.id}`,
    likeCount: parseInt(v.statistics?.likeCount ?? 0, 10), commentCount: parseInt(v.statistics?.commentCount ?? 0, 10),
    viewCount: parseInt(v.statistics?.viewCount ?? 0, 10), shareCount: 0,
    postedAt: v.snippet?.publishedAt ? new Date(v.snippet.publishedAt) : null,
  }));
}

async function fetchTikTokProfile(accessToken) {
  const { data } = await axios.post('https://open.tiktokapis.com/v2/user/info/', {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { fields: 'open_id,display_name,avatar_url,follower_count,video_count' },
  });
  const u = data?.data?.user;
  return { platformUserId: u?.open_id ?? null, handle: `@${u?.display_name ?? 'user'}`, followerCount: u?.follower_count ?? 0, mediaCount: u?.video_count ?? 0, profilePictureUrl: u?.avatar_url ?? null };
}

async function fetchTikTokMedia(accessToken) {
  const { data } = await axios.post('https://open.tiktokapis.com/v2/video/list/', { max_count: 20 }, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { fields: 'id,title,video_description,cover_image_url,share_url,like_count,comment_count,share_count,view_count,create_time' },
  });
  return (data?.data?.videos ?? []).map((v) => ({
    externalId: v.id, mediaType: 'VIDEO', caption: v.video_description || v.title || null,
    mediaUrl: v.share_url ?? null, thumbnailUrl: v.cover_image_url ?? null, permalink: v.share_url ?? null,
    likeCount: v.like_count ?? 0, commentCount: v.comment_count ?? 0, viewCount: v.view_count ?? 0, shareCount: v.share_count ?? 0,
    postedAt: v.create_time ? new Date(v.create_time * 1000) : null,
  }));
}

async function fetchTwitterProfile(accessToken) {
  const { data } = await axios.get('https://api.twitter.com/2/users/me', {
    params: { 'user.fields': 'public_metrics,username,profile_image_url' }, headers: { Authorization: `Bearer ${accessToken}` },
  });
  const u = data?.data;
  return { platformUserId: u?.id ?? null, handle: `@${u?.username ?? 'user'}`, followerCount: u?.public_metrics?.followers_count ?? 0, profilePictureUrl: u?.profile_image_url?.replace('_normal', '_400x400') ?? null };
}

async function fetchLinkedInProfile(accessToken) {
  const { data } = await axios.get('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
  const name = `${data?.localizedFirstName ?? ''} ${data?.localizedLastName ?? ''}`.trim();
  return { platformUserId: data.id ?? null, handle: name || 'LinkedIn User', followerCount: 0 };
}

const FETCHERS = {
  INSTAGRAM: { profile: fetchInstagramProfile, media: fetchInstagramMedia },
  YOUTUBE:   { profile: fetchYoutubeProfile,   media: fetchYoutubeMedia   },
  TIKTOK:    { profile: fetchTikTokProfile,     media: fetchTikTokMedia    },
  TWITTER:   { profile: fetchTwitterProfile,    media: async (token, uid) => [] },
  LINKEDIN:  { profile: fetchLinkedInProfile,   media: async () => []       },
  FACEBOOK:  { profile: async () => ({ handle: 'Facebook User', followerCount: 0 }), media: async () => [] },
};

async function fetchPlatformProfile(platform, accessToken) {
  const fetcher = FETCHERS[platform]?.profile;
  if (!fetcher) throw new Error(`No profile fetcher for ${platform}`);
  return fetcher(accessToken);
}

async function fetchPlatformMedia(platform, accessToken, platformUserId) {
  const fetcher = FETCHERS[platform]?.media;
  if (!fetcher) return [];
  return fetcher(accessToken, platformUserId);
}

module.exports = { exchangeInstagramLongLivedToken, fetchPlatformProfile, fetchPlatformMedia };
