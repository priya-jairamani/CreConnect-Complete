import { Outlet } from 'react-router-dom';
import BrandSidebar from '@/components/navigation/BrandSidebar';
import CommandPalette from '@/components/common/CommandPalette';
import AICopilot from '@/components/copilot/AICopilot';
import NotificationBannerOutlet from '@/components/notifications/NotificationBannerOutlet';
import PendingApprovalBanner from '@/components/common/PendingApprovalBanner';

export default function BrandLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <BrandSidebar />
      <main className="flex-1 overflow-y-auto page-enter min-w-0">
        <PendingApprovalBanner />
        <Outlet />
      </main>
      <CommandPalette role="brand" />
      <AICopilot role="brand" />
      <NotificationBannerOutlet />
    </div>
  );
}
