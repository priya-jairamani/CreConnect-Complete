import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import ScoreRing from '@/components/common/ScoreRing';
import { formatPKR } from '@/utils/formatters';
import {
  STAGE_BADGE_VARIANT, PRIORITY_VARIANT, PAYMENT_STATUS_VARIANT,
} from '@/constants/collaborationOptions';
import { getCollaborationTimeline } from '@/utils/mockCollaborationIntel';

/* ────────────────────────────────────────────────────────────────────── */
/* List View                                                               */
/* ────────────────────────────────────────────────────────────────────── */

export function CollabListView({ enriched, onOpen }) {
  return (
    <div className="card rounded-2xl overflow-hidden">
      {enriched.map(({ item, intel }, idx) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(item)}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item); }}
          className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] cursor-pointer"
          style={idx < enriched.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
        >
          <Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-fg text-sm truncate">{item.campaignTitle}</h3>
            <p className="text-fg-muted text-xs mt-0.5 truncate">{item.brandName}{item.campaignType ? ` · ${item.campaignType}` : ''}</p>
          </div>
          <div className="hidden md:block w-32 flex-shrink-0">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-fg-muted">Progress</span>
              <span className="text-fg font-medium">{intel.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${intel.progress}%` }} />
            </div>
          </div>
          <Badge variant={PAYMENT_STATUS_VARIANT[intel.paymentStatus] ?? 'neutral'} label={intel.paymentStatus} className="hidden sm:inline-flex" />
          <Badge variant={PRIORITY_VARIANT[intel.priority] ?? 'neutral'} label={intel.priority} className="hidden lg:inline-flex" />
          <div className="text-right flex-shrink-0 w-24">
            <p className="text-brand-400 font-semibold text-sm">{formatPKR(item.budget)}</p>
            {item.deadline && (
              <p className="text-fg-muted text-xs mt-0.5">{new Date(item.deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
            )}
          </div>
          <ScoreRing value={intel.matchScore} size={32} strokeWidth={3} />
          <Badge variant={STAGE_BADGE_VARIANT[intel.stage] ?? 'neutral'} label={intel.stage} className="hidden xl:inline-flex" />
        </div>
      ))}
    </div>
  );
}

CollabListView.propTypes = {
  enriched: PropTypes.array.isRequired,
  onOpen:   PropTypes.func.isRequired,
};

/* ────────────────────────────────────────────────────────────────────── */
/* Table View                                                              */
/* ────────────────────────────────────────────────────────────────────── */

const TABLE_COLUMNS = ['Campaign', 'Stage', 'Match', 'Budget', 'Deadline', 'Payment', 'Progress', 'Priority', 'Manager', 'Last Activity'];

export function CollabTableView({ enriched, onOpen }) {
  return (
    <div className="card rounded-2xl overflow-x-auto">
      <table className="w-full text-sm min-w-[860px]">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            {TABLE_COLUMNS.map((col) => (
              <th key={col} className="text-left text-fg-muted text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enriched.map(({ item, intel }) => (
            <tr
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(item)}
              onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item); }}
              className="border-b cursor-pointer transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: 'var(--border)' }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="sm" />
                  <div className="min-w-0">
                    <p className="text-fg font-medium truncate max-w-[180px]">{item.campaignTitle}</p>
                    <p className="text-fg-muted text-xs truncate max-w-[180px]">{item.brandName}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3"><Badge variant={STAGE_BADGE_VARIANT[intel.stage] ?? 'neutral'} label={intel.stage} /></td>
              <td className="px-4 py-3 text-fg font-medium">{intel.matchScore}</td>
              <td className="px-4 py-3 text-brand-400 font-semibold whitespace-nowrap">{formatPKR(item.budget)}</td>
              <td className="px-4 py-3 text-fg-muted whitespace-nowrap">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }) : '—'}</td>
              <td className="px-4 py-3"><Badge variant={PAYMENT_STATUS_VARIANT[intel.paymentStatus] ?? 'neutral'} label={intel.paymentStatus} /></td>
              <td className="px-4 py-3 text-fg font-medium">{intel.progress}%</td>
              <td className="px-4 py-3"><Badge variant={PRIORITY_VARIANT[intel.priority] ?? 'neutral'} label={intel.priority} /></td>
              <td className="px-4 py-3 text-fg-muted whitespace-nowrap">{intel.assignedManager}</td>
              <td className="px-4 py-3 text-fg-muted whitespace-nowrap">{intel.lastActivityHours}h ago</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

CollabTableView.propTypes = {
  enriched: PropTypes.array.isRequired,
  onOpen:   PropTypes.func.isRequired,
};

/* ────────────────────────────────────────────────────────────────────── */
/* Calendar (Deadline Center) View                                         */
/* ────────────────────────────────────────────────────────────────────── */

export function CollabCalendarView({ enriched, onOpen }) {
  const events = useMemo(() => {
    const list = [];
    enriched.forEach(({ item, intel, deliverables, payment }) => {
      if (item.deadline) {
        list.push({ date: item.deadline, label: `Campaign deadline — ${item.campaignTitle}`, icon: '🏁', item });
      }
      (deliverables ?? []).forEach((d) => {
        if (d.approvalStatus !== 'Approved') {
          list.push({ date: d.dueDate, label: `${d.type} due — ${item.campaignTitle}`, icon: '🎬', item });
        }
        if (d.approvalStatus === 'Submitted') {
          list.push({ date: d.dueDate, label: `Review needed — ${d.title}`, icon: '🔍', item });
        }
      });
      if (payment?.expectedPayout && intel.paymentStatus !== 'Completed') {
        list.push({ date: payment.expectedPayout, label: `Payment expected — ${item.campaignTitle}`, icon: '💸', item });
      }
    });
    return list
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [enriched]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day).push(e);
      }
    });
    return map;
  }, [events, year, month]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const upcoming = events.filter((e) => new Date(e.date).getTime() >= Date.now()).slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card rounded-2xl p-4 lg:col-span-2">
        <h3 className="font-semibold text-fg text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
          {now.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-fg-muted text-[11px] font-semibold uppercase mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            const dayEvents = day ? eventsByDay.get(day) : null;
            const isToday = day === now.getDate();
            return (
              <div
                key={idx}
                className="aspect-square rounded-lg p-1 flex flex-col items-center justify-start text-xs"
                style={{
                  background: isToday ? 'rgba(109,92,255,0.12)' : 'var(--surface-2)',
                  border: isToday ? '1px solid var(--brand-500)' : '1px solid transparent',
                  opacity: day ? 1 : 0,
                }}
              >
                {day && <span className={isToday ? 'text-brand-400 font-bold' : 'text-fg-muted'}>{day}</span>}
                {dayEvents && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400" title={e.label} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card rounded-2xl p-4">
        <h3 className="font-semibold text-fg text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-fg-muted text-sm">Nothing scheduled.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((e, idx) => (
              <button
                key={idx}
                onClick={() => onOpen(e.item)}
                className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span className="text-base flex-shrink-0">{e.icon}</span>
                <div className="min-w-0">
                  <p className="text-fg text-xs font-medium truncate">{e.label}</p>
                  <p className="text-fg-muted text-[11px] mt-0.5">{new Date(e.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

CollabCalendarView.propTypes = {
  enriched: PropTypes.array.isRequired,
  onOpen:   PropTypes.func.isRequired,
};

/* ────────────────────────────────────────────────────────────────────── */
/* Timeline View                                                           */
/* ────────────────────────────────────────────────────────────────────── */

export function CollabTimelineView({ enriched, onOpen }) {
  return (
    <div className="space-y-3">
      {enriched.map(({ item, intel }) => {
        const timeline = getCollaborationTimeline(item);
        const lastDone = [...timeline].reverse().find((t) => t.done);
        return (
          <div key={item.id} className="card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="sm" />
              <div className="min-w-0 flex-1">
                <button onClick={() => onOpen(item)} className="text-fg text-sm font-semibold truncate hover:text-brand-400 transition-colors text-left">
                  {item.campaignTitle}
                </button>
                <p className="text-fg-muted text-xs">{item.brandName}</p>
              </div>
              <Badge variant={STAGE_BADGE_VARIANT[intel.stage] ?? 'neutral'} label={intel.stage} />
            </div>
            <div className="flex items-center overflow-x-auto pb-1">
              {timeline.map((step, idx) => (
                <div key={step.key} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center w-24 text-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={step.done
                        ? { background: 'var(--brand-500)', color: '#fff' }
                        : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-tight ${step.done ? 'text-fg' : 'text-fg-muted'}`}>{step.label}</p>
                    {step.date && (
                      <p className="text-fg-muted text-[9px] mt-0.5">{new Date(step.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
                    )}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="h-0.5 w-6 flex-shrink-0 -mt-4" style={{ background: step.done ? 'var(--brand-500)' : 'var(--border)' }} />
                  )}
                </div>
              ))}
            </div>
            {lastDone && (
              <p className="text-fg-muted text-xs mt-2">Latest: {lastDone.label} · {new Date(lastDone.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

CollabTimelineView.propTypes = {
  enriched: PropTypes.array.isRequired,
  onOpen:   PropTypes.func.isRequired,
};
