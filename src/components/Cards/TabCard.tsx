import React from "react";
import { X } from "lucide-react";

interface TabCardProps {
  item: any;
  onClose?: () => void;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  viewMode?: "grid" | "list";
}

export function TabCard({
  item,
  onClose,
  onClick,
  onDragStart,
  viewMode = "grid",
}: TabCardProps) {
  const favUrl =
    item.favIconUrl ||
    (item.url && item.url !== "about:blank"
      ? `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`
      : null);

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        onDragStart={onDragStart}
        draggable={item.id !== undefined}
        className="group relative flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-bg-card hover:border-border-card transition-all cursor-pointer bg-bg-card/30"
      >
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-text-secondary">
          {favUrl ? (
            <img src={favUrl} alt="" className="w-4 h-4 object-contain" />
          ) : (
            <div className="w-3 h-3 rounded-full border border-currentColor opacity-50" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="text-[13px] text-text-primary truncate group-hover:text-accent transition-colors">
            {item.title || "Untitled"}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="p-1 hover:text-danger text-text-secondary transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDragStart={onDragStart}
      draggable={item.id !== undefined}
      className="w-[200px] h-[50px] glass group relative p-2 rounded-xl border transition-all duration-300 backdrop-blur-md overflow-hidden min-h-[60px] hover:border-accent/40 bg-bg-card/50"
    >
      <div className="flex items-start gap-3 w-full relative z-10">
        <div className="w-9 h-9 border border-border-card rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 bg-border-card/20 text-text-secondary">
          {favUrl ? (
            <img src={favUrl} alt="" className="w-5 h-5 object-contain" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-currentColor" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-text-primary truncate transition-colors group-hover:text-accent mb-0.5">
            {item.title || "Untitled"}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-text-secondary font-medium tracking-wide">
              OPEN TAB
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border border-border-card text-text-secondary hover:bg-danger hover:border-danger hover:text-white transition-all shadow-sm"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
