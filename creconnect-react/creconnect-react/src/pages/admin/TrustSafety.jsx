import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

import OverviewTab from '@/components/trustSafety/OverviewTab';
import ReportsCenterTab from '@/components/trustSafety/ReportsCenterTab';
import InvestigationsTab from '@/components/trustSafety/InvestigationsTab';
import FraudDetectionTab from '@/components/trustSafety/FraudDetectionTab';
import DisputesTab from '@/components/trustSafety/DisputesTab';
import RiskMonitoringTab from '@/components/trustSafety/RiskMonitoringTab';
import ReportDrawer from '@/components/trustSafety/ReportDrawer';
import TrustSafetySearchBar from '@/components/trustSafety/TrustSafetySearchBar';

import { REPORTS } from '@/utils/mockTrustSafety';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'reports', label: 'Reports Center', icon: '📥' },
  { id: 'investigations', label: 'Investigations', icon: '🔍' },
  { id: 'fraud', label: 'Fraud Detection', icon: '🚨' },
  { id: 'disputes', label: 'Disputes', icon: '⚖️' },
  { id: 'risk', label: 'Risk Monitoring', icon: '📈' },
];

const QUICK_ACTIONS = [
  { id: 'create_investigation', icon: '🔍', label: 'Create Investigation' },
  { id: 'review_reports', icon: '📥', label: 'Review Reports' },
  { id: 'assign_moderator', icon: '🧑‍💼', label: 'Assign Moderator' },
  { id: 'export_cases', icon: '⬇', label: 'Export Cases' },
  { id: 'view_high_risk', icon: '🚨', label: 'View High-Risk Accounts' },
];

const ACTION_MESSAGES = {
  assign:           'assigned to a moderator',
  escalate:         'escalated for senior review',
  resolve:          'marked as resolved',
  request_evidence: 'flagged for additional evidence',
  suspend:          'suspended pending review',
  dismiss:          'dismissed',
  add_note:         'note saved',
};

export default function TrustSafety() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReport, setSelectedReport] = useState(null);

  function handleSearchSelect(result) {
    switch (result.type) {
      case 'report':
        setActiveTab('reports');
        {
          const report = REPORTS.find((r) => r.id === result.id);
          if (report) setSelectedReport(report);
        }
        break;
      case 'case':
        setActiveTab('investigations');
        break;
      case 'dispute':
        setActiveTab('disputes');
        break;
      case 'moderator':
        setActiveTab('overview');
        break;
      case 'campaign':
        setActiveTab('risk');
        break;
      default:
        setActiveTab('fraud');
        break;
    }
  }

  function handleAction(actionId, target) {
    const msg = ACTION_MESSAGES[actionId] ?? 'updated';
    const label = target?.id || target?.title || 'Case';
    toast.success(`${label} ${msg}.`);
    if (['resolve', 'suspend', 'dismiss'].includes(actionId)) {
      setSelectedReport(null);
    }
  }

  function handleQuickAction(actionId) {
    switch (actionId) {
      case 'create_investigation':
        setActiveTab('investigations');
        toast.success('Investigation workspace opened.');
        break;
      case 'review_reports':
        setActiveTab('reports');
        break;
      case 'assign_moderator':
        toast.success('Moderator assignment panel opened.');
        break;
      case 'export_cases':
        toast.success('Case export started.');
        break;
      case 'view_high_risk':
        setActiveTab('fraud');
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
            Trust &amp; Safety
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Investigate reports, detect fraud, resolve disputes and monitor platform-wide risk.
          </p>
        </div>
        <TrustSafetySearchBar onSelect={handleSearchSelect} />
      </header>

      {/* Quick Actions */}
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
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'reports' && <ReportsCenterTab onSelectReport={setSelectedReport} />}
      {activeTab === 'investigations' && <InvestigationsTab />}
      {activeTab === 'fraud' && <FraudDetectionTab />}
      {activeTab === 'disputes' && <DisputesTab />}
      {activeTab === 'risk' && <RiskMonitoringTab />}

      {/* Report detail workspace */}
      <ReportDrawer report={selectedReport} onClose={() => setSelectedReport(null)} onAction={handleAction} />
    </div>
  );
}
