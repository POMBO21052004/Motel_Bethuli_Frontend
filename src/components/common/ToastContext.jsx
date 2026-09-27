import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

// Global event target for non-React code (like Axios interceptors)
export const toastEvent = new EventTarget();

export const emitToast = (message, type = 'info', duration = 5000) => {
  toastEvent.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration }
  }));
};

const Toast = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    warning: 'bg-orange-50 border-orange-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-center p-4 rounded-2xl shadow-xl border ${bgColors[type] || bgColors.info} min-w-[300px] max-w-md pointer-events-auto mb-3`}
    >
      <div className="flex-shrink-0 mr-3">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">
          {message}
        </p>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors text-slate-400"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { message, type, duration } = e.detail;
      showToast(message, type, duration);
    };
    toastEvent.addEventListener('show-toast', handler);
    return () => toastEvent.removeEventListener('show-toast', handler);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ 
        showToast, 
        success: (m) => showToast(m, 'success'), 
        error: (m) => showToast(m, 'error'),
        info: (m) => showToast(m, 'info'),
        warning: (m) => showToast(m, 'warning')
    }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
