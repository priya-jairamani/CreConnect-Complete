import { INDUSTRIES, LOCATIONS } from '@/constants/discoveryOptions';

/**
 * Lightweight "AI search" intent parser. Pulls recognizable industry,
 * location, and minimum-budget signals out of a free-text query so the
 * Smart Search bar can pre-fill structured filters from prompts like
 * "Beauty brands paying above $500" or "Food brands in Lahore".
 */
export function parseAISearch(query = '') {
  const lower = query.toLowerCase();

  const industry = INDUSTRIES.find((ind) => lower.includes(ind.toLowerCase())) ?? null;
  const location = LOCATIONS.find((loc) => loc !== 'Remote / Global' && lower.includes(loc.toLowerCase())) ?? null;

  let minBudget = null;
  const budgetMatch = lower.match(/(?:above|over|more than|>)\s*\$?\s*([\d,]+)/);
  if (budgetMatch) {
    minBudget = Number(budgetMatch[1].replace(/,/g, ''));
  }

  return { industry, location, minBudget, raw: query };
}
