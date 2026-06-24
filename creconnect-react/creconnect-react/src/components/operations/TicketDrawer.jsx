import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { timeAgo } from '@/utils/formatters';
import { TICKET_STATUS_META, TICKET_PRIORITY_META, SLA_META } from '@/utils/mockOperations';

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'conversation', label: 'Conversation', icon: '💬' },
  { id: 'user', label: 'Related User', icon: '👤' },
  { id: 'campaign', label: 'Related Campaign', icon: '📣' },
  { id: 'history', label: 'History', icon: '🕒' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'ai', label: 'AI Suggestions', icon: '🤖' },
];

const RISK_VARIANT = { high: 'danger', medium: 'warning', low: 'success' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Ticket detail workspace — overview, conversation, related entities, history, notes & AI assistant. */
export default function TicketDrawer({ ticket, onClose, onAction }) {
  const [subTab, setSubTab] = useState('overview');

  if (!ticket) return <Drawer isOpen={false} onClose={onClose} />;

  const status = TICKET_STATUS_META[ticket.status] ?? TICKET_STATUS_META.open;
  const priority = TICKET_PRIORITY_META[ticket.priority] ?? TICKET_PRIORITY_META.medium;
  const sla = SLA_META[ticket.sla] ?? SLA_META.on_track;

  return (
    <Drawer
      isOpen={!!ticket}
      onClose={onClose}
      size="2xl"
      icon="🎫"
      title={ticket.id}
      subtitle={`${ticket.subject}`}
      headerExtra={
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} label={status.label} dot />
          <Badge variant={priority.variant} label={priority.label} />
          <Badge variant={sla.variant} label={sla.label} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-fg-muted">Assigned to {ticket.agent}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => onAction?.('escalate', ticket)}>Escalate</Button>
            <Button variant="success" size="sm" onClick={() => onAction?.('resolve', ticket)}>Mark Resolved</Button>
          </div>
        </div>
      }
    >
      {/* Sub-tab bar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 px-5 py-3 overflow-x-auto border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              subTab === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg hover:bg-white/5'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ── OVERVIEW ── */}
        {subTab === 'overview' && (
          <div className="space-y-5">
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
              <Avatar initials={ticket.userInitials} color={ticket.userColor} size="md" />
              <div className="min-w-0">
                <p className="text-xs text-fg-muted">Submitted by</p>
                <p className="text-sm font-semibold text-fg truncate">{ticket.user}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Category', value: ticket.category },
                { label: 'Priority', value: priority.label },
                { label: 'Status', value: status.label },
                { label: 'SLA', value: sla.label },
                { label: 'Assigned Agent', value: ticket.agent },
                { label: 'Created', value: formatDate(ticket.created) },
                { label: 'Satisfaction', value: ticket.satisfaction ? `${ticket.satisfaction}/5` : '—' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONVERSATION ── */}
        {subTab === 'conversation' && (
          <div className="space-y-3">
            {ticket.conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-xl p-3"
                  style={{ background: msg.from === 'agent' ? 'rgba(109,92,255,0.12)' : 'var(--surface-2)' }}
                >
                  <p className="text-xs font-semibold text-fg-muted mb-1">{msg.author} · {timeAgo(msg.time)} ago</p>
                  <p className="text-sm text-fg leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RELATED USER ── */}
        {subTab === 'user' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Name', value: ticket.relatedUser.name },
              { label: 'Role', value: ticket.relatedUser.role },
              { label: 'Account Status', value: ticket.relatedUser.accountStatus },
              { label: 'Joined', value: formatDate(ticket.relatedUser.joined) },
              { label: 'Total Tickets', value: ticket.relatedUser.totalTickets },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">{item.label}</p>
                <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── RELATED CAMPAIGN ── */}
        {subTab === 'campaign' && (
          ticket.relatedCampaign ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Campaign', value: ticket.relatedCampaign.name },
                { label: 'Campaign ID', value: ticket.relatedCampaign.id },
                { label: 'Status', value: ticket.relatedCampaign.status },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fg-muted">No related campaign for this ticket.</p>
          )
        )}

        {/* ── HISTORY ── */}
        {subTab === 'history' && (
          <div className="space-y-2">
            {ticket.history.map((h, i) => (
              <div key={i} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                <span className="text-sm text-fg">{h.event}</span>
                <span className="text-xs text-fg-muted whitespace-nowrap">{formatDate(h.date)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTES ── */}
        {subTab === 'notes' && (
          ticket.notes.length === 0 ? (
            <p className="text-sm text-fg-muted">No internal notes yet.</p>
          ) : (
            <div className="space-y-2">
              {ticket.notes.map((n, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs font-semibold text-fg-muted mb-1">{n.author} · {formatDate(n.date)}</p>
                  <p className="text-sm text-fg leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── AI SUGGESTIONS ── */}
        {subTab === 'ai' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.18)' }}>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-2">Suggested Reply</p>
              <p className="text-sm text-fg leading-relaxed">{ticket.aiSuggestions.suggestedReply}</p>
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={() => onAction?.('use_reply', ticket)}>Use This Reply</Button>
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Resolution Summary</p>
              <p className="text-sm text-fg leading-relaxed">{ticket.aiSuggestions.resolutionSummary}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Escalation Recommendation</p>
              <p className="text-sm text-fg leading-relaxed">{ticket.aiSuggestions.escalationRecommendation}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Related Cases</p>
              {ticket.aiSuggestions.relatedCases.length === 0 ? (
                <p className="text-sm text-fg-muted">No related cases found.</p>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {ticket.aiSuggestions.relatedCases.map((id) => <Badge key={id} variant="neutral" label={id} />)}
                </div>
              )}
            </div>
            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Risk Assessment</p>
              <Badge variant={RISK_VARIANT[ticket.aiSuggestions.riskAssessment] ?? 'neutral'} label={`${ticket.aiSuggestions.riskAssessment} risk`} />
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

TicketDrawer.propTypes = {
  ticket: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
