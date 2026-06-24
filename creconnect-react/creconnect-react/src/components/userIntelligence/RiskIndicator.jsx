import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { RISK_META } from '@/utils/mockUserIntelligence';

/** Risk level pill (Low / Medium / High / Critical). */
export default function RiskIndicator({ level }) {
  const meta = RISK_META[level] ?? RISK_META.low;
  return <Badge variant={meta.variant} label={meta.label} dot />;
}

RiskIndicator.propTypes = {
  level: PropTypes.string.isRequired,
};
