import PropTypes from 'prop-types';
import InsightCard from '@/components/adminDashboard/InsightCard';

/** AI-generated operations insight card — thin wrapper around the shared InsightCard. */
export default function AIInsightCard({ insight }) {
  return <InsightCard insight={insight} />;
}

AIInsightCard.propTypes = {
  insight: PropTypes.shape({
    icon: PropTypes.node,
    category: PropTypes.string.isRequired,
    impact: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    confidence: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};
