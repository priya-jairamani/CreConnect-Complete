import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { RISK_META } from '@/utils/mockTrustSafety';

/** Risk level pill (Low / Medium / High / Critical Risk). */
export default function RiskBadge({ level }) {
  const meta = RISK_META[level] ?? RISK_META.low;
  return <Badge variant={meta.variant} label={meta.label} dot />;
}

RiskBadge.propTypes = {
  level: PropTypes.string.isRequired,
};
