import { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ToastContainer from '@/components/common/Toast';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, opts = {}) => {
    const id = ++idCounter;
    const toast = {
      id,
      message,
      type: opts.type || 'info',
      title: opts.title,
      duration: opts.duration ?? 4000,
    };
    setToasts((list) => [...list, toast]);
    if (toast.duration > 0) {
      setTimeout(() => removeToast(id), toast.duration);
    }
    return id;
  }, [removeToast]);

  const api = {
    show:    (message, opts) => addToast(message, opts),
    success: (message, opts) => addToast(message, { ...opts, type: 'success' }),
    error:   (message, opts) => addToast(message, { ...opts, type: 'error' }),
    info:    (message, opts) => addToast(message, { ...opts, type: 'info' }),
    warning: (message, opts) => addToast(message, { ...opts, type: 'warning' }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = { children: PropTypes.node.isRequired };

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be inside ToastProvider');
  return ctx;
};
