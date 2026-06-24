import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { searchApi } from '@/api/search.api';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import { formatPKR } from '@/utils/formatters';
import { getBrandIntel, getOpenCampaigns, getOpportunityOverview } from '@/utils/mockBrandIntel';

const GROWTH_TIPS = [
  { icon: '⚡', text: 'Respond to brand invitations within 24 hours to boost your response-rate score.' },
  { icon: '🎬', text: 'Add video content to your portfolio — campaigns with video samples get 2x more invitations.' },
  { icon: '📈', text: 'Keep your follower and engagement stats up to date so brands can match you accurately.' },
  { icon: '🤝', text: 'Complete your profile niches and rates to appear in more brand searches.' },
];

export default function CollabEmptyState({ navigate }) {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    searchApi.brands({ limit: 6 })
      .then(({ data }) => { if (!cancelled) setBrands(data?.data ?? data ?? []); })
      .catch(() => { if (!cancelled) setBrands([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const enrichedBrands = brands.slice(0, 4).map((b) => ({ brand: b, intel: getBrandIntel(b) }));
  const trending = enrichedBrands.filter((b) => b.intel.badges.some((bd) => bd.key === 'trending')).slice(0, 3);
  const recommended = enrichedBrands.slice(0, 3);
  const overview = getOpportunityOverview(enrichedBrands.map((b) => ({ ...b.brand, intel: b.intel })), []);
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <span className="text-4xl block mb-3">🤝</span>
        <h2 className="text-fg text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>No collaborations yet</h2>
        <p className="text-fg-muted text-sm mt-1.5 max-w-md mx-auto">
          This is where your brand partnerships, deliverables, contracts, and payments will live. Get started by exploring opportunities below.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button variant="primary" size="sm" onClick={() => navigate?.(ROUTES.CREATOR_FIND_BRANDS)}>🔎 Find Brands</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate?.(ROUTES.CREATOR_FIND_BRANDS)}>📋 Browse Campaigns</Button>
        </div>
      </div>

      {/* Opportunity overview */}
      {!isLoading && enrichedBrands.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Recommended Brands', value: overview.recommendedBrands },
            { label: 'Open Invitations', value: overview.openInvitations },
            { label: 'High-Budget Campaigns', value: overview.highBudget },
            { label: 'Trending Brands', value: overview.trending },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{s.value}</p>
              <p className="text-fg-muted text-[11px] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* No invitations yet */}
      <section className="rounded-2xl p-5 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <span className="text-2xl block mb-2">✉️</span>
        <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>No invitations yet</p>
        <p className="text-fg-muted text-xs mt-1">When brands invite you to collaborate, they'll appear here. Apply to campaigns below to get noticed.</p>
      </section>

      {/* Suggested brands & recommended campaigns */}
      {!isLoading && recommended.length > 0 && (
        <section>
          <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            <span>🏢</span> Suggested Brands
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {recommended.map(({ brand, intel }) => {
              const campaigns = getOpenCampaigns(brand, 1);
              return (
                <div key={brand.id ?? brand.companyName} className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <Avatar src={brand.logoUrl} initials={(brand.companyName ?? '??').slice(0, 2).toUpperCase()} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-fg text-sm font-medium truncate">{brand.companyName}</p>
                      <p className="text-fg-muted text-[11px]">{brand.industry}</p>
                    </div>
                    <Badge variant="brand" label={`${intel.matchScore}% match`} />
                  </div>
                  {campaigns[0] && (
                    <div className="rounded-xl p-2.5 text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <p className="text-fg truncate">{campaigns[0].title}</p>
                      <p className="text-fg-muted mt-1">{formatPKR(campaigns[0].budgetMin)} – {formatPKR(campaigns[0].budgetMax)} · {campaigns[0].timeline}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending opportunities */}
      {!isLoading && trending.length > 0 && (
        <section>
          <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            <span>🔥</span> Trending Opportunities
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {trending.map(({ brand, intel }) => (
              <div key={brand.id ?? brand.companyName} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <Avatar src={brand.logoUrl} initials={(brand.companyName ?? '??').slice(0, 2).toUpperCase()} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-fg text-sm font-medium truncate">{brand.companyName}</p>
                  <p className="text-fg-muted text-[11px]">{intel.activeCampaigns} active campaign{intel.activeCampaigns === 1 ? '' : 's'} · {formatPKR(intel.avgBudget)} avg budget</p>
                </div>
                <Badge variant="danger" label="🔥 Trending" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Growth tips */}
      <section>
        <h3 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
          <span>🌱</span> Creator Growth Tips
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {GROWTH_TIPS.map((tip) => (
            <div key={tip.text} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <span className="text-lg flex-shrink-0">{tip.icon}</span>
              <p className="text-fg-muted text-xs leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

CollabEmptyState.propTypes = {
  navigate: PropTypes.func,
};
