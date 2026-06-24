import { useEffect, useRef } from 'react';
import { useNotificationContext } from '@/context/NotificationContext';
import { notificationsApi } from '@/api/notifications.api';

const todayStr    = () => new Date().toISOString().slice(0, 10);
const tomorrowStr = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

function fmtTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return ` at ${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Build a notification payload for a reminder if it is due today, overdue,
 * or due tomorrow. Returns null if no notification should fire.
 */
function buildPayload(reminder) {
  if (!reminder || reminder.done || !reminder.due) return null;

  const today    = todayStr();
  const tomorrow = tomorrowStr();
  const timeStr  = fmtTime(reminder.time);

  if (reminder.due < today) {
    return {
      type:    'REMINDER_OVERDUE',
      message: `⚠ Overdue: "${reminder.title}" was due on ${new Date(reminder.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timeStr}`,
    };
  }
  if (reminder.due === today) {
    return {
      type:    'REMINDER_DUE',
      message: `🔔 Due today${timeStr}: "${reminder.title}"`,
    };
  }
  if (reminder.due === tomorrow) {
    return {
      type:    'REMINDER_UPCOMING',
      message: `📅 Due tomorrow${timeStr}: "${reminder.title}"`,
    };
  }
  return null;
}

/**
 * Fire a notification for a single reminder immediately.
 * Exported so RemindersPage can call it on create / edit.
 */
export function fireReminderNotification(reminder, push) {
  const payload = buildPayload(reminder);
  if (!payload) return;

  const today = todayStr();
  push({
    id:        `rem-${reminder.id}-${today}`,
    type:      payload.type,
    message:   payload.message,
    isRead:    false,
    createdAt: new Date().toISOString(),
  });

  // Persist to backend only when not in demo mode
  if (localStorage.getItem('cc_demo_mode') !== 'true') {
    notificationsApi.createSelf(payload.message, payload.type).catch(() => {});
  }
}

/**
 * Returns ms until the reminder's due date+time.
 * Returns null if the reminder has no due date, is in the past, or is done.
 */
function msUntilDue(reminder) {
  if (!reminder.due || reminder.done) return null;

  const [year, month, day] = reminder.due.split('-').map(Number);
  let dueMs;
  if (reminder.time) {
    const [h, m] = reminder.time.split(':').map(Number);
    dueMs = new Date(year, month - 1, day, h, m, 0).getTime();
  } else {
    dueMs = new Date(year, month - 1, day, 9, 0, 0).getTime(); // default 9 AM
  }

  return dueMs - Date.now();
}

const ONE_HOUR = 60 * 60 * 1000;

/**
 * Watches reminders and fires notifications at the exact due time.
 * - Uses setTimeout to fire at the precise due moment (not on every page load)
 * - Re-fires every hour if the reminder is still not done/completed
 * - Overdue reminders fire immediately when the hook mounts and then every hour
 */
export function useReminderNotifications(storageKey) {
  const { push } = useNotificationContext();
  // In-memory set of reminder IDs where the next alert is already scheduled
  const scheduledRef = useRef(new Set());
  const timersRef    = useRef([]);         // cleanup on unmount

  useEffect(() => {
    function scheduleReminder(r) {
      if (r.done || !r.due) return;
      if (scheduledRef.current.has(r.id)) return; // already scheduled

      const msLeft = msUntilDue(r);

      if (msLeft === null) return;

      if (msLeft <= 0) {
        // Already overdue or due right now — fire immediately
        fireReminderNotification(r, push);
        scheduledRef.current.add(r.id);

        // Re-check in 1 hour in case it's still not done
        const t = setTimeout(() => {
          scheduledRef.current.delete(r.id);
          const reminders = readReminders();
          const fresh = reminders.find((x) => x.id === r.id);
          if (fresh && !fresh.done) {
            scheduleReminder(fresh);
          }
        }, ONE_HOUR);
        timersRef.current.push(t);
      } else {
        // Fire exactly when due
        scheduledRef.current.add(r.id);
        const t = setTimeout(() => {
          const reminders = readReminders();
          const fresh = reminders.find((x) => x.id === r.id);
          if (fresh && !fresh.done) {
            fireReminderNotification(fresh, push);
            // Re-schedule 1 hour later if still not done
            const retryT = setTimeout(() => {
              scheduledRef.current.delete(r.id);
              const again = readReminders().find((x) => x.id === r.id);
              if (again && !again.done) scheduleReminder(again);
            }, ONE_HOUR);
            timersRef.current.push(retryT);
          } else {
            scheduledRef.current.delete(r.id);
          }
        }, msLeft);
        timersRef.current.push(t);
      }
    }

    function readReminders() {
      try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]'); } catch { return []; }
    }

    const reminders = readReminders();
    reminders.forEach(scheduleReminder);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
}
