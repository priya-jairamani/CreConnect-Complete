import PropTypes from 'prop-types';
import InsightCard from '@/components/adminDashboard/InsightCard';

/** AI-generated campaign insight card — thin wrapper around the shared InsightCard. */
export default function CampaignInsightCard({ insight }) {
  return <InsightCard insight={insight} />;
}

CampaignInsightCard.propTypes = {
  insight: PropTypes.shape({
    icon: PropTypes.node,
    category: PropTypes.string.isRequired,
    impact: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    confidence: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};
