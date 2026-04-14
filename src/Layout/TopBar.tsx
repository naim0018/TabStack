import React, { useRef } from "react";
import { Search, Plus, Bell, Folder } from "lucide-react";
import { GoogleMenu } from "@/common/GoogleMenu";

interface TopBarProps {
  onSearch: (query: string) => void;
  onViewValues: () => void;
  viewMode: "feed" | "tabs";
  onCreate: (type: "bookmark" | "folder") => void;
  onAddReminder: () => void;
  tabCount: number;
  hasBackground?: boolean;
}

export function TopBar({
  onSearch,
  onViewValues,
  viewMode,
  onCreate,
  onAddReminder,
  tabCount,
  hasBackground,
  showSearch = true,
  showActions = true,
  showLogo = true,
}: TopBarProps & { showSearch?: boolean; showActions?: boolean; showLogo?: boolean }) {
  
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex items-center ${(!showSearch && !showLogo) ? 'justify-end' : 'justify-between'} w-full`}>
        {/* LEFT SECTION: GOOGLE SEARCH BAR */}
        {showSearch && (
          <div className="flex items-center gap-6 flex-1 max-w-xl">
            <div className="relative group w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                <Search size={20} />
              </div>
  
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
                className="w-full h-[54px] pl-12 pr-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[14px] text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-accent/40 focus:bg-accent/5 transition-all shadow-xl backdrop-blur-md"
              />
  
              <button 
                onClick={() => {
                  const val = inputRef.current?.value;
                  if (val) window.open(`https://www.google.com/search?q=${encodeURIComponent(val)}`, '_blank');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-accent/10 border border-transparent hover:border-accent/20 rounded-xl transition-all"
                title="Search Google"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.643h6.458c-.279 1.504-1.127 2.778-2.403 3.633v3.02h3.892c2.276-2.096 3.587-5.183 3.587-8.841z" fill="#4285F4"/>
                  <path d="M12 24c3.24 0 5.957-1.074 7.942-2.907l-3.892-3.02c-1.074.72-2.448 1.146-4.05 1.146-3.127 0-5.774-2.112-6.721-4.952H1.286v3.116C3.25 21.288 7.375 24 12 24z" fill="#34A853"/>
                  <path d="M5.279 14.267c-.237-.708-.372-1.464-.372-2.267 0-.803.135-1.56.372-2.267V6.617H1.286C.466 8.252 0 10.076 0 12c0 1.924.466 3.748 1.286 5.383l3.993-3.116z" fill="#FBBC05"/>
                  <path d="M12 4.756c1.762 0 3.344.606 4.587 1.794l3.442-3.442C17.957 1.173 15.24 0 12 0 7.375 0 3.25 2.712 1.286 6.617l3.993 3.116c.947-2.84 3.594-4.952 6.721-4.952z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* LOGO SECTION */}
        {showLogo && (
          <div className="flex-1 flex justify-center">
             <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-text-primary opacity-90 drop-shadow-lg" fill="currentColor">
                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
             </div>
          </div>
        )}

        {/* RIGHT SECTION: ACTIONS (ICON ONLY) */}
        {showActions && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCreate("bookmark")}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-xl backdrop-blur-md"
                title="Add Bookmark"
              >
                <Plus size={22} className="text-accent group-hover:scale-110 transition-transform" />
              </button>
  
              <button
                onClick={() => onCreate("folder")}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-xl backdrop-blur-md"
                title="New Folder"
              >
                <Folder size={22} className="text-accent group-hover:scale-110 transition-transform" />
              </button>
  
              <button
                onClick={onAddReminder}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary group shadow-xl backdrop-blur-md"
                title="Add Reminder"
              >
                <Bell size={22} className="text-accent group-hover:scale-110 transition-transform" />
              </button>
            </div>
  
            <div className="h-8 w-px bg-white/10 mx-2" />
  
            <GoogleMenu />
          </div>
        )}
    </div>
  );
}
