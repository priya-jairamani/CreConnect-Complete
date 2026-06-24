import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { useReminderNotifications, fireReminderNotification } from '@/hooks/useReminderNotifications';
import { useNotificationContext } from '@/context/NotificationContext';

/* ─── Persistence ─────────────────────────────────────────────────────── */

const SEED_CREATOR = [
  { id: 'cr1', title: 'Submit campaign deliverables',    category: 'campaign',      priority: 'high',   due: new Date(Date.now() +     86_400_000).toISOString().slice(0, 10), done: false, note: 'Final reel + 3 stories due' },
  { id: 'cr2', title: 'Follow up on collaboration',      category: 'collaboration', priority: 'medium', due: new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10), done: false, note: '' },
  { id: 'cr3', title: 'Check escrow payment release',    category: 'payment',       priority: 'high',   due: new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10), done: false, note: 'Campaign payout' },
  { id: 'cr4', title: 'Update portfolio with new reels', category: 'general',       priority: 'low',    due: '', done: false, note: '' },
];

const SEED_BRAND = [
  { id: 'br1', title: 'Follow up with creator',          category: 'collaboration', priority: 'high',   due: new Date(Date.now() +     86_400_000).toISOString().slice(0, 10), done: false, note: '' },
  { id: 'br2', title: 'Review campaign brief',           category: 'campaign',      priority: 'medium', due: new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10), done: false, note: '' },
  { id: 'br3', title: 'Approve holiday campaign post',   category: 'campaign',      priority: 'low',    due: new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10), done: false, note: '' },
];

function load(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
    const seed = storageKey.includes('brand') ? SEED_BRAND : SEED_CREATOR;
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  } catch { return []; }
}

function persist(storageKey, items) {
  try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch {}
}

/* ─── Meta ────────────────────────────────────────────────────────────── */

const PRIORITY_META = {
  high:   { label: 'High',   color: '#f0445f', bg: 'rgba(240,68,95,0.10)',  border: 'rgba(240,68,95,0.25)'  },
  medium: { label: 'Medium', color: '#f5a623', bg: 'rgba(245,166,35,0.10)', border: 'rgba(245,166,35,0.25)' },
  low:    { label: 'Low',    color: '#16b364', bg: 'rgba(22,179,100,0.10)', border: 'rgba(22,179,100,0.25)' },
};

const CATEGORY_META = {
  campaign:      { label: 'Campaign',      icon: '◈', color: 'var(--brand-400)' },
  collaboration: { label: 'Collaboration', icon: '◉', color: '#f5a623' },
  payment:       { label: 'Payment',       icon: '💰', color: '#16b364' },
  general:       { label: 'General',       icon: '✦', color: 'var(--fg-muted)' },
};

const FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'active',  label: 'Active' },
  { key: 'today',   label: 'Due Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'done',    label: 'Completed' },
];

function todayISO() { return new Date().toISOString().slice(0, 10); }

function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return ` at ${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function dueLabel(due, time) {
  if (!due) return null;
  const t   = todayISO();
  const fmt = formatTime(time);
  if (due < t) return { text: `Overdue${fmt}`, color: '#f0445f' };
  if (due === t) return { text: `Due Today${fmt}`, color: '#f5a623' };
  const days = Math.ceil((new Date(due) - new Date(t)) / 86_400_000);
  if (days <= 3) return { text: `In ${days}d${fmt}`, color: '#f5a623' };
  return {
    text: new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + fmt,
    color: 'var(--fg-muted)',
  };
}

/* ─── Reminder Modal ──────────────────────────────────────────────────── */

const EMPTY_FORM = { title: '', category: 'campaign', priority: 'medium', due: '', time: '', note: '' };

function ReminderModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 space-y-4 animate-fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
            {initial ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg text-xl">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (form.title.trim()) onSave({ ...form, title: form.title.trim() }); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Title <span className="text-danger">*</span></label>
            <input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="What do you need to do?" className="input-base w-full" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-base w-full">
                {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">Priority</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="input-base w-full">
                {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">Due Date <span className="text-fg-muted text-xs font-normal">(optional)</span></label>
              <input
                type="date"
                value={form.due}
                min={todayISO()}
                onChange={(e) => {
                  set('due', e.target.value);
                  if (!e.target.value) set('time', '');
                }}
                className="input-base w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">
                Time
                <span className="text-fg-muted text-xs font-normal ml-1">(optional)</span>
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                disabled={!form.due}
                className="input-base w-full"
                title={!form.due ? 'Set a date first' : ''}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Note <span className="text-fg-muted text-xs font-normal">(optional)</span></label>
            <textarea value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Add a note…" rows={2} className="input-base w-full resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={!form.title.trim()}>
              {initial ? 'Save Changes' : '+ Add Reminder'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

ReminderModal.propTypes = {
  initial: PropTypes.object,
  onSave:  PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

/* ─── Reminder Card ───────────────────────────────────────────────────── */

function ReminderCard({ reminder, onToggle, onEdit, onDelete }) {
  const pm = PRIORITY_META[reminder.priority] ?? PRIORITY_META.medium;
  const cm = CATEGORY_META[reminder.category] ?? CATEGORY_META.general;
  const dl = dueLabel(reminder.due, reminder.time);
  const isOverdue = reminder.due && reminder.due < todayISO() && !reminder.done;

  return (
    <div
      className="group flex items-start gap-4 px-5 py-4 rounded-2xl transition-all"
      style={{
        background: reminder.done ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${reminder.done ? 'var(--border)' : isOverdue ? 'rgba(240,68,95,0.3)' : 'var(--border)'}`,
        opacity: reminder.done ? 0.65 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(reminder.id)}
        className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
        style={{ borderColor: reminder.done ? '#16b364' : pm.color, background: reminder.done ? '#16b364' : 'transparent' }}
      >
        {reminder.done && <span className="text-white text-[10px] font-bold">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p
          className="font-semibold text-sm leading-snug"
          style={{ color: reminder.done ? 'var(--fg-muted)' : 'var(--fg)', textDecoration: reminder.done ? 'line-through' : 'none', fontFamily: 'Sora, sans-serif' }}
        >
          {reminder.title}
        </p>
        {reminder.note && <p className="text-xs text-fg-muted leading-relaxed">{reminder.note}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: cm.color }}>{cm.icon} {cm.label}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: pm.bg, color: pm.color, border: `1px solid ${pm.border}` }}>{pm.label}</span>
          {dl && <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: dl.color }}>🕐 {dl.text}</span>}
        </div>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(reminder)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:text-fg" style={{ color: 'var(--fg-muted)', background: 'var(--surface-2)' }} title="Edit">✏</button>
        <button onClick={() => onDelete(reminder.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:text-danger" style={{ color: 'var(--fg-muted)', background: 'var(--surface-2)' }} title="Delete">✕</button>
      </div>
    </div>
  );
}

ReminderCard.propTypes = {
  reminder: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit:   PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* ─── Main component ──────────────────────────────────────────────────── */

export default function RemindersPage({ storageKey }) {
  const [reminders, setReminders] = useState(() => load(storageKey));
  const [filter,    setFilter]    = useState('active');
  const [modal,     setModal]     = useState(null);

  const { push } = useNotificationContext();

  // Notify about due/overdue reminders that already exist on mount
  useReminderNotifications(storageKey);

  // Keep storage in sync whenever reminders change
  useEffect(() => { persist(storageKey, reminders); }, [reminders, storageKey]);

  const save = useCallback((fn) => setReminders((prev) => { const next = fn(prev); persist(storageKey, next); return next; }), [storageKey]);

  const handleAdd = (form) => {
    const newReminder = { id: `${Date.now()}`, ...form, done: false };
    save((p) => [newReminder, ...p]);
    setModal(null);
    // Fire immediately if due today / tomorrow / overdue
    fireReminderNotification(newReminder, push);
  };

  const handleEdit = (form) => {
    const updated = { ...modal, ...form };
    save((p) => p.map((r) => r.id === modal.id ? { ...r, ...form } : r));
    setModal(null);
    // Re-check due date in case it was changed to today / tomorrow
    fireReminderNotification(updated, push);
  };
  const handleToggle = (id)   => save((p) => p.map((r) => r.id === id ? { ...r, done: !r.done } : r));
  const handleDelete = (id)   => save((p) => p.filter((r) => r.id !== id));
  const clearDone    = ()     => save((p) => p.filter((r) => !r.done));

  const t = todayISO();

  const counts = useMemo(() => ({
    all:     reminders.length,
    active:  reminders.filter((r) => !r.done).length,
    today:   reminders.filter((r) => !r.done && r.due === t).length,
    overdue: reminders.filter((r) => !r.done && r.due && r.due < t).length,
    done:    reminders.filter((r) => r.done).length,
  }), [reminders, t]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':  return reminders.filter((r) => !r.done);
      case 'today':   return reminders.filter((r) => !r.done && r.due === t);
      case 'overdue': return reminders.filter((r) => !r.done && r.due && r.due < t);
      case 'done':    return reminders.filter((r) => r.done);
      default:        return reminders;
    }
  }, [reminders, filter, t]);

  return (
    <div className="p-6 space-y-6 max-w-2xl">

      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Reminders</h1>
            {counts.overdue > 0 && (
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#f0445f' }}>
                {counts.overdue} overdue
              </span>
            )}
          </div>
          <p className="text-fg-muted text-sm mt-0.5">
            {counts.active > 0
              ? `${counts.active} active · ${counts.done} completed`
              : counts.done > 0 ? 'All tasks completed 🎉' : 'No reminders yet'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {counts.done > 0 && <Button variant="ghost" size="sm" onClick={clearDone}>Clear completed</Button>}
          <Button variant="primary" size="sm" onClick={() => setModal('new')}>+ New Reminder</Button>
        </div>
      </header>

      {/* Progress */}
      {reminders.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span>{counts.done} of {reminders.length} completed</span>
            <span>{Math.round((counts.done / reminders.length) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(counts.done / reminders.length) * 100}%`, background: 'linear-gradient(90deg,#6d5cff,#16b364)' }}
            />
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              filter === key
                ? { background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {label}
            {counts[key] > 0 && (
              <span
                className="px-1.5 rounded-full text-[10px] font-bold"
                style={
                  filter === key
                    ? { background: 'rgba(255,255,255,0.25)' }
                    : { background: key === 'overdue' ? 'rgba(240,68,95,0.15)' : 'rgba(109,92,255,0.15)', color: key === 'overdue' ? '#f0445f' : 'var(--brand-400)' }
                }
              >
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={filter === 'done' ? '✅' : filter === 'overdue' ? '✓' : '🔔'}
          title={
            filter === 'done'    ? 'No completed tasks' :
            filter === 'overdue' ? 'No overdue tasks — great!' :
            filter === 'today'   ? 'Nothing due today' :
            'No reminders yet'
          }
          message={filter === 'all' || filter === 'active' ? 'Add your first reminder to stay on top of campaigns, collaborations, and deadlines.' : undefined}
          action={
            (filter === 'all' || filter === 'active')
              ? <Button variant="primary" size="sm" onClick={() => setModal('new')}>+ Add your first reminder</Button>
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReminderCard key={r.id} reminder={r} onToggle={handleToggle} onEdit={(r) => setModal(r)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Quick-add row */}
      {filtered.length > 0 && (
        <button
          onClick={() => setModal('new')}
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all hover:border-brand-500/40 text-fg-muted"
          style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}
        >
          <span className="text-brand-400 text-lg">+</span>
          Add another reminder…
        </button>
      )}

      {/* Modal */}
      {modal === 'new'    && <ReminderModal onSave={handleAdd}  onClose={() => setModal(null)} />}
      {modal && modal !== 'new' && <ReminderModal initial={modal} onSave={handleEdit} onClose={() => setModal(null)} />}
    </div>
  );
}

RemindersPage.propTypes = {
  storageKey: PropTypes.string.isRequired,
};
