import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import { PAYMENT_STATUS_VARIANT } from '@/constants/collaborationOptions';

export default function PaymentsTab({ intel }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <Badge variant={PAYMENT_STATUS_VARIANT[intel.paymentStatus] ?? 'neutral'} label={intel.paymentStatus} />
      <p className="text-fg-muted text-sm max-w-xs">
        A detailed payment breakdown for this collaboration isn&apos;t available here yet — check your Payments tab for the full escrow/release history.
      </p>
      <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.CREATOR_PAYMENTS)}>Go to Payments</Button>
    </div>
  );
}

PaymentsTab.propTypes = {
  intel: PropTypes.object.isRequired,
};
