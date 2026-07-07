import { Outlet } from 'react-router-dom';
import CreatorSidebar from '@/components/navigation/CreatorSidebar';
import CommandPalette from '@/components/common/CommandPalette';
import AICopilot from '@/components/copilot/AICopilot';
import NotificationBannerOutlet from '@/components/notifications/NotificationBannerOutlet';
import PendingApprovalBanner from '@/components/common/PendingApprovalBanner';

export default function CreatorLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto page-enter min-w-0">
        <PendingApprovalBanner />
        <Outlet />
      </main>
      <CommandPalette role="creator" />
      <AICopilot role="creator" />
      <NotificationBannerOutlet />
    </div>
  );
}
