import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useIsMockAdmin } from '@/hooks/useIsMockAdmin';
import LiveOperations from '@/components/operations/LiveOperations';

import OperationsCenterTab from '@/components/operations/OperationsCenterTab';
import SupportHubTab from '@/components/operations/SupportHubTab';
import ActivityIntelligenceTab from '@/components/operations/ActivityIntelligenceTab';
import SystemHealthTab from '@/components/operations/SystemHealthTab';
import AICopilotTab from '@/components/operations/AICopilotTab';
import RegistrationsTab from '@/components/operations/RegistrationsTab';

import TicketDrawer from '@/components/operations/TicketDrawer';
import IncidentDrawer from '@/components/operations/IncidentDrawer';
import RegistrationDrawer from '@/components/operations/RegistrationDrawer';
import OperationsSearchBar from '@/components/operations/OperationsSearchBar';

import { TICKETS, INCIDENTS, QUICK_ACTIONS as ALL_QUICK_ACTIONS } from '@/utils/mockOperations';

/* Remove broadcast_alert — all platform communications go through the
   unified Announcement Composer on the Admin Dashboard. */
const QUICK_ACTIONS = ALL_QUICK_ACTIONS.filter((a) => a.id !== 'broadcast_alert');

const TABS = [
  { id: 'center',        label: 'Operations Center',    icon: '🧭' },
  { id: 'registrations', label: 'User Registrations',   icon: '📝' },
  { id: 'support',       label: 'Support Hub',          icon: '🎧' },
  { id: 'activity',      label: 'Activity Intelligence', icon: '📊' },
  { id: 'health',        label: 'System Health',        icon: '🩺' },
  { id: 'copilot',       label: 'AI Operations Copilot', icon: '🤖' },
];

const BULK_ACTION_MESSAGES = {
  assign:   'assigned to an available agent',
  escalate: 'escalated for priority handling',
  resolve:  'marked as resolved',
  export:   'exported',
};

const REGISTRATION_ACTION_MESSAGES = {
  approve:      'approved — account activated',
  reject:       'rejected — user notified',
  suspend:      'suspended pending investigation',
  request_info: 'info request sent to user',
  escalate:     'escalated for senior review',
};

export default function Operations() {
  const isMock = useIsMockAdmin();
  return isMock ? <MockOperations /> : <LiveOperations />;
}

function MockOperations() {
  const toast = useToast();
  const [activeTab,           setActiveTab]           = useState('center');
  const [selectedTicket,      setSelectedTicket]      = useState(null);
  const [selectedIncident,    setSelectedIncident]    = useState(null);
  const [selectedRegistration,setSelectedRegistration]= useState(null);

  /* ── Search routing ── */
  function handleSearchSelect(result) {
    switch (result.type) {
      case 'ticket': {
        setActiveTab('support');
        const ticket = TICKETS.find((t) => t.id === result.id);
        if (ticket) setSelectedTicket(ticket);
        break;
      }
      case 'incident': {
        setActiveTab('health');
        const incident = INCIDENTS.find((i) => i.id === result.id);
        if (incident) setSelectedIncident(incident);
        break;
      }
      case 'admin':
        setActiveTab('activity');
        break;
      case 'registration':
        setActiveTab('registrations');
        break;
      default:
        setActiveTab('center');
        break;
    }
  }

  /* ── Priority routing ── */
  function handleSelectPriority(priority) {
    if (priority.category === 'Verification') setActiveTab('registrations');
    else if (priority.category === 'Payments') setActiveTab('support');
    else if (priority.category === 'Campaigns') setActiveTab('activity');
    else if (priority.category === 'Support') setActiveTab('support');
    else if (priority.category === 'Moderation') setActiveTab('activity');
    toast.success(`AI recommendation opened: ${priority.recommendedAction}`);
  }

  /* ── Ticket actions ── */
  function handleTicketAction(actionId, ticket) {
    if (actionId === 'use_reply') {
      toast.success(`AI suggested reply copied for ${ticket.id}.`);
      return;
    }
    const msg = actionId === 'escalate' ? 'escalated' : 'marked as resolved';
    toast.success(`${ticket.id} ${msg}.`);
    setSelectedTicket(null);
  }

  /* ── Incident actions ── */
  function handleIncidentAction(actionId, incident) {
    const msg = actionId === 'escalate' ? 'escalated to on-call engineer' : 'resolved';
    toast.success(`${incident.id} ${msg}.`);
    setSelectedIncident(null);
  }

  /* ── Registration actions ── */
  function handleRegistrationAction(actionId, reg) {
    const msg = REGISTRATION_ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${reg.name} ${msg}.`);
    if (['approve', 'reject', 'suspend'].includes(actionId)) {
      setSelectedRegistration(null);
    }
  }

  /* ── Bulk support actions ── */
  function handleBulkAction(actionId, selectedIds) {
    const msg = BULK_ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${selectedIds.length} ticket(s) ${msg}.`);
  }

  function handleExport() {
    toast.success('Ticket export started.');
  }

  /* ── AI / Automation ── */
  function handleAutomationToggle(automation) {
    const willBeActive = automation.status !== 'active';
    toast.success(`${automation.name} ${willBeActive ? 'enabled' : 'paused'}.`);
  }

  function handleRecommendedAction(action, rec) {
    toast.success(`${action}: "${rec.title}"`);
  }

  /* ── Quick actions ── */
  function handleQuickAction(actionId) {
    switch (actionId) {
      case 'create_incident':
        setActiveTab('health');
        toast.success('Incident creation workspace opened.');
        break;
      case 'assign_ticket':
        setActiveTab('support');
        break;
      case 'review_queue':
        setActiveTab('registrations');
        toast.success('Registration review queue opened.');
        break;
      case 'generate_report':
        setActiveTab('activity');
        toast.success('Operations report generation started.');
        break;
      case 'run_ai_analysis':
        setActiveTab('copilot');
        toast.success('AI analysis started — recommendations updated.');
        break;
      default:
        break;
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Operations
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Platform operations command center — monitor registrations, support, activity, system health, and AI-driven recommendations.
          </p>
        </div>
        <OperationsSearchBar onSelect={handleSearchSelect} />
      </header>

      {/* ── Quick Actions ── */}
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
        {/* Shortcut to registrations */}
        <button
          type="button"
          onClick={() => setActiveTab('registrations')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
        >
          <span>📝</span>
          Registration Queue
        </button>
      </div>

      {/* ── Tabs ── */}
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

      {/* ── Tab content ── */}
      {activeTab === 'center' && (
        <OperationsCenterTab onSelectPriority={handleSelectPriority} />
      )}

      {activeTab === 'registrations' && (
        <RegistrationsTab onSelectRegistration={setSelectedRegistration} />
      )}

      {activeTab === 'support' && (
        <SupportHubTab
          onSelectTicket={setSelectedTicket}
          onBulkAction={handleBulkAction}
          onExport={handleExport}
        />
      )}

      {activeTab === 'activity' && <ActivityIntelligenceTab />}

      {activeTab === 'health' && (
        <SystemHealthTab onSelectIncident={setSelectedIncident} />
      )}

      {activeTab === 'copilot' && (
        <AICopilotTab
          onAutomationToggle={handleAutomationToggle}
          onRecommendedAction={handleRecommendedAction}
        />
      )}

      {/* ── Detail drawers ── */}
      <TicketDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onAction={handleTicketAction}
      />
      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onAction={handleIncidentAction}
      />
      <RegistrationDrawer
        registration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        onAction={handleRegistrationAction}
      />
    </div>
  );
}
