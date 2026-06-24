import MessagesLayout from '@/components/common/MessagesLayout';

function resolveOther(conv) {
  return {
    userId: conv.creator?.userId   ?? null,
    name:   conv.creator?.displayName ?? conv.creator?.username ?? 'Unknown Creator',
    avatar: conv.creator?.avatarUrl ?? null,
  };
}

export default function BrandMessages() {
  return <MessagesLayout resolveOther={resolveOther} sidebarTitle="Conversations" />;
}
