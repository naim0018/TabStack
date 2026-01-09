import React, { useState, useEffect } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditData) => void;
  initialData?: EditData | null;
  forceType?: 'bookmark' | 'folder' | 'reminder' | 'note' | null;
}

export interface EditData {
  id?: string;
  title: string;
  url: string;
  type: 'bookmark' | 'folder' | 'reminder' | 'note';
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
        setFormData(initialData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-sidebar border border-border-card rounded-2xl w-[440px] p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {initialData ? 'Edit Item' : 'New Item'}
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* Type Select */}
          {!forceType && !initialData && (
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
                Identify As
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3.5 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all"
              >
                <option value="bookmark">Bookmark</option>
                <option value="folder">Folder</option>
                <option value="reminder">Reminder</option>
                <option value="note">Note</option>
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all"
            />
          </div>

          {/* URL */}
          {formData.type !== 'folder' && formData.type !== 'note' && (
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
                {formData.type === 'reminder' ? 'URL (Optional)' : 'URL'}
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3.5 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
              {formData.type === 'note' ? 'Content' : 'Description (Optional)'}
            </label>
            <textarea
              rows={formData.type === 'note' ? 10 : 3}
              placeholder={formData.type === 'note' ? 'Write your note here...' : 'Add some notes...'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all resize-none"
            />
          </div>

          {/* Deadline */}
          {formData.type === 'reminder' && (
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-card text-text-secondary font-semibold text-sm hover:bg-border-card hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:translate-y-px hover:shadow-lg hover:shadow-accent-glow transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
