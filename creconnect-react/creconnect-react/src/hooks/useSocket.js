import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

/**
 * Creates a Socket.io connection to a given namespace and registers event handlers.
 * Returns the socket instance ref so callers can emit events.
 */
export function useSocket(namespace, { token, onConnect, onDisconnect, events = {} } = {}) {
  const socketRef  = useRef(null);
  // Always holds the latest event handlers — avoids stale closures in socket callbacks
  const handlersRef = useRef(events);
  handlersRef.current = events;

  useEffect(() => {
    if (!token) return;

    const socket = io(`${WS_URL}${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect',    () => onConnect?.());
    socket.on('disconnect', () => onDisconnect?.());

    // Register a stable wrapper for each event that delegates to the latest handler
    Object.keys(handlersRef.current).forEach((event) => {
      socket.on(event, (...args) => handlersRef.current[event]?.(...args));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, namespace]);

  const emit = useCallback((event, ...args) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  return { socketRef, emit };
}
