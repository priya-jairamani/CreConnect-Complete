import { ROUTES } from '@/constants/routes';

const NICHES = ['fashion', 'beauty', 'gaming', 'tech', 'technology', 'fitness', 'food', 'lifestyle', 'travel'];
const LOCATIONS = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'peshawar', 'multan', 'faisalabad', 'quetta'];

function extractKeyword(text, list) {
  const lower = text.toLowerCase();
  return list.find((w) => lower.includes(w));
}

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Processes a natural-language message and returns a reply + optional navigation action.
 * This is a lightweight client-side intent matcher (no LLM backend yet) tuned to the
 * example prompts called out in the product brief.
 */
export function processCopilotMessage(text, { role }) {
  const lower = text.toLowerCase().trim();

  // ── Find creators / brands ────────────────────────────────────────
  if (/(find|discover|search|show me)/.test(lower) && /(creator|influencer)/.test(lower)) {
    const niche = extractKeyword(lower, NICHES);
    const location = extractKeyword(lower, LOCATIONS);
    const params = new URLSearchParams();
    if (niche) params.set('q', niche === 'technology' ? 'tech' : niche);
    if (location) params.set('location', titleCase(location));
    const qs = params.toString();
    const desc = [niche && titleCase(niche), location && `in ${titleCase(location)}`].filter(Boolean).join(' ');
    return {
      reply: desc
        ? `Here are ${desc} creators that match — opening the discovery workspace with your filters applied.`
        : `Opening the discovery workspace so you can browse creators.`,
      action: { type: 'navigate', to: `${ROUTES.BRAND_SEARCH}${qs ? `?${qs}` : ''}` },
    };
  }

  if (/(find|discover|search|show me)/.test(lower) && /brand/.test(lower)) {
    const niche = extractKeyword(lower, NICHES);
    const params = new URLSearchParams();
    if (niche) params.set('q', niche === 'technology' ? 'tech' : niche);
    const qs = params.toString();
    return {
      reply: niche
        ? `Looking for ${titleCase(niche)} brands — here's what's available.`
        : `Opening Find Brands so you can explore opportunities.`,
      action: { type: 'navigate', to: `${ROUTES.CREATOR_FIND_BRANDS}${qs ? `?${qs}` : ''}` },
    };
  }

  // ── Create a campaign ────────────────────────────────────────────
  if (/(create|start|launch|new)/.test(lower) && /campaign/.test(lower)) {
    return {
      reply: `Let's set up a new campaign. I've opened the Campaigns page — click "Create Campaign" and I can help you fill in the brief, budget, and goals.`,
      action: { type: 'navigate', to: ROUTES.BRAND_CAMPAIGNS },
    };
  }

  // ── Generate outreach message ────────────────────────────────────
  if (/(generate|write|draft|suggest).*(outreach|message|dm|email)/.test(lower) || /(outreach message)/.test(lower)) {
    if (role === 'brand') {
      return {
        reply:
          `Here's a draft outreach message:\n\n` +
          `"Hi! We love your content and think you'd be a great fit for our upcoming campaign. ` +
          `We'd love to collaborate — our budget is flexible and we can tailor deliverables to your audience. ` +
          `Would you be open to a quick chat about working together?"\n\n` +
          `Want me to adjust the tone or add campaign details?`,
      };
    }
    return {
      reply:
        `Here's a draft pitch you can send to a brand:\n\n` +
        `"Hi! I'm a creator focused on [your niche] with an engaged audience. ` +
        `I'd love to collaborate on a campaign — happy to share my media kit and recent results. ` +
        `Let me know if you're open to discussing rates and deliverables!"\n\n` +
        `Want a shorter or more formal version?`,
    };
  }

  // ── Explain match score ───────────────────────────────────────────
  if (/(explain|why).*(match|score|fit)/.test(lower)) {
    return {
      reply:
        `Match scores combine five signals: audience overlap with your target demographic, ` +
        `niche/industry alignment, location fit, budget compatibility, and a brand-safety/authenticity check ` +
        `(bot-follower detection + engagement consistency). A score above 85 means strong alignment across most signals — ` +
        `I'd recommend prioritizing those first.`,
    };
  }

  // ── Suggest campaign budget ───────────────────────────────────────
  if (/(suggest|recommend|estimate).*(budget)/.test(lower) || /budget.*(suggest|recommend)/.test(lower)) {
    return {
      reply:
        `For a typical micro-influencer campaign (10K–100K followers), brands on CreConnect usually budget ` +
        `Rs 8,000–25,000 per creator for a single post, or Rs 20,000–60,000 for a multi-deliverable package ` +
        `(post + story + reel). Larger creators (100K+) often run Rs 50,000+. Want me to tailor this to a specific niche or follower range?`,
    };
  }

  // ── Navigation shortcuts ───────────────────────────────────────────
  if (/(my collab|collaboration)/.test(lower)) {
    return {
      reply: `Here are your active collaborations.`,
      action: { type: 'navigate', to: role === 'brand' ? ROUTES.BRAND_CAMPAIGNS : ROUTES.CREATOR_COLLABS },
    };
  }

  if (/(message|inbox|chat)/.test(lower)) {
    return {
      reply: `Opening your messages.`,
      action: { type: 'navigate', to: role === 'brand' ? ROUTES.BRAND_MESSAGES : ROUTES.CREATOR_MESSAGES },
    };
  }

  if (/(notification|alert)/.test(lower)) {
    return {
      reply: `Opening your notifications.`,
      action: { type: 'navigate', to: role === 'brand' ? ROUTES.BRAND_REMINDERS : ROUTES.CREATOR_NOTIFS },
    };
  }

  if (/(dashboard|home|overview)/.test(lower)) {
    return {
      reply: `Taking you to your dashboard.`,
      action: { type: 'navigate', to: role === 'brand' ? ROUTES.BRAND_DASHBOARD : ROUTES.CREATOR_DASHBOARD },
    };
  }

  if (/^(hi|hello|hey)\b/.test(lower)) {
    return {
      reply: `Hey! I can help you discover creators or brands, draft outreach messages, explain match scores, suggest budgets, or jump to any page. What do you need?`,
    };
  }

  if (/(help|what can you do)/.test(lower)) {
    return {
      reply:
        `I can help with things like:\n` +
        `• "Find fashion creators in Lahore"\n` +
        `• "Create a campaign for skincare products"\n` +
        `• "Generate an outreach message"\n` +
        `• "Explain why this creator matches"\n` +
        `• "Suggest a campaign budget"\n` +
        `• "Open my messages" or "Go to dashboard"`,
    };
  }

  // ── Fallback ────────────────────────────────────────────────────────
  return {
    reply:
      `I'm not sure how to help with that yet, but I can find creators or brands, draft outreach, ` +
      `explain match scores, suggest budgets, or navigate the app. Try "help" to see examples.`,
  };
}
