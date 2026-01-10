import React, { useState } from "react";
import {
  X,
  Edit2,
  Trash2,
  Clock,
  Folder as FolderIcon,
  FileText,
  Bell,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

export interface CardItem {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  favIconUrl?: string; // For tabs
  children?: CardItem[]; // For folders
  description?: string;
  deadline?: string;
  type?: "bookmark" | "folder" | "reminder" | "tab" | "note";
}

interface CardProps {
  item: CardItem;
  isTab?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void; // For tabs
  onDragStart?: (e: React.DragEvent) => void;
  now?: number; // For countdowns
}

export function Card({
  item,
  isTab,
  onClick,
  onEdit,
  onDelete,
  onClose,
  onDragStart,
  now = Date.now(),
}: CardProps) {
  const [copied, setCopied] = useState(false);
  const isFolder = item.children !== undefined || item.type === "folder";
  const isNote = item.type === "note";
  const isReminder = item.type === "reminder" || !!item.deadline;

  // Favicon logic
  const getFavicon = () => {
    if (isTab && item.favIconUrl) return item.favIconUrl;
    if (item.url && item.url !== "about:blank")
      return `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`;
    return null;
  };
  const favUrl = getFavicon();

  let hostname = "";
  try {
    if (item.url && item.url !== "about:blank")
      hostname = new URL(item.url).hostname;
  } catch (e) {}

  // Countdown logic for reminders
  let countdownText = "";
  let isPast = false;
  let isUrgent = false; // < 48 hours
  if (isReminder && item.deadline) {
    const diff = new Date(item.deadline).getTime() - now;
    isPast = diff <= 0;
    isUrgent = diff > 0 && diff < 48 * 60 * 60 * 1000;
    const absDiff = Math.abs(diff);
    const d = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const h = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / 3600000);
    const m = Math.floor((absDiff % 3600000) / 60000);
    const s = Math.floor((absDiff % 60000) / 1000);

    if (d > 0) countdownText = `${d}d ${h}h ${m}m ${s}s`;
    else if (h > 0) countdownText = `${h}h ${m}m ${s}s`;
    else countdownText = `${m}m ${s}s`;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url && item.url !== "about:blank") {
      navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardClick = () => {
    if (isReminder && item.url && item.url !== "about:blank") {
      window.location.href = item.url;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onDragStart={onDragStart}
      draggable={!isTab && item.id !== undefined}
      className={`
        group relative p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden
        ${
          isTab
            ? "min-h-[80px] hover:border-accent/40 bg-bg-card/50"
            : "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
        }
        ${
          isReminder && (isPast || isUrgent)
            ? "bg-danger/5 border-danger/20 hover:border-danger/40"
            : "bg-bg-card border-border-card hover:border-accent"
        }
        ${isNote ? "min-h-[160px]" : isReminder ? "min-h-[140px]" : ""}
      `}
    >
      <div className="flex items-start gap-3 w-full relative z-10">
        <div
          className={`
          w-9 h-9 border border-border-card rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110
          ${
            isFolder
              ? "bg-accent/10 text-accent"
              : isNote
              ? "bg-accent/10 text-accent"
              : isReminder
              ? isPast || isUrgent
                ? "bg-danger/10 text-danger"
                : "bg-accent/10 text-accent"
              : "bg-border-card/20 text-text-secondary"
          }
        `}
        >
          {isFolder ? (
            <FolderIcon size={18} fill="currentColor" fillOpacity={0.2} />
          ) : isNote ? (
            <FileText size={18} />
          ) : isReminder ? (
            <Bell size={18} className={isPast ? "animate-pulse" : ""} />
          ) : favUrl ? (
            <img src={favUrl} alt="" className="w-5 h-5 object-contain" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-currentColor" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`text-base font-semibold text-text-primary truncate transition-colors group-hover:text-accent mb-0.5`}
          >
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
                {isFolder
                  ? "FOLDER"
                  : isNote
                  ? "NOTE"
                  : isReminder
                  ? "REMINDER"
                  : isTab
                  ? "OPEN TAB"
                  : "BOOKMARK"}
              </span>
            )}
          </div>
        </div>
      </div>

      {(item.dateAdded || item.description || item.deadline) && (
        <div className="mt-3 flex flex-col gap-2 w-full relative z-10">
          {isReminder && item.deadline && (
            <div
              className={`
              px-3 py-2.5 rounded-xl flex flex-col gap-2 bg-gradient-to-br transition-all duration-300 border
              ${isPast || isUrgent 
                ? "from-danger/10 to-danger/5 border-danger/20 shadow-sm shadow-danger/5" 
                : "from-accent/10 to-accent/5 border-accent/20 shadow-sm shadow-accent/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  <Clock size={12} className={isPast || isUrgent ? "text-danger" : "text-accent"} />
                  <span className={isPast || isUrgent ? "text-danger" : "text-accent"}>
                    {isPast ? "Expired" : "Deadline"}
                  </span>
                </div>
                {countdownText && (
                  <div
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      isPast || isUrgent
                        ? "text-danger border-danger/30 bg-danger/10 animate-pulse"
                        : "text-accent border-accent/30 bg-accent/10"
                    }`}
                  >
                    {countdownText}
                  </div>
                )}
              </div>
              <div
                className={`text-[12px] font-bold flex items-center gap-2 ${
                  isPast || isUrgent ? "text-danger/90" : "text-text-primary/80"
                }`}
              >
                {new Date(item.deadline).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                })}
              </div>
            </div>
          )}

          {item.description && (
            <p
              className={`
               text-[11px] text-text-secondary/80 leading-relaxed font-medium px-1
               ${isNote || isReminder ? "" : "line-clamp-2"}
             `}
            >
              {item.description}
            </p>
          )}

          {!isReminder && item.dateAdded && (
            <div className="flex items-center gap-1.5 text-[9px] text-text-secondary/40 font-bold uppercase tracking-widest mt-1">
              <span>Added {new Date(item.dateAdded).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Decorative background for highlights */}
      {(isNote || isReminder) && (
        <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity translate-x-1/4 translate-y-1/4">
          {isNote ? <FileText size={140} /> : <Bell size={140} />}
        </div>
      )}

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
        {item.url && item.url !== "about:blank" && (
          <button
            onClick={handleCopy}
            className={`w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border transition-all shadow-sm ${
              copied
                ? "text-accent border-accent"
                : "border-border-card text-text-secondary hover:bg-accent hover:border-accent hover:text-white"
            }`}
            title="Copy Link"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
        {isTab ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border border-border-card text-text-secondary hover:bg-danger hover:border-danger hover:text-white transition-all shadow-sm"
          >
            <X size={14} />
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
