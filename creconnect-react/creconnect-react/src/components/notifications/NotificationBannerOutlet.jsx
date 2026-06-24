import { useNotificationContext } from '@/context/NotificationContext';
import NotificationBanner from '@/components/notifications/NotificationBanner';

/**
 * Drop this into any layout that lives inside the Router.
 * It reads the pending banner from NotificationContext and renders it.
 * useNavigate in NotificationBanner works here because we are inside RouterProvider.
 */
export default function NotificationBannerOutlet() {
  const { bannerNotification, clearBanner } = useNotificationContext();
  if (!bannerNotification) return null;
  return (
    <NotificationBanner
      key={bannerNotification.id}
      notification={bannerNotification}
      onDismiss={clearBanner}
    />
  );
}
