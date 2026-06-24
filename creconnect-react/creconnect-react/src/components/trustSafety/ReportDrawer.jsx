import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import RiskBadge from './RiskBadge';
import InvestigationTimeline from './InvestigationTimeline';
import CaseReviewPanel from './CaseReviewPanel';
import { SEVERITY_META, REPORT_STATUS_META } from '@/utils/mockTrustSafety';
import { formatPKR } from '@/utils/formatters';

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'evidence', label: 'Evidence', icon: '📎' },
  { id: 'history', label: 'History', icon: '🕒' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'decisions', label: 'Decision Log', icon: '⚖️' },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReportDrawer({ report, onClose, onAction }) {
  const [subTab,      setSubTab]      = useState('overview');
  const [noteText,    setNoteText]    = useState('');
  const [localNotes,  setLocalNotes]  = useState([]);  // notes added this session

  function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setLocalNotes((prev) => [
      ...prev,
      {
        id:     `local-${Date.now()}`,
        author: 'Admin',
        date:   new Date().toISOString(),
        text:   noteText.trim(),
      },
    ]);
    setNoteText('');
    onAction?.('add_note', report);
  }

  if (!report) return <Drawer isOpen={false} onClose={onClose} />;

  const severity = SEVERITY_META[report.severity] ?? SEVERITY_META.low;
  const status = REPORT_STATUS_META[report.status] ?? REPORT_STATUS_META.new;
  const { evidence } = report;

  return (
    <Drawer
      isOpen={!!report}
      onClose={onClose}
      size="2xl"
      icon="📥"
      title={`${report.category} — ${report.reportedInfo.name}`}
      subtitle={`${report.id} · Reported by ${report.reporter}`}
      headerExtra={
        <div className="flex items-center gap-2">
          <Badge variant={severity.variant} label={severity.label} />
          <RiskBadge level={report.accountRisk} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={status.variant} label={status.label} dot />
            <Badge variant="neutral" label={report.userType} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => onAction?.('assign', report)}>Assign Case</Button>
            <Button variant="danger" size="sm" onClick={() => onAction?.('escalate', report)}>Escalate</Button>
            <Button variant="success" size="sm" onClick={() => onAction?.('resolve', report)}>Resolve</Button>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                <Avatar initials={report.reporterInfo.initials} color={report.reporterInfo.color} size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">Reporter</p>
                  <p className="text-sm font-semibold text-fg truncate">{report.reporterInfo.name}</p>
                  <p className="text-xs text-fg-muted truncate">{report.reporterInfo.type} · {report.reporterInfo.handle}</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
                <Avatar initials={report.reportedInfo.initials} color={report.reportedInfo.color} size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">Reported User</p>
                  <p className="text-sm font-semibold text-fg truncate">{report.reportedInfo.name}</p>
                  <p className="text-xs text-fg-muted truncate">{report.reportedInfo.type} · {report.reportedInfo.handle}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-fg leading-relaxed">{report.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Category', value: report.category },
                { label: 'Severity', value: severity.label },
                { label: 'Risk Score', value: report.riskScore },
                { label: 'Account Risk', value: <RiskBadge level={report.accountRisk} /> },
                { label: 'Previous Reports', value: report.previousReports },
                { label: 'Assigned Moderator', value: report.assignedModerator },
                { label: 'Created', value: formatDate(report.createdDate) },
                { label: 'Status', value: status.label },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Attachments</p>
              <div className="flex items-center gap-2 flex-wrap">
                {report.attachments.map((a) => <Badge key={a} variant="brand" label={a} />)}
              </div>
            </div>

            <CaseReviewPanel onAction={(action) => onAction?.(action, report)} />
          </div>
        )}

        {/* ── EVIDENCE ── */}
        {subTab === 'evidence' && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Screenshots</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {evidence.screenshots.map((s) => (
                  <div key={s.id} className="rounded-xl aspect-video flex items-center justify-center text-3xl" style={{ background: 'var(--surface-2)' }}>
                    🖼️
                    <span className="sr-only">{s.caption}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Files</p>
              {evidence.files.length === 0 ? (
                <p className="text-sm text-fg-muted">No files attached.</p>
              ) : (
                <div className="space-y-2">
                  {evidence.files.map((f) => (
                    <div key={f.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                      <span className="text-sm text-fg flex items-center gap-2">📄 {f.name}</span>
                      <span className="text-xs text-fg-muted">{f.type} · {f.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Links</p>
              <div className="space-y-2">
                {evidence.links.map((l) => (
                  <div key={l.id} className="rounded-xl p-3 flex items-center gap-2 text-sm text-brand-400" style={{ background: 'var(--surface-2)' }}>
                    🔗 {l.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Conversation Logs</p>
              <div className="space-y-2">
                {evidence.conversationLogs.map((c) => (
                  <div key={c.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm text-fg">{c.snippet}</p>
                    <p className="text-xs text-fg-muted mt-1">{formatDate(c.date)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Campaign Records</p>
              <div className="flex items-center gap-2 flex-wrap">
                {evidence.campaignRecords.map((c) => (
                  <Badge key={c.id} variant="neutral" label={`${c.campaignName} (${c.role})`} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Payment Records</p>
              <div className="space-y-2">
                {evidence.paymentRecords.map((p) => (
                  <div key={p.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                    <span className="text-sm text-fg">{formatPKR(p.amount)}</span>
                    <span className="text-xs text-fg-muted">{formatDate(p.date)}</span>
                    <Badge variant={p.status === 'Disputed' ? 'danger' : p.status === 'Refunded' ? 'warning' : p.status === 'Pending' ? 'brand' : 'success'} label={p.status} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Activity Logs</p>
              <div className="space-y-1.5">
                {evidence.activityLogs.map((a) => (
                  <div key={a.id} className="rounded-xl p-2.5 flex items-center justify-between text-sm" style={{ background: 'var(--surface-2)' }}>
                    <span className="text-fg">{a.action}</span>
                    <span className="text-xs text-fg-muted">{formatDate(a.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {subTab === 'history' && <InvestigationTimeline items={report.history} />}

        {/* ── NOTES ── */}
        {subTab === 'notes' && (
          <div className="space-y-4">
            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Add Moderator Note</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your note…"
                rows={3}
                className="input-base w-full text-sm resize-none rounded-xl"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'var(--brand-500)' }}
                >
                  + Add Note
                </button>
              </div>
            </form>

            {/* Existing + new notes */}
            {[...report.notes, ...localNotes].length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-4">No moderator notes yet.</p>
            ) : (
              [...report.notes, ...localNotes].map((n) => (
                <div key={n.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-fg">{n.author}</p>
                    <p className="text-xs text-fg-muted">{formatDate(n.date)}</p>
                  </div>
                  <p className="text-sm text-fg-muted mt-1 leading-relaxed">{n.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── DECISION LOG ── */}
        {subTab === 'decisions' && (
          <div className="space-y-3">
            {report.decisionLog.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-4">No decisions logged yet.</p>
            ) : (
              report.decisionLog.map((d) => (
                <div key={d.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-fg">{d.decision}</p>
                    <p className="text-xs text-fg-muted">{formatDate(d.date)} · {d.by}</p>
                  </div>
                  <p className="text-sm text-fg-muted mt-1 leading-relaxed">{d.note}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}

ReportDrawer.propTypes = {
  report: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
