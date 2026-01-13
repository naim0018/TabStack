import React, { useRef } from "react";
import { Search, Plus, Bell, Layout, Grid, Folder } from "lucide-react";
import { GoogleMenu } from "./GoogleMenu";

interface TopBarProps {
  onSearch: (query: string) => void;
  onViewValues: () => void; // Toggle between feed/tabs
  viewMode: "feed" | "tabs";
  onCreate: (type: "bookmark" | "folder") => void;
  onAddReminder: () => void;
  tabCount: number;
  hasBackground?: boolean;
}

  /* 
   * TopBar Component
   * 
   * This component renders the main top navigation bar of the application.
   * It contains the Google Search bar on the left and various action buttons on the right.
   */
  export function TopBar({
    onSearch,      // (Unused in current implementation) Callback for internal search
    onViewValues,  // Function to toggle between Feed and Tabs view
    viewMode,      // Current view mode state ('feed' | 'tabs')
    onCreate,      // Function to open modal for creating Bookmarks/Folders
    onAddReminder, // Function to open modal for creating Reminders
    tabCount,      // (Unused in visual) Number of active tabs
    hasBackground,
  }: TopBarProps) {
    
    // Reference to the search input element to access its value directly
    const inputRef = useRef<HTMLInputElement>(null);
  
    return (
      /* Main Header Container - Fixed at top, blurred background */
      <header className={`h-[74px] px-8 sticky top-0 z-[50] flex items-center justify-between ${hasBackground ? 'glass !rounded-none !border-x-0 !border-t-0 !shadow-none' : 'bg-bg-header border-b border-border-card backdrop-blur-md'}`}>
        <div className="w-full max-w-[1680px] mx-auto flex items-center h-full">
          
          {/* =================================================================
              LEFT SECTION: GOOGLE SEARCH BAR
              - Replaces legacy navigation links
              - Performs a Google search in a new tab
             ================================================================= */}
          <div className="flex items-center gap-6 mr-10 flex-1 max-w-xl">
            <div className="relative group w-full">
              
              {/* Search Icon (Decorative) */}
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                <Search size={18} />
              </div>
  
              {/* Search Input Field 
                  - Listens for 'Enter' key to trigger search 
                  - Updates styling on focus
              */}
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Google or type a URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value;
                    if (val) window.open(`https://www.google.com/search?q=${encodeURIComponent(val)}`, '_blank');
                  }
                }}
                className="w-full h-[46px] pl-11 pr-14 bg-bg-card border border-border-card rounded-2xl text-[14px] text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-accent/40 focus:bg-accent/5 transition-all shadow-sm"
              />
  
              {/* Google Search Button (Icon)
                  - Clicking this manually triggers the search using inputRef value
              */}
              <button 
                onClick={() => {
                  const val = inputRef.current?.value;
                  if (val) window.open(`https://www.google.com/search?q=${encodeURIComponent(val)}`, '_blank');
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-bg-card hover:bg-accent/10 border border-transparent hover:border-accent/20 rounded-xl transition-all group/btn"
                title="Search Google"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.643h6.458c-.279 1.504-1.127 2.778-2.403 3.633v3.02h3.892c2.276-2.096 3.587-5.183 3.587-8.841z" fill="#4285F4"/>
                  <path d="M12 24c3.24 0 5.957-1.074 7.942-2.907l-3.892-3.02c-1.074.72-2.448 1.146-4.05 1.146-3.127 0-5.774-2.112-6.721-4.952H1.286v3.116C3.25 21.288 7.375 24 12 24z" fill="#34A853"/>
                  <path d="M5.279 14.267c-.237-.708-.372-1.464-.372-2.267 0-.803.135-1.56.372-2.267V6.617H1.286C.466 8.252 0 10.076 0 12c0 1.924.466 3.748 1.286 5.383l3.993-3.116z" fill="#FBBC05"/>
                  <path d="M12 4.756c1.762 0 3.344.606 4.587 1.794l3.442-3.442C17.957 1.173 15.24 0 12 0 7.375 0 3.25 2.712 1.286 6.617l3.993 3.116c.947-2.84 3.594-4.952 6.721-4.952z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
          </div>
  
          {/* Flexible Spacer */}
          <div className="flex-1" />
  
          {/* =================================================================
              RIGHT SECTION: ACTIONS & MENU
             ================================================================= */}
          <div className="flex items-center gap-4">
            
            {/* Quick Actions (Add Bookmark / Folder / Reminder) */}
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => onCreate("bookmark")}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
                title="Add Bookmark"
              >
                <Plus
                  size={20}
                  className="text-accent group-hover:scale-110 transition-transform"
                />
                <span className="text-[12px] text-text-primary font-medium uppercase tracking-widest hidden sm:inline">
                  Add Bookmark
                </span>
              </button>
  
              <button
                onClick={() => onCreate("folder")}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
                title="New Folder"
              >
                <Folder
                  size={20}
                  className="text-accent group-hover:scale-110 transition-transform"
                />
                <span className="text-[12px] text-text-primary font-medium uppercase tracking-widest hidden sm:inline">
                  New Folder
                </span>
              </button>
  
              <button
                onClick={onAddReminder}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
                title="Add Reminder"
              >
                <Bell
                  size={20}
                  className="text-accent group-hover:scale-110 transition-transform"
                />
                <span className="text-[12px] text-text-primary font-medium uppercase tracking-widest hidden sm:inline">
                  Add Reminder
                </span>
              </button>
            </div>
  
            {/* Vertical Divider */}
            <div className="h-8 w-px bg-border-card " />
  
            {/* View Mode Toggle (Grid vs Tabs) */}
            {/* <button
              onClick={onViewValues}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-sm"
            >
              {viewMode === "feed" ? <Grid size={18} className="text-accent" /> : <Layout size={18} className="text-accent" />}
              <span className="text-[12px] text-accent font-bold uppercase tracking-widest hidden sm:inline">
                {viewMode === "feed" ? "Grid" : "Tabs"}
              </span>
            </button> */}
  
            {/* Google Apps Menu */}
            <GoogleMenu />
          </div>
        </div>
      </header>
    );
  }
