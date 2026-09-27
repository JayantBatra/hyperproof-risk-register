import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-150 ${
        isError
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      {isError || isWarning ? (
        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isError ? 'text-rose-600' : 'text-amber-600'}`} />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
      )}
      <div className="flex-1 text-xs">
        {toast.title && <p className="font-bold text-sm mb-0.5">{toast.title}</p>}
        <p className="leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-md hover:bg-black/5 text-slate-500 transition shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
