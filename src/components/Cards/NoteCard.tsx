import React from "react";
import { FileText, Edit2, Trash2 } from "lucide-react";

interface NoteCardProps {
  item: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  viewMode?: "grid" | "list";
}

export function NoteCard({
  item,
  onEdit,
  onDelete,
  onDragStart,
  viewMode = "grid",
}: NoteCardProps) {
  if (viewMode === "list") {
    return (
      <div
        onDragStart={onDragStart}
        draggable={item.id !== undefined}
        className="group relative flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-bg-card hover:border-border-card transition-all cursor-pointer"
      >
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-text-secondary">
          <FileText size={16} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="text-[13px] text-text-primary truncate group-hover:text-accent transition-colors">
            {item.title || "Untitled"}
          </div>
          {item.description && (
            <div className="text-[10px] text-text-secondary truncate opacity-60">
              {item.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1 hover:text-accent text-text-secondary transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1 hover:text-danger text-text-secondary transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      onDragStart={onDragStart}
      draggable={item.id !== undefined}
      className="w-[200px] h-[50px] glass group relative p-2 rounded-xl border transition-all duration-300 backdrop-blur-md overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 bg-bg-card border-border-card hover:border-accent min-h-[160px]"
    >
      <div className="flex items-start gap-3 w-full relative z-10">
        <div className="w-9 h-9 border border-border-card rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 bg-accent/10 text-accent">
          <FileText size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-text-primary truncate transition-colors group-hover:text-accent mb-0.5">
            {item.title || "Untitled"}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-text-secondary font-medium tracking-wide">
              NOTE
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 w-full relative z-10">
        {item.description && (
          <p className="text-[11px] text-text-secondary/80 leading-relaxed px-1">
            {item.description}
          </p>
        )}
      </div>

      <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity translate-x-1/4 translate-y-1/4">
        <FileText size={140} />
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border border-border-card text-text-secondary hover:bg-accent hover:border-accent hover:text-white transition-all shadow-sm"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border border-border-card text-text-secondary hover:bg-danger hover:border-danger hover:text-white transition-all shadow-sm"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
