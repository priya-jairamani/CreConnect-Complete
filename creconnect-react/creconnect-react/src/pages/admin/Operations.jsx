import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useIsMockAdmin } from '@/hooks/useIsMockAdmin';
import { adminApi } from '@/api/admin.api';
import Badge from '@/components/common/Badge';

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

import {
  TICKETS, INCIDENTS, QUICK_ACTIONS as ALL_QUICK_ACTIONS, SUPPORT_METRICS, SEARCH_INDEX,
} from '@/utils/mockOperations';
import {
  normalizeTicket, computeSupportMetrics, buildTicketSearchIndex, unwrapTicketList,
} from '@/utils/operationsTickets';

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
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('center');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const [rawTickets, setRawTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(!isMock);
  const [ticketsError, setTicketsError] = useState(false);

  const loadTickets = useCallback(() => {
    if (isMock) return Promise.resolve();
    setTicketsLoading(true);
    setTicketsError(false);
    return adminApi.getTickets({ limit: 200 })
      .then((res) => setRawTickets(unwrapTicketList(res)))
      .catch(() => setTicketsError(true))
      .finally(() => setTicketsLoading(false));
  }, [isMock]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const tickets = useMemo(
    () => (isMock ? TICKETS : rawTickets.map(normalizeTicket)),
    [isMock, rawTickets],
  );

  const supportMetrics = useMemo(
    () => (isMock ? SUPPORT_METRICS : computeSupportMetrics(rawTickets)),
    [isMock, rawTickets],
  );

  const searchIndex = useMemo(
    () => (isMock ? SEARCH_INDEX : [...buildTicketSearchIndex(tickets), ...SEARCH_INDEX.filter((r) => r.type !== 'ticket')]),
    [isMock, tickets],
  );

  function findTicket(id) {
    return tickets.find((t) => t.id === id || t.rawId === id);
  }

  async function applyTicketUpdate(ticket, payload) {
    const id = ticket.rawId ?? ticket.id;
    await adminApi.updateTicket(id, payload);
    await loadTickets();
    const refreshed = findTicket(id);
    if (refreshed) setSelectedTicket(refreshed);
  }

  function handleSearchSelect(result) {
    switch (result.type) {
      case 'ticket': {
        setActiveTab('support');
        const ticket = findTicket(result.id);
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

  function handleSelectPriority(priority) {
    if (priority.category === 'Verification') setActiveTab('registrations');
    else if (priority.category === 'Payments') setActiveTab('support');
    else if (priority.category === 'Campaigns') setActiveTab('activity');
    else if (priority.category === 'Support') setActiveTab('support');
    else if (priority.category === 'Moderation') setActiveTab('activity');
    toast.success(`AI recommendation opened: ${priority.recommendedAction}`);
  }

  async function handleTicketAction(actionId, ticket) {
    if (actionId === 'use_reply') {
      toast.success(`AI suggested reply copied for ${ticket.id}.`);
      return;
    }

    if (!isMock) {
      try {
        if (actionId === 'resolve') {
          await applyTicketUpdate(ticket, { status: 'RESOLVED' });
          toast.success(`${ticket.id} marked as resolved.`);
          setSelectedTicket(null);
          return;
        }
        if (actionId === 'escalate') {
          await applyTicketUpdate(ticket, { status: 'IN_PROGRESS', priority: 'HIGH' });
          toast.success(`${ticket.id} escalated.`);
          setSelectedTicket(null);
          return;
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to update ticket.');
        return;
      }
    }

    const msg = actionId === 'escalate' ? 'escalated' : 'marked as resolved';
    toast.success(`${ticket.id} ${msg}.`);
    setSelectedTicket(null);
  }

  function handleIncidentAction(actionId, incident) {
    const msg = actionId === 'escalate' ? 'escalated to on-call engineer' : 'resolved';
    toast.success(`${incident.id} ${msg}.`);
    setSelectedIncident(null);
  }

  function handleRegistrationAction(actionId, reg) {
    const msg = REGISTRATION_ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${reg.name} ${msg}.`);
    if (['approve', 'reject', 'suspend'].includes(actionId)) {
      setSelectedRegistration(null);
    }
  }

  async function handleBulkAction(actionId, selectedIds) {
    if (!isMock && ['resolve', 'escalate', 'assign'].includes(actionId)) {
      try {
        await Promise.all(selectedIds.map((id) => {
          const ticket = findTicket(id);
          if (!ticket) return Promise.resolve();
          const payload = actionId === 'resolve'
            ? { status: 'RESOLVED' }
            : actionId === 'escalate'
              ? { status: 'IN_PROGRESS', priority: 'HIGH' }
              : { status: 'IN_PROGRESS' };
          return adminApi.updateTicket(ticket.rawId ?? ticket.id, payload);
        }));
        await loadTickets();
      } catch (err) {
        toast.error(err?.message || 'Bulk update failed.');
        return;
      }
    }
    const msg = BULK_ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${selectedIds.length} ticket(s) ${msg}.`);
  }

  function handleExport() {
    toast.success('Ticket export started.');
  }

  function handleAutomationToggle(automation) {
    const willBeActive = automation.status !== 'active';
    toast.success(`${automation.name} ${willBeActive ? 'enabled' : 'paused'}.`);
  }

  function handleRecommendedAction(action, rec) {
    toast.success(`${action}: "${rec.title}"`);
  }

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

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              Operations
            </h1>
            {!isMock && <Badge variant="success">Live data</Badge>}
          </div>
          <p className="text-fg-muted text-sm mt-0.5">
            Platform operations command center — monitor registrations, support, activity, system health, and AI-driven recommendations.
          </p>
        </div>
        <OperationsSearchBar onSelect={handleSearchSelect} searchIndex={searchIndex} />
      </header>

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
        <button
          type="button"
          onClick={() => setActiveTab('registrations')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
        >
          <span>📝</span>
          Registration Queue
        </button>
      </div>

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

      {activeTab === 'center' && (
        <OperationsCenterTab onSelectPriority={handleSelectPriority} />
      )}

      {activeTab === 'registrations' && (
        <RegistrationsTab onSelectRegistration={setSelectedRegistration} />
      )}

      {activeTab === 'support' && (
        <SupportHubTab
          tickets={tickets}
          metrics={supportMetrics}
          loading={ticketsLoading}
          error={ticketsError}
          onRetry={loadTickets}
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
