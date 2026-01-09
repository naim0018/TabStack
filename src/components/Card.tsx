import React from 'react';
import { X, Edit2, Trash2, Clock, Folder as FolderIcon } from 'lucide-react';

export interface CardItem {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  favIconUrl?: string; // For tabs
  children?: CardItem[]; // For folders
  description?: string;
  deadline?: string;
  type?: 'bookmark' | 'folder' | 'reminder' | 'tab';
}

interface CardProps {
  item: CardItem;
  isTab?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void; // For tabs
  onDragStart?: (e: React.DragEvent) => void;
}

export function Card({ item, isTab, onClick, onEdit, onDelete, onClose, onDragStart }: CardProps) {
  const isFolder = item.children !== undefined || item.type === 'folder';
  
  // Favicon logic
  const getFavicon = () => {
    if (isTab && item.favIconUrl) return item.favIconUrl;
    if (item.url && item.url !== 'about:blank') return `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`;
    return null; 
  };
  const favUrl = getFavicon();

  let hostname = '';
  try {
    if (item.url && item.url !== 'about:blank') hostname = new URL(item.url).hostname;
  } catch (e) {}

  return (
    <div
      onClick={onClick}
      onDragStart={onDragStart}
      draggable={!isTab && item.id !== undefined}
      className={`
        group relative min-h-[80px] p-3 rounded-xl border border-border-card bg-bg-card 
        cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-accent 
        hover:z-[2] transition-all duration-200 select-none flex flex-col gap-2.5 backdrop-blur-sm
        ${isTab ? 'hover:border-accent/40' : ''}
      `}
    >
      <div className="flex items-center gap-2.5 w-full">
        {isFolder ? (
          <div className="w-7 h-7 rounded-lg bg-accent/10 p-1 flex items-center justify-center flex-shrink-0 text-accent">
            <FolderIcon size={16} fill="currentColor" fillOpacity={0.2} />
          </div>
        ) : favUrl ? (
          <img
            src={favUrl}
            alt=""
            className="w-7 h-7 rounded-lg object-contain bg-bg/50 p-1 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-bg/50 p-1 flex items-center justify-center flex-shrink-0">
             <div className="w-4 h-4 rounded-full border-2 border-text-secondary opacity-50" />
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-medium text-text-primary truncate">{item.title || 'Untitled'}</div>
          {hostname ? (
            <div className="text-[11px] text-text-secondary truncate">{hostname}</div>
          ) : isFolder ? (
            <div className="text-[11px] text-text-secondary truncate">Folder</div>
          ) : null}
        </div>
      </div>

      {(item.dateAdded || item.description || item.deadline) && (
        <div className="mt-1 pt-2 border-t border-border-card flex flex-col gap-1 w-full">
          {item.deadline ? (
            <div className="flex items-center gap-1 text-[11px] font-medium text-danger">
              <Clock size={10} />
              <span>{new Date(item.deadline).toLocaleDateString()}</span>
            </div>
          ) : item.dateAdded ? (
            <div className="flex items-center gap-1 text-[11px] font-medium text-accent">
              <Clock size={10} />
              <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
            </div>
          ) : null}
          {item.description && (
             <p className="text-[11px] text-text-secondary/80 line-clamp-2 leading-snug">
               {item.description}
             </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isTab ? (
           <button
             onClick={(e) => { e.stopPropagation(); onClose?.(); }}
             className="w-6 h-6 flex items-center justify-center rounded bg-bg-card border border-border-card text-text-secondary hover:bg-danger hover:border-danger hover:text-white transition-colors"
           >
             <X size={14} />
           </button>
        ) : (
           <>
             <button
               onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
               className="w-6 h-6 flex items-center justify-center rounded bg-bg-card border border-border-card text-text-secondary hover:bg-accent hover:border-accent hover:text-white transition-colors"
             >
               <Edit2 size={12} />
             </button>
             <button
               onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
               className="w-6 h-6 flex items-center justify-center rounded bg-bg-card border border-border-card text-text-secondary hover:bg-danger hover:border-danger hover:text-white transition-colors"
             >
               <Trash2 size={12} />
             </button>
           </>
        )}
      </div>
    </div>
  );
}
