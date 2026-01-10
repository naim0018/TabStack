import React from 'react';
import { FileText, Bell, LayoutGrid } from 'lucide-react';
import { Settings } from '../types';

interface SpacesViewProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function SpacesView({ settings, setSettings }: SpacesViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black text-text-primary tracking-tight">
          Your Spaces
        </h2>
        <div className="h-px flex-1 bg-border-card mx-6"></div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 px-2">
        <div
          onClick={() =>
            setSettings((s) => ({
              ...s,
              activeSidebarItem: "notes",
            }))
          }
          className="glass h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
            <FileText size={120} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">
              Notes
            </span>
            <div className="text-xs text-text-secondary mt-1 font-medium">
              View and manage your notes
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setSettings((s) => ({
              ...s,
              activeSidebarItem: "reminders",
            }))
          }
          className="glass h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
            <Bell size={120} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bell size={20} />
          </div>
          <div>
            <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">
              Reminders
            </span>
            <div className="text-xs text-text-secondary mt-1 font-medium">
              Stay on top of your tasks
            </div>
          </div>
        </div>

        {settings.boards.map((board) => (
          <div
            key={board.id}
            onClick={() =>
              setSettings((s) => ({
                ...s,
                activeBoardId: board.id,
                activeSidebarItem: "bookmarks",
              }))
            }
            className="glass h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
              <LayoutGrid size={120} />
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutGrid size={20} />
            </div>
            <div>
              <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">
                {board.name}
              </span>
              <div className="text-xs text-text-secondary mt-1 font-medium">
                Custom Board Space
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
