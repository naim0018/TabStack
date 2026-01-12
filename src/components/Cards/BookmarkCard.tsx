import React from "react";
import { ExternalLink, Copy, Check, Edit2, Trash2 } from "lucide-react";

interface BookmarkCardProps {
  item: any;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  viewMode?: "grid" | "list";
}

export function BookmarkCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onDragStart,
  viewMode = "grid",
}: BookmarkCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url) {
      navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hostname = item.url ? new URL(item.url || "about:blank").hostname : "";
  const favUrl = item.url
    ? `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`
    : null;

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        onDragStart={onDragStart}
        draggable={item.id !== undefined}
        className="group relative flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-bg-card hover:border-border-card transition-all cursor-pointer"
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
          {item.description && (
            <div className="text-[10px] text-text-secondary truncate opacity-60">
              {item.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.url && (
            <button
              onClick={handleCopy}
              className="p-1 hover:text-accent text-text-secondary transition-colors"
              title="Copy"
            >
              <Copy size={12} />
            </button>
          )}
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
      onClick={onClick}
      onDragStart={onDragStart}
      draggable={item.id !== undefined}
      className="w-[200px] h-auto glass group relative p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5 bg-bg-card border-border-card hover:border-accent group"
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
            {hostname ? (
              <>
                <span className="text-[10px] text-text-secondary truncate">
                  {hostname}
                </span>
                <ExternalLink
                  size={12}
                  className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              </>
            ) : (
              <span className="text-[10px] text-text-secondary font-medium tracking-wide">
                BOOKMARK
              </span>
            )}
          </div>
        </div>
      </div>

      {(item.dateAdded || item.description) && (
        <div className="mt-3 flex-col gap-2 w-full relative z-10 hidden group-hover:flex">
          {item.description && (
            <p className="text-[11px] text-text-secondary/80 leading-relaxed px-1 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.dateAdded && !item.description && (
            <div className="flex items-center gap-1.5 text-[9px] text-text-secondary/40 uppercase tracking-widest mt-1">
              <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
        {item.url && (
          <button
            onClick={handleCopy}
            className={`w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border transition-all shadow-sm ${
              copied
                ? "text-accent border-accent"
                : "border-border-card text-text-secondary hover:bg-accent hover:border-accent hover:text-white"
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
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
