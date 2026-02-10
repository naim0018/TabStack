import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass bg-bg-card border border-border-card w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl flex-shrink-0 ${type === 'danger' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-bg/50 flex justify-end gap-3 border-t border-border-card">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-border-card transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
              type === 'danger' ? 'bg-danger hover:bg-danger/90 shadow-danger/20' : 'bg-accent hover:bg-accent/90 shadow-accent/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
