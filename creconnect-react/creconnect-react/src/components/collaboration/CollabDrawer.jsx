import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { DRAWER_TABS, STAGE_BADGE_VARIANT, DB_STAGE_TO_KANBAN, DB_STATUS_TO_KANBAN } from '@/constants/collaborationOptions';
import {
  getCollaborationIntel, getCollaborationTimeline, getDeliverables, getContract,
  getPaymentBreakdown, getPerformanceMetrics, getCollaborationAIInsights,
  getMessages, getActivityFeed, getDocuments,
} from '@/utils/mockCollaborationIntel';
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

  const intel = useMemo(() => {
    if (!item) return null;
    const base = getCollaborationIntel(item);
    // Override mock values with real DB fields where available
    const realStage         = resolveRealStage(item);
    const realPriority      = item.dbPriority    ? PRIORITY_MAP[item.dbPriority]      : null;
    const realPaymentStatus = item.dbPaymentStatus ? PAYMENT_STATUS_MAP[item.dbPaymentStatus] : null;
    return {
      ...base,
      ...(realStage         ? { stage: realStage }               : {}),
      ...(realPriority      ? { priority: realPriority }         : {}),
      ...(realPaymentStatus ? { paymentStatus: realPaymentStatus } : {}),
    };
  }, [item]);
  const timeline = useMemo(() => (item ? getCollaborationTimeline(item) : []), [item]);
  const deliverables = useMemo(() => (item ? getDeliverables(item) : []), [item]);
  const contract = useMemo(() => (item ? getContract(item) : null), [item]);
  const payment = useMemo(() => (item && intel ? getPaymentBreakdown(item, intel) : null), [item, intel]);
  const performance = useMemo(() => (item ? getPerformanceMetrics(item) : null), [item]);
  const aiInsights = useMemo(() => (item && intel && performance ? getCollaborationAIInsights(item, intel, performance) : []), [item, intel, performance]);
  const messages = useMemo(() => (item ? getMessages(item) : []), [item]);
  const activity = useMemo(() => (item && intel ? getActivityFeed(item, intel) : []), [item, intel]);
  const documents = useMemo(() => (item ? getDocuments(item) : []), [item]);

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
          {activeTab === 'overview' && <OverviewTab item={item} intel={intel} aiInsights={aiInsights} />}
          {activeTab === 'timeline' && <TimelineTab timeline={timeline} />}
          {activeTab === 'deliverables' && <DeliverablesTab deliverables={deliverables} />}
          {activeTab === 'messages' && <MessagesTab item={item} messages={messages} activity={activity} />}
          {activeTab === 'payments' && <PaymentsTab payment={payment} intel={intel} />}
          {activeTab === 'analytics' && <AnalyticsTab performance={performance} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
          {activeTab === 'contract' && <ContractTab contract={contract} />}
          {activeTab === 'copilot' && <CopilotTab item={item} intel={intel} deliverables={deliverables} performance={performance} aiInsights={aiInsights} />}
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
