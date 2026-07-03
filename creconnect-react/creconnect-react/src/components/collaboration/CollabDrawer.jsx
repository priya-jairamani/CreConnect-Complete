import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { DRAWER_TABS, STAGE_BADGE_VARIANT, DB_STAGE_TO_KANBAN, DB_STATUS_TO_KANBAN } from '@/constants/collaborationOptions';
import OverviewTab from '@/components/collaboration/details/OverviewTab';
import TimelineTab from '@/components/collaboration/details/TimelineTab';
import DeliverablesTab from '@/components/collaboration/details/DeliverablesTab';
import MessagesTab from '@/components/collaboration/details/MessagesTab';
import PaymentsTab from '@/components/collaboration/details/PaymentsTab';
import AnalyticsTab from '@/components/collaboration/details/AnalyticsTab';
import DocumentsTab from '@/components/collaboration/details/DocumentsTab';
import ContractTab from '@/components/collaboration/details/ContractTab';
import CopilotTab from '@/components/collaboration/details/CopilotTab';

function resolveRealStage(item) {
  if (!item) return null;
  if (item.dbStage && item.rawStatus === 'ACCEPTED' && DB_STAGE_TO_KANBAN[item.dbStage]) {
    return DB_STAGE_TO_KANBAN[item.dbStage];
  }
  return DB_STATUS_TO_KANBAN[item.rawStatus] ?? null;
}

const PRIORITY_MAP = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };
const PAYMENT_STATUS_MAP = { PENDING: 'Pending', ESCROW: 'Processing', RELEASED: 'Released', PAID: 'Completed' };

export default function CollabDrawer({ item, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) setActiveTab('overview');
  }, [isOpen, item?.id]);

  // Real fields only — no mock fallback for anything shown to the user.
  const intel = useMemo(() => {
    if (!item) return null;
    return {
      stage:         resolveRealStage(item) ?? 'Inquiry',
      priority:      item.dbPriority       ? PRIORITY_MAP[item.dbPriority]           : 'Medium',
      paymentStatus: item.dbPaymentStatus  ? PAYMENT_STATUS_MAP[item.dbPaymentStatus] : 'Pending',
    };
  }, [item]);

  if (!item || !intel) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      icon={<Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="sm" />}
      title={item.campaignTitle}
      subtitle={`${item.brandName}${item.campaignType ? ` · ${item.campaignType}` : ''}`}
      headerExtra={<Badge variant={STAGE_BADGE_VARIANT[intel.stage] ?? 'neutral'} label={intel.stage} />}
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 overflow-x-auto flex-shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
          {DRAWER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5"
              style={activeTab === t.key
                ? { color: 'var(--brand-400)', borderColor: 'var(--brand-500)' }
                : { color: 'var(--fg-muted)', borderColor: 'transparent' }}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'overview' && <OverviewTab item={item} intel={intel} />}
          {activeTab === 'timeline' && <TimelineTab />}
          {activeTab === 'deliverables' && <DeliverablesTab collaborationId={item.id} requirements={item.requirements} />}
          {activeTab === 'messages' && <MessagesTab item={item} />}
          {activeTab === 'payments' && <PaymentsTab intel={intel} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'contract' && <ContractTab />}
          {activeTab === 'copilot' && <CopilotTab item={item} />}
        </div>
      </div>
    </Drawer>
  );
}

CollabDrawer.propTypes = {
  item:    PropTypes.object,
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
