import React from 'react';
import { Search, Plus, Bell, Layout, Grid } from 'lucide-react';

interface TopBarProps {
  onSearch: (query: string) => void;
  onViewValues: () => void; // Toggle between feed/tabs
  viewMode: 'feed' | 'tabs';
  onCreate: (type: 'bookmark' | 'folder') => void;
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
        <div className="flex items-center gap-3">
          <button
            onClick={onAddReminder}
            className="p-2 rounded-md text-text-secondary hover:bg-border-card hover:text-text-primary transition-colors"
            title="Add Reminder"
          >
            <Bell size={20} />
          </button>

          <button
            onClick={() => onCreate('bookmark')}
            className="p-2 rounded-md text-text-secondary hover:bg-border-card hover:text-text-primary transition-colors"
            title="Add New"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={onViewValues}
            className="p-2 rounded-md text-text-secondary hover:bg-border-card hover:text-text-primary transition-colors"
            title="Switch View"
          >
            {viewMode === 'feed' ? <Grid size={18} /> : <Layout size={18} />}
          </button>

          <div className="h-6 w-px bg-border-card mx-1" />

          <div className="px-3 py-1.5 bg-bg-card border border-border-card rounded-full text-[13px] font-medium text-text-primary flex items-center gap-2">
            <span>{tabCount} Tabs</span>
          </div>
        </div>
      </div>
    </header>
  );
}
