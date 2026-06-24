/**
 * Lightweight "AI Application Generator" — produces a personalized
 * application/pitch message for a brand from the creator's profile,
 * niches, and the brand's first open campaign. Pure client-side text
 * templating (no LLM call), seeded so regenerating with a new variant
 * produces a different but stable phrasing.
 */
import { seededRandom } from './mockAnalytics';
import { getOpenCampaigns } from './mockBrandIntel';

const OPENERS = [
  (brand) => `Hi ${brand.companyName} team,`,
  (brand) => `Hello ${brand.companyName} team,`,
  () => `Hi there,`,
];

const HOOKS = [
  (niche, followers) => `I'm a ${niche} creator with ${followers}, and I'd love to collaborate with you.`,
  (niche, followers) => `As a ${niche} creator with ${followers}, your brand caught my eye as a great fit for my audience.`,
  (niche, followers) => `I create ${niche} content for ${followers}, and I think there's a great opportunity for us to work together.`,
];

const VALUE_PROPS = [
  (industry) => `My content consistently resonates with ${industry || 'your'} audiences, with strong engagement on past brand collaborations.`,
  (industry) => `I've worked on several ${industry || 'brand'} campaigns before, and my audience overlaps well with yours.`,
  (industry) => `My audience skews heavily toward ${industry || 'your'} category interests, which should translate into strong campaign performance.`,
];

const CLOSERS = [
  (name) => `I'm available to discuss rates and timelines whenever convenient — looking forward to hearing from you!\n\nBest,\n${name}`,
  (name) => `Happy to share more samples or discuss details — let me know what works best for you.\n\nThanks,\n${name}`,
  (name) => `Excited about the possibility of working together — let me know the next steps!\n\nWarm regards,\n${name}`,
];

export function generateApplicationPitch(brand = {}, profile = {}, creatorNiches = [], variant = 0) {
  const seed = `${brand.id ?? brand.companyName ?? 'brand'}-pitch-${variant}`;
  const rand = seededRandom(seed);

  const niche = (creatorNiches?.[0] || profile?.niche || brand.industry || 'content').toLowerCase();
  const name = profile?.displayName || profile?.fullName || profile?.name || 'there';
  const followers = profile?.followers ? `${profile.followers.toLocaleString()} followers` : 'an engaged, growing audience';

  const campaigns = getOpenCampaigns(brand);
  const campaign = campaigns[0];

  const opener = OPENERS[Math.floor(rand() * OPENERS.length)](brand);
  const hook = HOOKS[Math.floor(rand() * HOOKS.length)](niche, followers);
  const valueProp = VALUE_PROPS[Math.floor(rand() * VALUE_PROPS.length)](brand.industry);
  const closer = CLOSERS[Math.floor(rand() * CLOSERS.length)](name);

  const lines = [opener, '', hook, valueProp];

  if (campaign) {
    lines.push(
      `For "${campaign.title}", I can deliver ${campaign.deliverables?.[0]?.toLowerCase() ?? 'high-quality content'} within ${campaign.timeline}, meeting your requirement of "${campaign.requirements?.[0] ?? 'quality content'}".`
    );
  }

  lines.push('', closer);

  return lines.join('\n');
}
