import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { VERIFICATION_META } from '@/utils/mockUserIntelligence';

/** Verification status pill (Verified / Pending / Rejected / Needs Review). */
export default function VerificationBadge({ status }) {
  const meta = VERIFICATION_META[status] ?? VERIFICATION_META.pending;
  return <Badge variant={meta.variant} label={meta.label} dot />;
}

VerificationBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
