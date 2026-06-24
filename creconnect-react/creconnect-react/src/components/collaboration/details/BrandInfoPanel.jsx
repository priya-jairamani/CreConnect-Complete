import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import {
  getBrandIntel, getBrandMeta, getPaymentReliability, getBrandReviews,
} from '@/utils/mockBrandIntel';

export default function BrandInfoPanel({ item }) {
  const brand = useMemo(() => ({
    companyName: item.brandName,
    logoUrl: item.brandLogo,
    industry: item.industry,
  }), [item]);

  const intel = useMemo(() => getBrandIntel(brand), [brand]);
  const meta = useMemo(() => getBrandMeta(brand), [brand]);
  const payment = useMemo(() => getPaymentReliability(brand), [brand]);
  const { reviews } = useMemo(() => getBrandReviews(brand, 1), [brand]);

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="lg" />
        <div className="min-w-0">
          <h4 className="text-fg font-semibold text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{item.brandName}</h4>
          <p className="text-fg-muted text-xs mt-0.5">{item.industry || 'General'} · {meta.headquarters}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl p-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{intel.trustScore}</p>
          <p className="text-fg-muted text-[10px] mt-0.5">Trust Score</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{payment.completionRate}%</p>
          <p className="text-fg-muted text-[10px] mt-0.5">Payment Reliability</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{intel.responseRate}%</p>
          <p className="text-fg-muted text-[10px] mt-0.5">Response Rate</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-fg font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{intel.completedCollaborations}</p>
          <p className="text-fg-muted text-[10px] mt-0.5">Past Collaborations</p>
        </div>
      </div>

      {payment.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {payment.badges.map((b) => (
            <Badge key={b.key} variant={b.variant} label={`${b.icon} ${b.label}`} />
          ))}
        </div>
      )}

      {reviews?.[0] && (
        <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1 text-warning text-xs mb-1">
            {'★'.repeat(Math.round(reviews[0].rating))}{'☆'.repeat(5 - Math.round(reviews[0].rating))}
            <span className="text-fg-muted ml-1">{reviews[0].rating.toFixed(1)}</span>
          </div>
          <p className="text-fg-muted text-xs leading-relaxed">&ldquo;{reviews[0].comment}&rdquo;</p>
          <p className="text-fg-muted text-[10px] mt-1.5">— {reviews[0].creator}</p>
        </div>
      )}
    </div>
  );
}

BrandInfoPanel.propTypes = {
  item: PropTypes.object.isRequired,
};
