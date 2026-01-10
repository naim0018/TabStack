import React from "react";
import { Search, Plus, Bell, Layout, Grid, Folder } from "lucide-react";
import { GoogleMenu } from "./GoogleMenu";

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
    <header className="h-[74px] px-8 border-b border-border-card bg-bg-header backdrop-blur-md sticky top-0 z-[50] flex items-center justify-between">
      <div className="w-full max-w-[1680px] mx-auto flex items-center h-full">
        {/* Navigation Links */}
        <div className="flex items-center gap-6 mr-10">
          <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-text-primary hover:text-accent transition-colors">Gmail</a>
          <a href="https://google.com/imghp" target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-text-primary hover:text-accent transition-colors">Images</a>
        </div>

        <div className="flex-1" />

        {/* Actions & Google Items */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={() => onCreate("bookmark")}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
              title="Add Bookmark"
            >
              <Plus
                size={18}
                className="text-accent group-hover:scale-110 transition-transform"
              />
            </button>

            <button
              onClick={() => onCreate("folder")}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
              title="New Folder"
            >
              <Folder
                size={18}
                className="text-accent group-hover:scale-110 transition-transform"
              />
            </button>

            <button
              onClick={onAddReminder}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
              title="Add Reminder"
            >
              <Bell
                size={18}
                className="text-accent group-hover:scale-110 transition-transform"
              />
            </button>
          </div>

          <div className="h-8 w-px bg-border-card/60" />

          <button
            onClick={onViewValues}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
          >
            {viewMode === "feed" ? <Grid size={18} className="text-accent" /> : <Layout size={18} className="text-accent" />}
            <span className="text-[12px] font-bold uppercase tracking-widest hidden sm:inline">
              {viewMode === "feed" ? "Grid" : "Tabs"}
            </span>
          </button>

          <div className="h-8 w-px bg-border-card/60 mr-2" />

          <GoogleMenu />
        </div>
      </div>
    </header>
  );
}
