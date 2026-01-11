import React from "react";
import { Bell, Clock, Edit2, Trash2, Copy, Check } from "lucide-react";

interface ReminderCardProps {
  item: any;
  now: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  viewMode?: "grid" | "list";
}

export function ReminderCard({
  item,
  now,
  onEdit,
  onDelete,
  onDragStart,
  viewMode = "grid",
}: ReminderCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url && item.url !== "about:blank") {
      navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardClick = () => {
    if (item.url && item.url !== "about:blank") {
      window.location.href = item.url;
    }
  };

  // Countdown logic
  let countdownText = "";
  let isPast = false;
  let isUrgent = false;
  if (item.deadline) {
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

  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        onDragStart={onDragStart}
        draggable={item.id !== undefined}
        className="group relative flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-bg-card hover:border-border-card transition-all cursor-pointer"
      >
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-text-secondary">
          <Bell
            size={16}
            className={isPast || isUrgent ? "text-danger" : "text-accent"}
          />
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
          {item.url && item.url !== "about:blank" && (
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
      onClick={handleCardClick}
      onDragStart={onDragStart}
      draggable={item.id !== undefined}
      className={`w-[250px] h-[50px] glass group relative p-2 rounded-xl border transition-all duration-300 backdrop-blur-md overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 min-h-[140px] ${
        isPast || isUrgent
          ? "bg-danger/5 border-danger/20 hover:border-danger/40"
          : "bg-bg-card border-border-card hover:border-accent"
      }`}
    >
      <div className="flex items-start gap-3 w-full relative z-10">
        <div className={`w-9 h-9 border border-border-card rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
          isPast || isUrgent ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent"
        }`}>
          <Bell size={18} className={isPast ? "animate-pulse" : ""} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-text-primary truncate transition-colors group-hover:text-accent mb-0.5">
            {item.title || "Untitled"}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-text-secondary font-medium tracking-wide">
              REMINDER
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 w-full relative z-10">
        {item.deadline && (
          <div className={`px-3 py-2.5 rounded-xl flex flex-col gap-2 bg-gradient-to-br transition-all duration-300 ${
            isPast || isUrgent
              ? "from-danger/10 to-danger/5 border-danger/20 shadow-sm shadow-danger/5"
              : "from-accent/10 to-accent/5 border-accent/20 shadow-sm shadow-accent/5"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <Clock size={12} className={isPast || isUrgent ? "text-danger" : "text-accent"} />
                <span className={isPast || isUrgent ? "text-danger" : "text-accent"}>
                  {isPast ? "Expired" : "Deadline"}
                </span>
              </div>
              {countdownText && (
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  isPast || isUrgent ? "text-danger border-danger/30 bg-danger/10 animate-pulse" : "text-accent border-accent/30 bg-accent/10"
                }`}>
                  {countdownText}
                </div>
              )}
            </div>
            <div className={`text-[12px] font-bold flex items-center gap-2 ${
              isPast || isUrgent ? "text-danger/90" : "text-text-primary/80"
            }`}>
              {new Date(item.deadline).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>
        )}

        {item.description && (
          <p className="text-[11px] text-text-secondary/80 leading-relaxed px-1">
            {item.description}
          </p>
        )}
      </div>

      <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity translate-x-1/4 translate-y-1/4">
        <Bell size={140} />
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
        {item.url && item.url !== "about:blank" && (
          <button
            onClick={handleCopy}
            className={`w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border transition-all shadow-sm ${
              copied ? "text-accent border-accent" : "border-border-card text-text-secondary hover:bg-accent hover:border-accent hover:text-white"
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border border-border-card text-text-secondary hover:bg-accent hover:border-accent hover:text-white transition-all shadow-sm"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card border border-border-card text-text-secondary hover:bg-danger hover:border-danger hover:text-white transition-all shadow-sm"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
