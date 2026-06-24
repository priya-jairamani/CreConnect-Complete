'use strict';

const NICHES    = ['fashion','beauty','gaming','tech','technology','fitness','food','lifestyle','travel','education','finance'];
const LOCATIONS = ['lahore','karachi','islamabad','rawalpindi','peshawar','multan','faisalabad','quetta'];

const NICHE_MAP = {
  fashion: 'FASHION', beauty: 'BEAUTY', gaming: 'GAMING',
  tech: 'TECH', technology: 'TECH', fitness: 'FITNESS',
  food: 'FOOD', lifestyle: 'LIFESTYLE', travel: 'TRAVEL',
  education: 'EDUCATION', finance: 'FINANCE',
};

function extract(text, list) {
  const lower = text.toLowerCase();
  return list.find((w) => lower.includes(w)) || null;
}

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Classifies a natural-language message into one of 12 intents.
 * Returns { intent, params }
 */
function detectIntent(text) {
  const t = text.toLowerCase().trim();

  // ── Find creators ──────────────────────────────────────────────────
  if (/(find|discover|search|show|get|list|suggest).*(creator|influencer)/i.test(t) ||
      /(creator|influencer).*(find|search|in |from |near )/i.test(t)) {
    const nicheRaw = extract(t, NICHES);
    const location = extract(t, LOCATIONS);
    return {
      intent: 'find_creators',
      params: {
        niche:    nicheRaw ? NICHE_MAP[nicheRaw] : null,
        location: location ? titleCase(location) : null,
      },
    };
  }

  // ── Find brands ────────────────────────────────────────────────────
  if (/(find|discover|search|show|get|list).*(brand|company|sponsor|opportunity)/i.test(t) ||
      /(brand|company).*(find|search|in |from )/i.test(t)) {
    const industry = extract(t, NICHES);
    return {
      intent: 'find_brands',
      params: { industry: industry ? titleCase(industry) : null },
    };
  }

  // ── Explain match score (must come BEFORE ai_matches) ────────────
  if (/(explain|why|how come|reason).*(match|score|fit|rank)/i.test(t) ||
      /(match score|why.*score|score.*why)/i.test(t)) {
    return { intent: 'explain_match', params: {} };
  }

  // ── AI matches / recommendations ───────────────────────────────────
  if (/(ai match|my match|best match|top match|recommend|who should i work)/i.test(t) ||
      (/(match|recommend)/i.test(t) && /(show|get|find|see|what)/i.test(t))) {
    return { intent: 'ai_matches', params: {} };
  }

  // ── Budget suggestion ──────────────────────────────────────────────
  if (/(budget|cost|price|rate|how much|what.*pay|charge)/i.test(t) &&
      /(suggest|recommend|estimate|typical|average|should|what is)/i.test(t)) {
    const nicheRaw = extract(t, NICHES);
    return {
      intent: 'budget_suggest',
      params: { niche: nicheRaw ? NICHE_MAP[nicheRaw] : null },
    };
  }

  // ── Draft outreach / pitch ─────────────────────────────────────────
  if (/(generate|write|draft|create|help.*with).*(message|outreach|dm|email|pitch|proposal|text)/i.test(t) ||
      /(outreach|pitch|message|dm).*(write|generate|draft|help)/i.test(t)) {
    return { intent: 'outreach_draft', params: {} };
  }

  // ── Campaign create ────────────────────────────────────────────────
  if (/(create|start|launch|new|make).*(campaign)/i.test(t)) {
    return { intent: 'campaign_create', params: {} };
  }

  // ── Campaign status ────────────────────────────────────────────────
  if (/(my campaign|campaign status|campaign progress|how.*campaign|campaign.*how)/i.test(t)) {
    return { intent: 'campaign_status', params: {} };
  }

  // ── Collab status ──────────────────────────────────────────────────
  if (/(my collab|collaboration|active collab|collab status|collab.*how|how.*collab)/i.test(t)) {
    return { intent: 'collab_status', params: {} };
  }

  // ── Earnings ───────────────────────────────────────────────────────
  if (/(earning|paid|payment|revenue|income|how much.*(made|earned)|my money|payout)/i.test(t)) {
    return { intent: 'earnings', params: {} };
  }

  // ── Navigation shortcuts ───────────────────────────────────────────
  if (/(go to|open|take me|navigate|show me the).*(dashboard|home|overview)/i.test(t))
    return { intent: 'navigate', params: { page: 'dashboard' } };

  if (/(go to|open|take me|show me).*(message|inbox|chat)/i.test(t))
    return { intent: 'navigate', params: { page: 'messages' } };

  if (/(go to|open|take me|show me).*(notification|alert)/i.test(t))
    return { intent: 'navigate', params: { page: 'notifications' } };

  if (/(go to|open|take me|show me).*(setting|profile|account)/i.test(t))
    return { intent: 'navigate', params: { page: 'settings' } };

  if (/(go to|open|take me|show me).*(campaign)/i.test(t))
    return { intent: 'navigate', params: { page: 'campaigns' } };

  if (/(go to|open|take me|show me).*(collab)/i.test(t))
    return { intent: 'navigate', params: { page: 'collaborations' } };

  if (/(go to|open|take me|show me).*(payment|earning|payout)/i.test(t))
    return { intent: 'navigate', params: { page: 'payments' } };

  // ── Greeting / help ────────────────────────────────────────────────
  if (/^(hi|hello|hey|sup|yo)\b/i.test(t))
    return { intent: 'greeting', params: {} };

  if (/(help|what can you|what do you|capabilities|what.*do)/i.test(t))
    return { intent: 'help', params: {} };

  return { intent: 'unknown', params: {} };
}

module.exports = { detectIntent };
