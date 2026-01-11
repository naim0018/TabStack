import { useState } from "react";
import { Card } from "../components/Card";
import { Bell, Plus, ExternalLink } from "lucide-react";
import { Settings } from "../types";

interface DashboardProps {
  settings: Settings;
  onToggleClockMode: () => void;
  reminders: any[];
  now: number;
  topSites: any[];
  onEditReminder: (r: any) => void;
  onDeleteReminder: (id: string) => void;
  onCreateReminder: () => void;
}

export function DashboardView({
  
  settings,
  onToggleClockMode,
  reminders,
  now,
  topSites,
  onEditReminder,
  onDeleteReminder,
  onCreateReminder,
}: DashboardProps) {
  const [quickLinks, setQuickLinks] = useState<
    Array<{ name: string; url: string; icon?: string }>
  >([]);
  const [showAddLink, setShowAddLink] = useState(false);

  const handleAddLink = () => {
    const name = prompt("Link Name:");
    const url = prompt("Link URL:");
    if (name && url) {
      setQuickLinks([...quickLinks, { name, url }]);
    }
    setShowAddLink(false);
  };

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

          {/* Quick Links Section */}
          <div className="glass border border-border-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-text-primary">
                <ExternalLink size={16} className="text-accent" /> Quick Links
              </h2>
              <button
                onClick={handleAddLink}
                className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-all flex items-center gap-1"
              >
                <Plus size={14} /> Add Link
              </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {/* Display custom quick links */}
              {quickLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-bg-card border border-transparent hover:border-accent/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img
                      src={
                        link.icon ||
                        `https://www.google.com/s2/favicons?domain=${
                          new URL(link.url).hostname
                        }&sz=64`
                      }
                      alt={link.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-text-primary text-center truncate w-full">
                    {link.name}
                  </span>
                </a>
              ))}

              {/* Display top sites if no custom links */}
              {quickLinks.length === 0 &&
                topSites.slice(0, 10).map((site: any, idx: number) => (
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
      </div>
    </div>
  );
}
