import { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { notificationsApi } from '@/api/notifications.api';
import { useAuthContext } from './AuthContext';

const initialState = {
  notifications: [],
  unreadCount:   0,
  isLoading:     false,
};

const NOTIF_ACTIONS = {
  SET:         'SET',
  SET_UNREAD:  'SET_UNREAD',
  MARK_READ:   'MARK_READ',
  MARK_ALL:    'MARK_ALL',
  ADD:         'ADD',
  SET_LOADING: 'SET_LOADING',
};

function notifReducer(state, { type, payload }) {
  switch (type) {
    case NOTIF_ACTIONS.SET_LOADING:
      return { ...state, isLoading: payload };
    case NOTIF_ACTIONS.SET:
      return { ...state, isLoading: false, notifications: payload, unreadCount: payload.filter((n) => !n.isRead).length };
    case NOTIF_ACTIONS.SET_UNREAD:
      return { ...state, unreadCount: payload };
    case NOTIF_ACTIONS.ADD:
      return { ...state, notifications: [payload, ...state.notifications], unreadCount: state.unreadCount + 1 };
    case NOTIF_ACTIONS.MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => n.id === payload ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case NOTIF_ACTIONS.MARK_ALL:
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 };
    default:
      return state;
  }
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notifReducer, initialState);
  const { isAuthenticated, accessToken } = useAuthContext();
  const socketRef  = useRef(null);
  // The banner shows the most recently added notification
  const [banner, setBanner] = useState(null);

  const normalizeNotif = (n) => ({
    id:        n.id,
    message:   n.notification?.message  ?? n.message   ?? '',
    type:      n.notification?.type     ?? n.type       ?? 'SYSTEM',
    isRead:    n.isRead ?? n.read ?? false,
    createdAt: n.notification?.createdAt ?? n.createdAt ?? new Date().toISOString(),
  });

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: NOTIF_ACTIONS.SET_LOADING, payload: true });
    try {
      const { data } = await notificationsApi.getAll();
      const list = Array.isArray(data) ? data : [];
      dispatch({ type: NOTIF_ACTIONS.SET, payload: list.map(normalizeNotif) });
    } catch {
      dispatch({ type: NOTIF_ACTIONS.SET_LOADING, payload: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    const socket = io(`${WS_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('notification', (notif) => {
      const n = { ...notif, isRead: false, type: notif.type ?? 'SYSTEM' };
      dispatch({ type: NOTIF_ACTIONS.ADD, payload: n });
      setBanner(n);
    });

    socket.on('unread-count', ({ count }) => {
      dispatch({ type: NOTIF_ACTIONS.SET_UNREAD, payload: count });
    });

    socketRef.current = socket;
    fetchNotifications();

    return () => { socket.disconnect(); };
  }, [isAuthenticated, accessToken, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    dispatch({ type: NOTIF_ACTIONS.MARK_READ, payload: id });
    await notificationsApi.markRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    dispatch({ type: NOTIF_ACTIONS.MARK_ALL });
    await notificationsApi.markAllRead().catch(() => {});
  }, []);

  // push() is used by useReminderNotifications and any internal code
  const push = useCallback((notification) => {
    const n = { ...notification, id: notification.id ?? Date.now().toString(), isRead: false };
    dispatch({ type: NOTIF_ACTIONS.ADD, payload: n });
    setBanner(n);
  }, []);

  const clearBanner = useCallback(() => setBanner(null), []);

  return (
    <NotificationContext.Provider value={{ ...state, fetchNotifications, markRead, markAllRead, push, bannerNotification: banner, clearBanner }}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = { children: PropTypes.node.isRequired };

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be inside NotificationProvider');
  return ctx;
};
