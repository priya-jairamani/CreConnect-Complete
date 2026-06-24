import { useEffect } from 'react';
import { useNotificationContext } from '@/context/NotificationContext';

/**
 * Convenience hook that fetches notifications on mount
 * and exposes the notification state + actions.
 */
export function useNotification() {
  const ctx = useNotificationContext();

  useEffect(() => {
    ctx.fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ctx;
}
