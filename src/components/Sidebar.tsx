import React from 'react';
import { LayoutGrid, Plus, Moon, Sun, ChevronLeft, ChevronRight, Folder, FileText, Bell, Trash2, Edit2 } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  theme: 'dark' | 'light';
  boards: { id: string; name: string }[];
  folders?: any[]; // Recursive folders
  activeBoardId: string;
  activeTabId?: string;
  activeSidebarItem: string;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onSelectBoard: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onSelectNotes: () => void;
  onSelectReminders: () => void;
  onSelectSpace: () => void;
  onCreateBoard: () => void;
  onEditBoard?: (id: string, name: string) => void;
  onDeleteBoard?: (id: string) => void;
  onSearch?: (query: string) => void;
}

import { Search } from 'lucide-react';

export function Sidebar({
  collapsed,
  theme,
  boards,
  folders = [],
  activeBoardId,
  activeTabId,
  activeSidebarItem,
  onToggleSidebar,
  onToggleTheme,
  onSelectBoard,
  onSelectFolder,
  onSelectNotes,
  onSelectReminders,
  onSelectSpace,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
  onSearch,
}: SidebarProps) {
  return (
    <aside
      className={`
        bg-bg-sidebar border-r border-border-card flex flex-col flex-shrink-0 
        transition-all duration-300 ease-in-out h-full
        ${collapsed ? 'w-[72px] p-2' : 'w-[260px] p-6'}
      `}
    >
      <div className={`flex items-center justify-between mb-8 ${collapsed ? 'flex-col gap-4 justify-center mb-6' : ''}`}>
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-full justify-center gap-0' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-accent/10">
            <LayoutGrid size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-black whitespace-nowrap tracking-tight transition-opacity duration-200 bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
              TabStack
            </h1>
          )}
        </div>
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg text-text-secondary hover:bg-border-card hover:text-text-primary transition-all ${collapsed ? 'mx-auto mt-2' : ''}`}
          title="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!collapsed && onSearch && (
        <div className="mb-6 px-1 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="relative group">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" 
            />
            <input
              type="text"
              placeholder="Search library..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-bg border border-border-card rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-text-primary outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 no-scrollbar pb-4">
          <div className={`text-[10px] uppercase font-bold text-text-secondary/60 mb-2 px-3 tracking-widest ${!collapsed ? '' : 'hidden'}`}>Library</div>
          {boards.map((board) => (
            <div key={board.id} className="group relative flex items-center gap-0.5">
              <button
                onClick={() => onSelectBoard(board.id)}
                className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
                    ${collapsed ? 'justify-center p-2.5' : ''}
                    ${
                    activeSidebarItem === 'bookmarks' && activeBoardId === board.id && (activeTabId === 'tabs' || !activeTabId)
                        ? 'bg-border-card text-text-primary shadow-sm'
                        : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
                    }
                `}
                title={board.name}
              >
                <Folder size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate flex-1 text-left">{board.name}</span>}
              </button>
              
              {!collapsed && onEditBoard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newName = prompt("Rename Board:", board.name);
                    if (newName) onEditBoard(board.id, newName);
                  }}
                  className="absolute right-9 p-1.5 rounded-md text-text-secondary opacity-0 group-hover:opacity-100 hover:bg-border-card hover:text-text-primary transition-all"
                  title="Rename Board"
                >
                  <Edit2 size={14} />
                </button>
              )}

              {!collapsed && onDeleteBoard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBoard(board.id);
                  }}
                  className="absolute right-2 p-1.5 rounded-md text-text-secondary opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                  title="Delete Board"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={onSelectNotes}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all w-full
              ${collapsed ? 'justify-center p-2.5' : ''}
              ${
                activeSidebarItem === 'notes'
                  ? 'bg-border-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
              }
            `}
            title="Notes"
          >
            <FileText size={18} className="flex-shrink-0" />
            {!collapsed && <span>Notes</span>}
          </button>

          <button
            onClick={onSelectReminders}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all w-full
              ${collapsed ? 'justify-center p-2.5' : ''}
              ${
                activeSidebarItem === 'reminders'
                  ? 'bg-border-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
              }
            `}
            title="Reminders"
          >
            <Bell size={18} className="flex-shrink-0" />
            {!collapsed && <span>Reminders</span>}
          </button>
        </div>

        <div className="h-px bg-border-card my-4 mx-0" />

        <button
          onClick={onCreateBoard}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
            text-text-secondary hover:bg-border-card hover:text-text-primary
            ${collapsed ? 'justify-center p-2.5' : ''}
          `}
          title="Create Board"
        >
          <Plus size={18} className="flex-shrink-0" />
          {!collapsed && <span>New Board</span>}
        </button>

        <button
          onClick={onSelectSpace}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
            ${collapsed ? 'justify-center p-2.5' : ''}
            ${
              activeSidebarItem === 'spaces'
                ? 'bg-border-card text-text-primary shadow-sm'
                : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
            }
          `}
          title="Spaces"
        >
          <LayoutGrid size={18} className="flex-shrink-0" />
          {!collapsed && <span>Spaces</span>}
        </button>
      </nav>

      <div className="mt-auto pt-4 border-t border-border-card">
        <button
          onClick={onToggleTheme}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
            text-text-secondary hover:bg-border-card hover:text-text-primary
            ${collapsed ? 'justify-center p-2.5' : ''}
          `}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>}
        </button>
      </div>
    </aside>
  );
}
