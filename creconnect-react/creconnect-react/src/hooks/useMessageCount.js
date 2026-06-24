import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '@/api/messages.api';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Returns the number of conversations where the last message
 * was sent by someone else (i.e. unread DMs waiting).
 * Re-polls every 30 seconds while the user is active.
 */
export function useMessageCount() {
  const { isAuthenticated } = useAuthContext();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await messagesApi.getUnreadCount();
      setCount(data?.count ?? 0);
    } catch {
      // fail silently
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 30_000);
    // Also refetch immediately when a conversation is marked as read
    window.addEventListener('cc:messages:read', fetchCount);
    return () => {
      clearInterval(timer);
      window.removeEventListener('cc:messages:read', fetchCount);
    };
  }, [fetchCount]);

  return count;
}
