import { Card } from "../components/Card";
import { Bell, Plus, ExternalLink, Trash2, Edit2, Clock } from "lucide-react";
import { Settings, BookmarkItem } from "../types";

interface DashboardProps {
  settings: Settings;
  onToggleClockMode: () => void;
  reminders: any[];
  quickLinks: BookmarkItem[];
  now: number;
  topSites: any[];
  history: chrome.history.HistoryItem[];
  onEditReminder: (r: any) => void;
  onDeleteReminder: (id: string) => void;
  onCreateReminder: () => void;
  onAddQuickLink: () => void;
  onEditQuickLink: (link: BookmarkItem) => void;
  onDeleteQuickLink: (id: string) => void;
}

export function DashboardView({
  settings,
  onToggleClockMode,
  reminders,
  quickLinks = [],
  now,
  topSites = [],
  history = [],
  onEditReminder,
  onDeleteReminder,
  onCreateReminder,
  onAddQuickLink,
  onEditQuickLink,
  onDeleteQuickLink,
}: DashboardProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
          {/* Active Reminders */}
          <div className="glass border border-border-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-text-primary">
                <Bell size={16} className="text-accent" /> Active Reminders
              </h2>
              <button
                onClick={onCreateReminder}
                className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-all"
              >
                + Add New
              </button>
            </div>

            {(() => {
              const activeReminders = reminders
                .filter((r) => !r.deadline || new Date(r.deadline).getTime() > now)
                .sort((a, b) => {
                  if (!a.deadline) return 1;
                  if (!b.deadline) return -1;
                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                });

              return activeReminders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeReminders.map((reminder: any) => (
                    <Card
                      key={reminder.id}
                      item={reminder}
                      now={now}
                      onEdit={() => onEditReminder(reminder)}
                      onDelete={() => onDeleteReminder(reminder.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary opacity-50">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p>No active reminders</p>
                </div>
              );
            })()}
          </div>

          {/* Most Visited Sites (Compact) */}
          {topSites?.length > 0 && (
            <div className="glass border border-border-card rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2 text-text-secondary">
                  <ExternalLink size={14} className="text-accent/60" /> Most Visited
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {topSites.slice(0, 10).map((site: any, idx: number) => (
                  <a
                    key={idx}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all group max-w-[160px]"
                    title={site.title}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${
                        site.url || ""
                      }&sz=32`}
                      alt=""
                      className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-[11px] font-bold text-text-primary truncate">
                      {site.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Last Visited Sites (Compact) */}
          {history?.length > 0 && (
            <div className="glass border border-border-card rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2 text-text-secondary">
                  <Clock size={14} className="text-accent/60" /> Recently Visited ({history.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {history.map((item: any, idx: number) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card/50 border border-border-card/50 hover:border-accent/30 hover:bg-accent/5 transition-all group overflow-hidden"
                    title={item.title || item.url}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${
                        item.url || ""
                      }&sz=32`}
                      alt=""
                      className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    />
                    <span className="text-[10px] font-medium text-text-secondary group-hover:text-text-primary truncate">
                      {item.title || "Untitled"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

      </div>

      {/* macOS Style Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-dock border border-white/10 rounded-3xl p-2 px-4 flex items-center gap-3 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-500">
          {/* Quick Links */}
          {quickLinks.map((link) => (
            <div key={link.id} className="relative group/ql">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm border border-white/5 overflow-hidden">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${
                      link.url || ""
                    }&sz=128`}
                    alt={link.title}
                    className="w-10 h-10 object-contain drop-shadow-md"
                  />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-bold opacity-0 group-hover/ql:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 translate-y-2 group-hover/ql:translate-y-0 duration-300">
                  {link.title}
                </div>
              </a>
              
              {/* Quick Actions */}
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/ql:opacity-100 transition-opacity scale-75 group-hover/ql:scale-100 duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditQuickLink(link);
                  }}
                  className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-accent transition-colors shadow-lg"
                >
                  <Edit2 size={10} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQuickLink(link.id);
                  }}
                  className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-red-500 transition-colors shadow-lg"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}

          {/* Divider if we have custom links */}
          {quickLinks.length > 0 && (
            <div className="w-px h-10 bg-white/10 mx-1 self-center" />
          )}

          {/* Fallback to Top Sites if empty, or just show Add button */}
          {quickLinks.length === 0 && topSites.slice(0, 5).map((site, idx) => (
            <div key={idx} className="relative group/ql">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm border border-white/5 overflow-hidden">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${
                      site.url || ""
                    }&sz=128`}
                    alt={site.title}
                    className="w-10 h-10 object-contain drop-shadow-md opacity-70 group-hover:opacity-100"
                  />
                </div>
              </a>
            </div>
          ))}

          {/* Add Link Button */}
          <button
            onClick={onAddQuickLink}
            className="w-14 h-14 rounded-[1.2rem] bg-white/10 flex items-center justify-center hover:bg-accent/20 transition-all duration-300 group border border-dashed border-white/20 hover:border-accent/50"
          >
            <Plus size={24} className="text-white opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}
