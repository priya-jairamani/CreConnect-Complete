import PropTypes from 'prop-types';
import EmptyState from '@/components/common/EmptyState';

export default function CopilotTab({ item }) {
  return (
    <EmptyState
      icon="🤖"
      title="Collaboration Copilot not available here yet"
      message={`Per-collaboration AI assistance for "${item.campaignTitle}" isn't implemented yet.`}
    />
  );
}

CopilotTab.propTypes = {
  item: PropTypes.object.isRequired,
};
