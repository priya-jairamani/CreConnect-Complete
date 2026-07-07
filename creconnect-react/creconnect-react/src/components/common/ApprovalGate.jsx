import PropTypes from 'prop-types';
import { useAuthContext } from '@/context/AuthContext';
import { isApproved } from '@/utils/accountStatus';
import EmptyState from '@/components/common/EmptyState';

export default function ApprovalGate({ children, title, message }) {
  const { user } = useAuthContext();

  if (isApproved(user)) return children;

  return (
    <div className="p-6">
      <EmptyState
        icon="🛂"
        title={title ?? 'Waiting for admin approval'}
        message={
          message
          ?? 'This section is available after your account is approved. Complete your profile in the meantime — we will notify you when you are ready to collaborate.'
        }
      />
    </div>
  );
}

ApprovalGate.propTypes = {
  children: PropTypes.node.isRequired,
  title:    PropTypes.string,
  message:  PropTypes.string,
};
