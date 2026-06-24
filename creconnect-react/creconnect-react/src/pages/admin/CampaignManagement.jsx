import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

import OverviewTab from '@/components/campaignIntelligence/OverviewTab';
import ActiveCampaignsTab from '@/components/campaignIntelligence/ActiveCampaignsTab';
import CampaignPipelineTab from '@/components/campaignIntelligence/CampaignPipelineTab';
import PerformanceAnalyticsTab from '@/components/campaignIntelligence/PerformanceAnalyticsTab';
import FlaggedCampaignsTab from '@/components/campaignIntelligence/FlaggedCampaignsTab';
import TemplatesTab from '@/components/campaignIntelligence/TemplatesTab';
import CampaignDrawer from '@/components/campaignIntelligence/CampaignDrawer';
import CampaignSearchBar from '@/components/campaignIntelligence/CampaignSearchBar';

import { CAMPAIGNS } from '@/utils/mockCampaignIntelligence';

const TABS = [
  { id: 'overview',   label: 'Overview',            icon: '📊' },
  { id: 'active',     label: 'Active Campaigns',    icon: '📋' },
  { id: 'pipeline',   label: 'Campaign Pipeline',   icon: '🧭' },
  { id: 'analytics',  label: 'Performance Analytics', icon: '📈' },
  { id: 'flagged',    label: 'Flagged Campaigns',   icon: '🚩' },
  { id: 'policies',   label: 'Campaign Policies',   icon: '📜' },
];

/* Admin campaign governance actions — no campaign creation */
const QUICK_ACTIONS = [
  { id: 'review_flagged',   icon: '🚩', label: 'Review Flagged'    },
  { id: 'view_analytics',   icon: '📈', label: 'View Analytics'    },
  { id: 'audit_campaign',   icon: '🔎', label: 'Audit Campaign'    },
  { id: 'export_data',      icon: '⬇',  label: 'Export Data'       },
];

const ACTION_MESSAGES = {
  pause:         'paused',
  resume:        'resumed',
  archive:       'archived',
  flag:          'flagged for review',
  suspend:       'suspended',
  export:        'exported',
  pause_bulk:    'paused',
  archive_bulk:  'archived',
  assign_manager:'assigned to a manager',
  notify:        'notified',
  apply_policy:  'policy applied',
};

function describeTarget(target) {
  if (Array.isArray(target)) return `${target.length} campaign${target.length === 1 ? '' : 's'}`;
  return target?.name || 'Campaign';
}

export default function CampaignManagement() {
  const toast = useToast();
  const [activeTab,        setActiveTab]        = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  function openCampaign(id) {
    const campaign = CAMPAIGNS.find((c) => c.id === id);
    if (campaign) setSelectedCampaign(campaign);
  }

  function handleSelectCampaign(campaign) {
    setSelectedCampaign(campaign);
  }

  function handleSearchSelect(result) {
    if (result.type === 'campaign') {
      setActiveTab('active');
      openCampaign(result.id);
      return;
    }
    if (result.type === 'industry') {
      setActiveTab('analytics');
      return;
    }
    setActiveTab('active');
  }

  function handleAction(actionId, target) {
    const msg = ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${describeTarget(target)} ${msg}.`);
    if (['pause', 'resume', 'archive', 'suspend'].includes(actionId)) {
      setSelectedCampaign(null);
    }
  }

  function handleQuickAction(actionId) {
    switch (actionId) {
      case 'review_flagged':
        setActiveTab('flagged');
        break;
      case 'view_analytics':
        setActiveTab('analytics');
        break;
      case 'audit_campaign':
        setActiveTab('active');
        toast.success('Campaign audit view opened. Select any campaign to inspect it.');
        break;
      case 'export_data':
        toast.success('Campaign data export started.');
        break;
      default:
        break;
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Campaigns
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Monitor, review, flag, and audit every creator–brand campaign across the platform.
          </p>
        </div>
        <CampaignSearchBar onSelect={handleSearchSelect} />
      </header>

      {/* Quick Actions — governance only, no campaign creation */}
      <div className="card rounded-2xl p-3 flex items-center gap-2 overflow-x-auto sticky top-0 z-10">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => handleQuickAction(a.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview'  && <OverviewTab onSelectCampaign={openCampaign} />}
      {activeTab === 'active'    && (
        <ActiveCampaignsTab isLoading={false} onSelectCampaign={handleSelectCampaign} onAction={handleAction} />
      )}
      {activeTab === 'pipeline'  && <CampaignPipelineTab onSelectCampaign={handleSelectCampaign} />}
      {activeTab === 'analytics' && <PerformanceAnalyticsTab />}
      {activeTab === 'flagged'   && <FlaggedCampaignsTab onSelectCampaign={handleSelectCampaign} />}
      {activeTab === 'policies'  && <TemplatesTab onAction={handleAction} />}

      {/* Campaign detail workspace */}
      <CampaignDrawer campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} onAction={handleAction} />
    </div>
  );
}
