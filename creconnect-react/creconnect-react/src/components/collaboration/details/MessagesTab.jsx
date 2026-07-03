import PropTypes from 'prop-types';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function MessagesTab({ item }) {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon="💬"
      title="Use Messages for this conversation"
      message={`In-drawer chat isn't available yet — message ${item.brandName ?? 'this brand'} directly from your Messages tab.`}
      action={<Button variant="primary" size="sm" onClick={() => navigate(ROUTES.CREATOR_MESSAGES + (item.brandUserId ? `?userId=${item.brandUserId}` : ''))}>Go to Messages</Button>}
    />
  );
}

MessagesTab.propTypes = {
  item: PropTypes.object.isRequired,
};
