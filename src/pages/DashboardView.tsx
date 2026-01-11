import { Card } from "../components/Card";
import { Bell, Plus, ExternalLink, Trash2, Edit2 } from "lucide-react";
import { Settings, BookmarkItem } from "../types";

interface DashboardProps {
  settings: Settings;
  onToggleClockMode: () => void;
  reminders: any[];
  quickLinks: BookmarkItem[];
  now: number;
  topSites: any[];
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
  quickLinks,
  now,
  topSites,
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
          <div className="glass border border-border-card rounded-3xl p-6 min-h-[400px]">
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

            {reminders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reminders.map((reminder: any) => (
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
            )}
          </div>

          {/* Most Visited Sites */}
          {topSites.length > 0 && (
            <div className="glass border border-border-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-text-primary">
                  <ExternalLink size={16} className="text-accent" /> Most Visited
                </h2>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {topSites.slice(0, 10).map((site: any, idx: number) => (
                  <a
                    key={idx}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-bg-card border border-transparent hover:border-accent/40 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${
                          site.url || ""
                        }&sz=64`}
                        alt={site.title}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-text-primary text-center truncate w-full">
                      {site.title}
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
                    e.preventDefault();
                    onEditQuickLink(link);
                  }}
                  className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-accent transition-colors shadow-lg"
                >
                  <Edit2 size={10} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
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
