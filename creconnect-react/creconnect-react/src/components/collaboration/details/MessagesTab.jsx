import PropTypes from 'prop-types';
import CollabChatPanel from '@/components/collaboration/CollabChatPanel';

export default function MessagesTab({ item, detail, detailLoading }) {
  const partner = detail?.partner;
  return (
    <CollabChatPanel
      conversationId={detail?.conversationId}
      partnerUserId={partner?.userId ?? item.brandUserId}
      partnerName={partner?.name ?? item.brandName}
      partnerAvatar={partner?.avatarUrl ?? item.brandLogo}
      detailLoading={detailLoading}
    />
  );
}

MessagesTab.propTypes = {
  item:          PropTypes.object.isRequired,
  detail:        PropTypes.object,
  detailLoading: PropTypes.bool,
};
