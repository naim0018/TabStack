import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { Save, X, Trash2 } from 'lucide-react';

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditData) => void;
  initialData?: EditData | null;
  forceType?: 'bookmark' | 'folder' | 'reminder' | 'note' | 'quicklink' | 'watchlist' | 'mostvisited' | 'plan' | null;
}

export interface EditData {
  id?: string;
  title: string;
  url?: string;
  type: 'bookmark' | 'folder' | 'reminder' | 'note' | 'quicklink' | 'watchlist' | 'mostvisited' | 'plan';
  description?: string;
  deadline?: string;
  completedAt?: number;
}

export function EditModal({ isOpen, onClose, onSave, initialData, forceType }: EditModalProps) {
  const [formData, setFormData] = useState<EditData>({
    title: '',
    url: '',
    type: 'bookmark',
    description: '',
    deadline: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          title: initialData.title || '',
          url: initialData.url || '',
          type: initialData.type || (forceType as any) || 'bookmark',
          description: initialData.description || '',
          deadline: initialData.deadline || '',
          completedAt: initialData.completedAt,
        });
      } else {
        setFormData({
          title: '',
          url: '',
          type: (forceType as any) || 'bookmark',
          description: '',
          deadline: '',
        });
      }
    }
  }, [isOpen, initialData, forceType]);

  const inputClasses = "w-full px-5 py-3.5 rounded-lg bg-[#0f1115]/50 border border-white/5 text-white text-sm outline-none focus:border-accent/40 focus:bg-[#0f1115]/80 transition-all placeholder:text-white/20";
  const labelClasses = "text-[11px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2.5 ml-0.5 flex justify-between";

  const isPlan = formData.type === 'plan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? (isPlan ? 'Edit Plan' : 'Edit Item') : (isPlan ? 'Create New Plan' : 'New Item')}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-8">
        <div className="space-y-6">
          {/* Type Select */}
          {!forceType && !initialData && (
            <div className="flex flex-col">
              <label className={labelClasses}>Identify As</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className={inputClasses}
              >
                <option value="bookmark">Bookmark</option>
                <option value="folder">Folder</option>
                <option value="reminder">Reminder</option>
                <option value="plan">Daily Plan</option>
                <option value="note">Note</option>
                <option value="watchlist">Watchlist Item</option>
              </select>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col">
            <label className={labelClasses}>Title</label>
            <input
              type="text"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClasses}
            />
          </div>

          {/* URL */}
          {formData.type !== 'folder' && formData.type !== 'note' && formData.type !== 'plan' && (
            <div className="flex flex-col">
              <label className={labelClasses}>
                {formData.type === 'reminder' ? 'URL (Optional)' : 'URL'}
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className={inputClasses}
              />
            </div>
          )}

          {/* Description / Notes */}
          <div className="flex flex-col">
            <label className={labelClasses}>
              {formData.type === 'note' ? 'Content' : (formData.type === 'plan' ? 'Notes (Optional)' : 'Description (Optional)')}
            </label>
            <textarea
              rows={formData.type === 'note' ? 10 : 4}
              placeholder={formData.type === 'note' ? 'Write your note here...' : 'Add some notes...'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${inputClasses} resize-none no-scrollbar`}
            />
          </div>

          {/* Deadline / Time */}
          {(formData.type === 'reminder' || formData.type === 'plan') && (
            <div className="flex flex-col">
              <label className={labelClasses}>{isPlan ? 'Scheduled Time' : 'Deadline'}</label>
              <div className="relative group">
                <input
                  type={isPlan ? "time" : "datetime-local"}
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center gap-4 pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all active:scale-95"
          >
            <X size={16} />
            Cancel
          </button>
          
          <button
            onClick={() => onSave(formData)}
            className="flex items-center gap-2.5 px-7 py-3 rounded-lg bg-linear-to-r from-accent to-accent/80 text-white font-semibold text-sm shadow-[0_8px_20px_-4px_rgba(56,189,248,0.4)] hover:brightness-110 hover:shadow-[0_12px_24px_-4px_rgba(56,189,248,0.5)] active:scale-[0.98] transition-all"
          >
            <Save size={18} className="drop-shadow-sm" />
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

