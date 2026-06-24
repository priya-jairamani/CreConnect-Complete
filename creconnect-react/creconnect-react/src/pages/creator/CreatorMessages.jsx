import MessagesLayout from '@/components/common/MessagesLayout';

function resolveOther(conv) {
  return {
    userId: conv.brand?.userId  ?? null,
    name:   conv.brand?.companyName ?? 'Unknown Brand',
    avatar: conv.brand?.logoUrl ?? null,
  };
}

export default function CreatorMessages() {
  return <MessagesLayout resolveOther={resolveOther} sidebarTitle="Messages" />;
}
