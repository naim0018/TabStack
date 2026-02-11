import { AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="max-w-md"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl shrink-0 ${
            type === 'danger' 
              ? 'bg-danger/10 text-danger shadow-lg shadow-danger/5' 
              : 'bg-accent/10 text-accent shadow-lg shadow-accent/5'
          }`}>
            <AlertCircle size={28} />
          </div>
          <div className="flex-1 space-y-2 pt-1">
            <h3 className="text-xl font-bold text-text-primary tracking-tight">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-card-border hover:text-text-primary transition-all active:scale-95 border border-transparent hover:border-card-border"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all active:scale-95 ${
              type === 'danger' 
                ? 'bg-danger hover:brightness-110 shadow-danger/20' 
                : 'bg-accent hover:brightness-110 shadow-accent/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
