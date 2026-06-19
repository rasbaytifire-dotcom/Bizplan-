import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Quitter',
  cancelText = 'Rester',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto no-print" id="confirmation-dialog-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        id="confirmation-dialog-backdrop"
      />

      {/* Modal Card */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative z-10 transition-all transform scale-100"
        id="confirmation-dialog-card"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration color bar */}
        <div className="h-1.5 bg-amber-500 w-full" />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded-lg"
          id="btn-confirm-modal-close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100" id="confirm-modal-title">
                {title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed" id="confirm-modal-description">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-700 transition"
            id="btn-confirm-modal-cancel"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            id="btn-confirm-modal-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
