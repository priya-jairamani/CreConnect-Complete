'use strict';

const { detectIntent }  = require('../services/copilot/intentDetector');
const fetcher           = require('../services/copilot/dataFetcher');
const { buildReply }    = require('../services/copilot/responseBuilder');

async function chat(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const role   = req.user.role;   // 'BRAND' | 'CREATOR' | 'ADMIN'
    const userId = req.user.id;
    const { intent, params } = detectIntent(message);

    let data = {};

    switch (intent) {
      case 'find_creators':
        data.creators = await fetcher.fetchCreators(params);
        data.niche    = params.niche;
        data.location = params.location;
        break;

      case 'find_brands':
        data.brands   = await fetcher.fetchBrands(params);
        data.industry = params.industry;
        break;

      case 'ai_matches':
        data.matches = await fetcher.fetchAiMatches(userId, role);
        break;

      case 'explain_match':
        data.match = await fetcher.fetchAiMatchExplain(userId, role);
        break;

      case 'budget_suggest':
        data.stats = await fetcher.fetchBudgetStats();
        break;

      case 'outreach_draft':
        data.profile = await fetcher.fetchUserProfile(userId, role);
        break;

      case 'campaign_status':
        if (role === 'BRAND') data.status = await fetcher.fetchCampaignStatus(userId);
        break;

      case 'collab_status':
        data.status = await fetcher.fetchCollabStatus(userId, role);
        break;

      case 'earnings':
        if (role === 'CREATOR') data.earnings = await fetcher.fetchEarnings(userId);
        break;

      default:
        break;
    }

    const { reply, action, data: replyData } = buildReply(intent, data, { role, params });

    return res.json({
      success: true,
      data: { reply, action, extra: replyData, intent },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
