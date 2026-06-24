import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { RISK_META } from '@/utils/mockCampaignIntelligence';

/** Campaign risk level pill (Low / Medium / High / Critical). */
export default function CampaignRiskBadge({ level }) {
  const meta = RISK_META[level] ?? RISK_META.low;
  return <Badge variant={meta.variant} label={meta.label} dot />;
}

CampaignRiskBadge.propTypes = {
  level: PropTypes.string.isRequired,
};
