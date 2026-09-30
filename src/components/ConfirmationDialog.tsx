import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        id="confirmation-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 flex flex-col gap-4 animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isDestructive ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            type="button"
            id="confirmation-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-semibold transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            id="confirmation-confirm-btn"
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg text-xs font-semibold transition ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
