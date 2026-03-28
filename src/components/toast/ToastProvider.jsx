import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { ToastContext } from './toastContext.js';

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'bg-black text-white border-green-500',
  error: 'bg-black text-white border-red-500',
  warning: 'bg-black text-white border-yellow-500',
  info: 'bg-black text-white border-gray-500',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toastApi = useMemo(() => ({
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '420px' }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const Icon = TOAST_ICONS[toast.type] || Info;
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-4 p-5 border-l-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
        ${style}
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <Icon size={22} strokeWidth={2.5} className="flex-shrink-0" />
      <span className="font-bold text-sm uppercase tracking-wide flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 hover:opacity-60 transition-opacity border-none bg-transparent text-white"
      >
        <X size={18} strokeWidth={3} />
      </button>
    </div>
  );
}
