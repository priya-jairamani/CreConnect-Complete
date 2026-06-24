'use strict';

// Frontend route constants per role
const ROUTES = {
  BRAND: {
    dashboard:      '/brand/dashboard',
    messages:       '/brand/messages',
    notifications:  '/brand/notifications',
    settings:       '/brand/settings',
    campaigns:      '/brand/campaigns',
    collaborations: '/brand/collaborations',
    payments:       '/brand/payments',
    search:         '/brand/search',
  },
  CREATOR: {
    dashboard:      '/creator/dashboard',
    messages:       '/creator/messages',
    notifications:  '/creator/notifications',
    settings:       '/creator/settings',
    collaborations: '/creator/collaborations',
    payments:       '/creator/payments',
    find_brands:    '/creator/find-brands',
  },
};

function pkr(n) {
  return `PKR ${Number(n || 0).toLocaleString('en-PK')}`;
}

/**
 * Builds the final { reply, action?, data? } response from the fetched data.
 */
function buildReply(intent, data, { role, params }) {
  const routes = ROUTES[role] || ROUTES.CREATOR;

  switch (intent) {

    // ── find_creators ──────────────────────────────────────────────────
    case 'find_creators': {
      const { creators = [], niche, location } = data;
      const filter = [niche, location ? `in ${location}` : null].filter(Boolean).join(' ');
      const searchUrl = `${routes.search || '/brand/search'}${niche ? `?q=${niche.toLowerCase()}` : ''}`;

      if (creators.length === 0) {
        return {
          reply: `No ${filter || ''} creators found right now. Try a broader niche or remove the location filter.`,
          action: { type: 'navigate', to: searchUrl },
        };
      }

      const list = creators.slice(0, 4).map((c, i) =>
        `${i + 1}. ${c.displayName} — ${(c.followerCount || 0).toLocaleString()} followers, ${c.engagementRate || 0}% engagement, ⭐ ${c.rating || '—'}`
      ).join('\n');

      return {
        reply: `Found ${creators.length} ${filter || ''} creator${creators.length !== 1 ? 's' : ''}:\n\n${list}\n\nOpening Discover Creators with your filters.`,
        action: { type: 'navigate', to: searchUrl },
        data:   creators.slice(0, 4),
      };
    }

    // ── find_brands ───────────────────────────────────────────────────
    case 'find_brands': {
      const { brands = [], industry } = data;
      const findUrl = `${routes.find_brands || '/creator/find-brands'}${industry ? `?q=${industry.toLowerCase()}` : ''}`;

      if (brands.length === 0) {
        return {
          reply: `No ${industry || ''} brands found yet. Try a different industry or browse all brands.`,
          action: { type: 'navigate', to: findUrl },
        };
      }

      const list = brands.slice(0, 4).map((b, i) =>
        `${i + 1}. ${b.companyName} — ${b.industry} (${b.brandSize || 'Growing'})${b.isVerified ? ' ✓ Verified' : ''}`
      ).join('\n');

      return {
        reply: `Found ${brands.length} ${industry || ''} brand${brands.length !== 1 ? 's' : ''}:\n\n${list}\n\nOpening Find Brands with your filter.`,
        action: { type: 'navigate', to: findUrl },
        data:   brands.slice(0, 4),
      };
    }

    // ── ai_matches ────────────────────────────────────────────────────
    case 'ai_matches': {
      const { matches = [] } = data;

      if (matches.length === 0) {
        return {
          reply: `No AI matches yet — the engine hasn't generated results for your profile. Ask your admin to trigger it, or use the "✦ AI Match" button on the ${role === 'BRAND' ? 'Discover Creators' : 'Find Brands'} page.`,
        };
      }

      if (role === 'BRAND') {
        const list = matches.slice(0, 4).map((m, i) => {
          const c = m.creator || {};
          return `${i + 1}. ${c.displayName || '?'} — Score ${m.matchScore}/100 (${c.niche || '?'}, ${(c.followerCount || 0).toLocaleString()} followers)`;
        }).join('\n');
        return {
          reply: `Your top AI-matched creators:\n\n${list}\n\nClick "✦ AI Match" on Discover Creators to see the full ranked list with score breakdowns.`,
          action: { type: 'navigate', to: routes.search || '/brand/search' },
          data:   matches.slice(0, 4),
        };
      }

      const list = matches.slice(0, 4).map((m, i) => {
        const b = m.brand || {};
        return `${i + 1}. ${b.companyName || '?'} — Score ${m.matchScore}/100 (${b.industry || '?'})`;
      }).join('\n');
      return {
        reply: `Your top AI-matched brands:\n\n${list}\n\nClick "✦ AI Match" on Find Brands to see the full ranked list.`,
        action: { type: 'navigate', to: routes.find_brands || '/creator/find-brands' },
        data:   matches.slice(0, 4),
      };
    }

    // ── explain_match ─────────────────────────────────────────────────
    case 'explain_match': {
      const { match } = data;

      if (!match) {
        return {
          reply: `No AI match data yet. Once the engine runs, I can give you a full breakdown — niche fit, engagement score, audience size, location, rating, collaboration history, and feedback signal.`,
        };
      }

      const b    = match.breakdown || {};
      const name = match.creator?.displayName || match.brand?.companyName || 'your top match';
      return {
        reply:
          `Here's why ${name} scored ${match.matchScore}/100 for you:\n\n` +
          `✦ Niche match      ${b.nicheMatch   ?? '—'} / 30\n` +
          `✦ Engagement       ${b.engagement   ?? '—'} / 20\n` +
          `✦ Audience fit     ${b.audienceFit  ?? '—'} / 15\n` +
          `✦ Location         ${b.locationMatch ?? '—'} / 10\n` +
          `✦ Rating           ${b.rating       ?? '—'} / 10\n` +
          `✦ History          ${b.history      ?? '—'} / 10\n` +
          `✦ Past feedback    ${b.feedback     ?? '—'} / 5\n\n` +
          `Scoring method: ${match.method === 'hybrid' ? 'Hybrid (content-based + collaborative filtering)' : 'Content-based scoring'}`,
      };
    }

    // ── budget_suggest ────────────────────────────────────────────────
    case 'budget_suggest': {
      const { stats } = data;

      if (!stats || stats.total === 0) {
        return {
          reply:
            `Not enough collaboration data yet for platform averages. General PKR benchmarks:\n\n` +
            `• Micro  (10K–100K followers)  → PKR 15,000 – 75,000\n` +
            `• Mid    (100K–500K followers) → PKR 75,000 – 250,000\n` +
            `• Macro  (500K+ followers)     → PKR 250,000+\n\n` +
            `I'll give you real averages once more collaborations complete on the platform.`,
        };
      }

      return {
        reply:
          `Based on ${stats.total} completed collaboration${stats.total !== 1 ? 's' : ''} on CreConnect:\n\n` +
          `• Average offer  ${pkr(stats.avg)}\n` +
          `• Lowest offer   ${pkr(stats.min)}\n` +
          `• Highest offer  ${pkr(stats.max)}\n\n` +
          `Tip: adjust based on follower count, engagement rate, and number of deliverables (reels, posts, stories).`,
      };
    }

    // ── outreach_draft ────────────────────────────────────────────────
    case 'outreach_draft': {
      const { profile } = data;

      if (role === 'BRAND') {
        const company = profile?.companyName || 'our brand';
        return {
          reply:
            `Here's a draft outreach message:\n\n` +
            `"Hi [Creator Name],\n\n` +
            `We're ${company} and we've been following your content — it really resonates with our audience. We'd love to explore a collaboration on an upcoming campaign.\n\n` +
            `We're flexible on deliverables and open on budget. Would you be open to a quick chat or can I send over more details?\n\n` +
            `Looking forward to connecting!"` +
            `\n\nWant a shorter version, a more formal tone, or help personalising it for a specific creator?`,
        };
      }

      const name        = profile?.displayName || profile?.username || 'I';
      const niche       = profile?.niche ? profile.niche.toLowerCase() : 'my niche';
      const followers   = profile?.followerCount ? `${(profile.followerCount).toLocaleString()} followers` : 'an engaged audience';
      const engagement  = profile?.engagementRate ? `${profile.engagementRate}% engagement` : '';

      return {
        reply:
          `Here's a pitch you can send to a brand:\n\n` +
          `"Hi [Brand Name],\n\n` +
          `I'm ${name}, a ${niche} creator with ${followers}${engagement ? ` and ${engagement}` : ''}. I'd love to collaborate on a campaign that genuinely connects with my audience.\n\n` +
          `Happy to share my media kit, recent campaign results, and discuss rates at your convenience. Looking forward to working together!"` +
          `\n\nWant a shorter version or a different tone?`,
      };
    }

    // ── campaign_create ───────────────────────────────────────────────
    case 'campaign_create':
      return {
        reply: `Let's set up a new campaign. Opening the Campaigns page — click "Create Campaign", fill in your objective, niche, budget, and deliverables, and it goes live instantly.`,
        action: { type: 'navigate', to: routes.campaigns || '/brand/campaigns' },
      };

    // ── campaign_status ───────────────────────────────────────────────
    case 'campaign_status': {
      const { status } = data;
      if (!status) return { reply: `Couldn't load campaign data. Make sure your brand profile is set up.` };

      if (status.total === 0) {
        return {
          reply: `You haven't created any campaigns yet. Want me to open the Campaigns page so you can launch your first one?`,
          action: { type: 'navigate', to: routes.campaigns || '/brand/campaigns' },
        };
      }

      const recent = status.campaigns.slice(0, 3).map((c, i) =>
        `${i + 1}. "${c.title}" — ${c.status}`
      ).join('\n');

      return {
        reply:
          `You have ${status.total} campaign${status.total !== 1 ? 's' : ''} — ${status.published} live, ${status.completed} completed.\n\n` +
          `Recent:\n${recent}`,
        action: { type: 'navigate', to: routes.campaigns || '/brand/campaigns' },
      };
    }

    // ── collab_status ─────────────────────────────────────────────────
    case 'collab_status': {
      const { status } = data;
      if (!status) return { reply: `Couldn't load collaboration data.` };

      if (status.total === 0) {
        return {
          reply: role === 'BRAND'
            ? `No collaborations yet. Create a campaign and start inviting creators to get started.`
            : `No collaborations yet. Apply to campaigns on Find Brands to start working with brands.`,
        };
      }

      const recent = status.collabs.slice(0, 3).map((c, i) => {
        const name = c.creator?.displayName || c.brand?.companyName || '?';
        return `${i + 1}. ${name} — ${c.status} (${c.stage || c.status})`;
      }).join('\n');

      return {
        reply:
          `You have ${status.total} collaboration${status.total !== 1 ? 's' : ''} — ${status.active} active, ${status.completed} completed.\n\n` +
          `Recent:\n${recent}`,
        action: { type: 'navigate', to: routes.collaborations || '/creator/collaborations' },
      };
    }

    // ── earnings ──────────────────────────────────────────────────────
    case 'earnings': {
      const { earnings } = data;
      if (!earnings) return { reply: `Couldn't load your earnings. Make sure your creator profile is complete.` };

      if (earnings.collabs === 0) {
        return {
          reply: `No completed collaborations yet — earnings will show once brands mark your deliverables complete and release payment. Keep delivering great work!`,
        };
      }

      return {
        reply:
          `Your earnings summary:\n\n` +
          `• Total earned      ${pkr(earnings.paid)}\n` +
          `• Pending release   ${pkr(earnings.pending)}\n` +
          `• Collaborations    ${earnings.collabs}`,
        action: { type: 'navigate', to: routes.payments || '/creator/payments' },
      };
    }

    // ── navigate ──────────────────────────────────────────────────────
    case 'navigate': {
      const page  = params?.page || 'dashboard';
      const to    = routes[page] || routes.dashboard || '/';
      const label = page.replace(/_/g, ' ');
      return {
        reply:  `Opening your ${label}.`,
        action: { type: 'navigate', to },
      };
    }

    // ── greeting ──────────────────────────────────────────────────────
    case 'greeting':
      return {
        reply: role === 'BRAND'
          ? `Hi! I'm your AI Copilot. I can find creators, show your AI matches, check your campaigns and collaborations, suggest real budgets from platform data, or draft outreach messages. What do you need?`
          : `Hi! I'm your AI Copilot. I can find brands, show your AI matches, check your collaborations, summarise your earnings, or draft a pitch — all from your real account data. What do you need?`,
      };

    // ── help ──────────────────────────────────────────────────────────
    case 'help': {
      const brandCmds =
        `• "Find fashion creators in Lahore"\n` +
        `• "Show my AI matches"\n` +
        `• "Suggest a campaign budget"\n` +
        `• "Create a new campaign"\n` +
        `• "How are my collaborations going?"\n` +
        `• "Generate an outreach message"\n` +
        `• "Explain my top match score"\n` +
        `• "Open my messages"`;

      const creatorCmds =
        `• "Find tech brands"\n` +
        `• "Show my AI matches"\n` +
        `• "How much have I earned?"\n` +
        `• "How are my collaborations going?"\n` +
        `• "Generate a pitch message"\n` +
        `• "Explain why a brand matches me"\n` +
        `• "Open my messages"`;

      return { reply: `Here's what I can help with:\n\n${role === 'BRAND' ? brandCmds : creatorCmds}` };
    }

    // ── unknown / fallback ────────────────────────────────────────────
    default:
      return {
        reply: `I'm not sure how to help with that. Try asking me to find creators or brands, check your collaborations, suggest a budget, or type "help" for a full list of things I can do.`,
      };
  }
}

module.exports = { buildReply };
