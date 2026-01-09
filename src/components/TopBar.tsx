import React from "react";
import { Search, Plus, Bell, Layout, Grid, Folder } from "lucide-react";

interface TopBarProps {
  onSearch: (query: string) => void;
  onViewValues: () => void; // Toggle between feed/tabs
  viewMode: "feed" | "tabs";
  onCreate: (type: "bookmark" | "folder") => void;
  onAddReminder: () => void;
  tabCount: number;
}

export function TopBar({
  onSearch,
  onViewValues,
  viewMode,
  onCreate,
  onAddReminder,
  tabCount,
}: TopBarProps) {
  return (
    <header className="h-[70px] px-8 border-b border-border-card bg-bg-header backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between h-full">
        {/* Search Area */}
        <div className="flex items-center bg-bg-card border border-border-card rounded-lg px-3 py-2 w-[300px] gap-2 shadow-sm focus-within:ring-2 focus-within:ring-accent/20 transition-shadow">
          <Search size={18} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search tabs, bookmarks..."
            className="bg-transparent border-none outline-none text-text-primary w-full text-sm placeholder:text-text-secondary/60"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCreate("bookmark")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group"
          >
            <Plus
              size={16}
              className="text-accent group-hover:scale-110 transition-transform"
            />
            <span className="text-[11px] font-bold">Bookmark</span>
          </button>

          <button
            onClick={() => onCreate("folder")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group"
          >
            <Folder
              size={16}
              className="text-accent group-hover:scale-110 transition-transform"
            />
            <span className="text-[11px] font-bold">Folder</span>
          </button>

          <button
            onClick={onAddReminder}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group"
          >
            <Bell
              size={14}
              className="text-accent group-hover:scale-110 transition-transform"
            />
            <span className="text-[11px] font-bold">Reminder</span>
          </button>

          <div className="h-6 w-px border border-white/20 bg-border-card mx-2" />

          <button
            onClick={onViewValues}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border-card hover:bg-border-card transition-all text-text-secondary hover:text-text-primary"
            title="Switch View"
          >
            {viewMode === "feed" ? <Grid size={18} /> : <Layout size={18} />}
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {viewMode === "feed" ? "Grid" : "Tabs"}
            </span>
          </button>

          <div className="h-6 w-px border border-white/20 bg-border-card mx-2" />

          <div className="px-3 py-2 bg-bg-card border border-border-card rounded-xl text-[13px] font-medium text-text-primary flex items-center gap-2">
            <span>{tabCount} Active Tabs</span>
          </div>
        </div>
      </div>
    </header>
  );
}
