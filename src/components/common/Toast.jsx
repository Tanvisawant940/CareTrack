import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'error':
      case 'danger':
        return <AlertCircle size={18} className="text-rose-400" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400" />;
      default:
        return <Info size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'info'}`}>
          <div className="flex-shrink-0">{getIcon(toast.type)}</div>
          <div style={{ flex: 1, fontSize: '0.86rem', lineHeight: '1.4' }}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
