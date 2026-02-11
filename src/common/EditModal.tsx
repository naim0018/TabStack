import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { Save, X } from 'lucide-react';

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditData) => void;
  initialData?: EditData | null;
  forceType?: 'bookmark' | 'folder' | 'reminder' | 'note' | 'quicklink' | 'watchlist' | 'mostvisited' | null;
}

export interface EditData {
  id?: string;
  title: string;
  url?: string;
  type: 'bookmark' | 'folder' | 'reminder' | 'note' | 'quicklink' | 'watchlist' | 'mostvisited';
  description?: string;
  deadline?: string;
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
          type: initialData.type || forceType || 'bookmark',
          description: initialData.description || '',
          deadline: initialData.deadline || '',
        });
      } else {
        setFormData({
          title: '',
          url: '',
          type: forceType || 'bookmark',
          description: '',
          deadline: '',
        });
      }
    }
  }, [isOpen, initialData, forceType]);

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-text-secondary/50";
  const labelClasses = "text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 ml-1 flex justify-between";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item' : 'New Item'}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-5">
          {/* Type Select */}
          {!forceType && !initialData && (
            <div className="flex flex-col">
              <label className={labelClasses}>
                Identify As
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className={inputClasses}
              >
                <option value="bookmark">Bookmark</option>
                <option value="folder">Folder</option>
                <option value="reminder">Reminder</option>
                <option value="note">Note</option>
                <option value="watchlist">Watchlist Item</option>
              </select>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col">
            <label className={labelClasses}>
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClasses}
            />
          </div>

          {/* URL */}
          {formData.type !== 'folder' && formData.type !== 'note' && (
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

          {/* Description */}
          <div className="flex flex-col">
            <label className={labelClasses}>
              {formData.type === 'note' ? 'Content' : 'Description (Optional)'}
            </label>
            <textarea
              rows={formData.type === 'note' ? 8 : 3}
              placeholder={formData.type === 'note' ? 'Write your note here...' : 'Add some notes...'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${inputClasses} resize-none no-scrollbar`}
            />
          </div>

          {/* Deadline */}
          {formData.type === 'reminder' && (
            <div className="flex flex-col">
              <label className={labelClasses}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={inputClasses}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-card-border/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-card-border hover:text-text-primary transition-all active:scale-95 flex items-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-sm shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
