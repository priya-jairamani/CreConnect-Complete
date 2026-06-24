import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import CommandPalette from '@/components/common/CommandPalette';
import NotificationBannerOutlet from '@/components/notifications/NotificationBannerOutlet';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto page-enter min-w-0">
        <Outlet />
      </main>
      <CommandPalette role="admin" />
      <NotificationBannerOutlet />
    </div>
  );
}
